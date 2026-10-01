"""Alerts endpoint — alerts are events with severity != info.

Phase 1 provides read-only alert listing with the same filtering
as events. Phase 2 will add status transitions (state machine).
"""

from flask import Blueprint, current_app, jsonify

from utils.query_params import parse_event_query

alerts_bp = Blueprint("alerts", __name__)


@alerts_bp.route("/alerts", methods=["GET"])
def get_alerts():
    """Return filtered and paginated non-info events as alerts."""
    query = parse_event_query(default_sort="severity")
    query["alerts_only"] = True
    return jsonify(current_app.config["REPOSITORY"].get_events(**query))
