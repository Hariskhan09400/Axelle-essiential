"""Events endpoints — paginated list and single event lookup."""

from flask import Blueprint, current_app, jsonify, request

from services.analyst_workflow_service import InvalidTransitionError, transition_event
from utils.query_params import parse_event_query

events_bp = Blueprint("events", __name__)


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
