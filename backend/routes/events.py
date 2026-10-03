"""Events endpoints — paginated list, single event lookup, live ingest."""

import hmac
import uuid
from datetime import datetime, timezone

from flask import Blueprint, current_app, jsonify, request

from config import (
    ALLOWED_EVENT_TYPES,
    ALLOWED_SEVERITIES,
    AXELLE_MODE,
    INGEST_API_KEY,
)
from models.event import Event
from services.analyst_workflow_service import InvalidTransitionError, transition_event
from utils.query_params import parse_event_query

events_bp = Blueprint("events", __name__)


def _error(code: str, message: str, status: int):
    return jsonify({"error": {"code": code, "message": message}}), status


@events_bp.route("/events", methods=["GET"])
def get_events():
    """Return paginated, filterable, sortable events.

    Query params:
      page (int, default 1)
      page_size (int, default 20, max 100)
      sort (str: "timestamp" | "severity", default "timestamp")
      severity (str: critical | high | medium | low | info)
      event_type (str: ssh_bruteforce | network_scan | auth_failure | auth_success | sudo_activity)
    """
    query = parse_event_query()
    result = current_app.config["REPOSITORY"].get_events(**query)
    return jsonify(result)


@events_bp.route("/events/ingest", methods=["POST"])
def ingest_event():
    """Receive one real event (live mode only).

    Header:  X-API-Key: <INGEST_API_KEY>
    Body (JSON), required: severity, event_type, host, rule_description
    Body (JSON), optional: timestamp, source_ip, destination_ip, rule_id,
                           attempt_count, mitre, raw_event
    """
    if AXELLE_MODE != "live":
        return _error("WRONG_MODE", "Ingest works only when AXELLE_MODE=live", 409)

    if not INGEST_API_KEY:
        return _error("INGEST_DISABLED", "Set INGEST_API_KEY on the server to enable ingest", 503)

    sent_key = request.headers.get("X-API-Key", "")
    if not hmac.compare_digest(sent_key.encode(), INGEST_API_KEY.encode()):
        return _error("UNAUTHORIZED", "Invalid or missing API key", 401)

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return _error("BAD_REQUEST", "Body must be a JSON object", 400)

    # Required fields
    severity = payload.get("severity")
    event_type = payload.get("event_type")
    host = payload.get("host")
    rule_description = payload.get("rule_description")

    if not isinstance(severity, str) or severity not in ALLOWED_SEVERITIES:
        return _error("BAD_REQUEST", f"severity must be one of {sorted(ALLOWED_SEVERITIES)}", 400)
    if not isinstance(event_type, str) or event_type not in ALLOWED_EVENT_TYPES:
        return _error("BAD_REQUEST", f"event_type must be one of {sorted(ALLOWED_EVENT_TYPES)}", 400)
    if not isinstance(host, str) or not host.strip():
        return _error("BAD_REQUEST", "host is required", 400)
    if not isinstance(rule_description, str) or not rule_description.strip():
        return _error("BAD_REQUEST", "rule_description is required", 400)

    # Timestamp — always stored as timezone-aware UTC ISO string
    raw_ts = payload.get("timestamp")
    if raw_ts is not None:
        if not isinstance(raw_ts, str) or not raw_ts.strip():
            return _error("BAD_REQUEST", "timestamp must be ISO 8601", 400)
        try:
            parsed = datetime.fromisoformat(raw_ts.replace("Z", "+00:00"))
        except ValueError:
            return _error("BAD_REQUEST", "timestamp must be ISO 8601", 400)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        timestamp = parsed.astimezone(timezone.utc).isoformat()
    else:
        timestamp = datetime.now(timezone.utc).isoformat()

    # Optional fields
    attempt_count = payload.get("attempt_count")
    if attempt_count is not None:
        if not isinstance(attempt_count, int) or isinstance(attempt_count, bool) or attempt_count < 0:
            return _error("BAD_REQUEST", "attempt_count must be a non-negative integer", 400)

    mitre = payload.get("mitre")
    if mitre is not None and not isinstance(mitre, dict):
        return _error("BAD_REQUEST", "mitre must be an object", 400)

    raw_event = payload.get("raw_event")
    if raw_event is None:
        raw_event = {}
    elif not isinstance(raw_event, dict):
        return _error("BAD_REQUEST", "raw_event must be an object", 400)

    for field in ("source_ip", "destination_ip", "rule_id"):
        value = payload.get(field)
        if value is not None and not isinstance(value, str):
            return _error("BAD_REQUEST", f"{field} must be a string", 400)

    event = Event(
        id=str(uuid.uuid4()),
        timestamp=timestamp,
        severity=severity,
        event_type=event_type,
        source_ip=payload.get("source_ip"),
        destination_ip=payload.get("destination_ip"),
        host=host.strip(),
        rule_id=str(payload.get("rule_id") or "RL-CUSTOM"),
        rule_description=rule_description.strip(),
        attempt_count=attempt_count,
        mitre=mitre,
        status="new",
        mode="live",
        raw_event=raw_event,
    )

    current_app.config["REPOSITORY"].add_event(event)
    return jsonify(event.to_dict()), 201


@events_bp.route("/events/<event_id>", methods=["GET"])
def get_event(event_id: str):
    """Return a single event by ID."""
    event = current_app.config["REPOSITORY"].get_event_by_id(event_id)
    if not event:
        return (
            jsonify({"error": {"code": "NOT_FOUND", "message": f"Event {event_id} not found"}}),
            404,
        )
    return jsonify(event.to_dict())


@events_bp.route("/events/<event_id>/status", methods=["PATCH"])
def patch_event_status(event_id: str):
    """Apply a valid analyst status transition."""
    payload = request.get_json(silent=True)
    status = payload.get("status") if isinstance(payload, dict) else None
    if not isinstance(status, str):
        return jsonify({"error": {"code": "BAD_REQUEST", "message": "A status is required"}}), 400

    try:
        event = transition_event(current_app.config["REPOSITORY"], event_id, status)
    except KeyError:
        return jsonify({"error": {"code": "NOT_FOUND", "message": f"Event {event_id} not found"}}), 404
    except InvalidTransitionError as error:
        return jsonify({"error": {"code": "CONFLICT", "message": str(error)}}), 409

    return jsonify(event.to_dict())