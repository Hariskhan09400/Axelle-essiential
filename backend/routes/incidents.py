"""Incidents endpoint — incident list and detail."""

from datetime import datetime, timezone

from flask import Blueprint, current_app, jsonify, request

import config
from services.analyst_workflow_service import InvalidTransitionError, create_incident

incidents_bp = Blueprint("incidents", __name__)


@incidents_bp.route("/incidents", methods=["GET"])
def get_incidents():
    """Return all incidents."""
    incidents = current_app.config["REPOSITORY"].get_incidents()
    return jsonify({"items": [inc.to_dict() for inc in incidents], "mode": config.AXELLE_MODE})


@incidents_bp.route("/incidents/<incident_id>", methods=["GET"])
def get_incident(incident_id: str):
    """Return a single incident by ID."""
    inc = current_app.config["REPOSITORY"].get_incident_by_id(incident_id)
    if not inc:
        return (
            jsonify({"error": {"code": "NOT_FOUND", "message": f"Incident {incident_id} not found"}}),
            404,
        )
    return jsonify(inc.to_dict())


@incidents_bp.route("/incidents", methods=["POST"])
def post_incident():
    """Create an incident only from confirmed events."""
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": {"code": "BAD_REQUEST", "message": "A JSON object is required"}}), 400

    title = payload.get("title")
    severity = payload.get("severity")
    event_ids = payload.get("event_ids")
    if (
        not isinstance(title, str) or not title.strip()
        or severity not in config.ALLOWED_SEVERITIES - {"info"}
        or not isinstance(event_ids, list) or not event_ids
        or not all(isinstance(event_id, str) for event_id in event_ids)
    ):
        return jsonify({"error": {"code": "BAD_REQUEST", "message": "title, valid severity, and event_ids are required"}}), 400

    try:
        incident = create_incident(
            current_app.config["REPOSITORY"],
            title=title.strip(),
            severity=severity,
            event_ids=event_ids,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
    except InvalidTransitionError as error:
        return jsonify({"error": {"code": "CONFLICT", "message": str(error)}}), 409
    except KeyError as error:
        return jsonify({"error": {"code": "NOT_FOUND", "message": f"Event {error.args[0]} not found"}}), 404

    return jsonify({"incident": incident.to_dict(), "mode": config.AXELLE_MODE}), 201
