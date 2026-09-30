"""Statistics endpoint — aggregated metrics for the dashboard."""

from flask import Blueprint, current_app, jsonify


statistics_bp = Blueprint("statistics", __name__)


@statistics_bp.route("/statistics", methods=["GET"])
def get_statistics():
    """Return aggregated statistics.

    Response includes:
      - totals (events, alerts, incidents, critical_alerts)
      - severity_counts (per severity)
      - top_source_ips (top 8)
      - top_techniques (MITRE-mapped, by count)
      - events_per_bucket (2h buckets over last 24h)
    """
    return jsonify(current_app.config["REPOSITORY"].get_statistics())
