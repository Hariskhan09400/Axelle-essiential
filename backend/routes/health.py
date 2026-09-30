"""Health check endpoint."""

from flask import Blueprint, jsonify

import config

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health():
    """Return service health and operating mode.

    Response: { "status": "ok", "mode": "demo" | "live" }
    """
    status = "ok" if config.AXELLE_MODE == "demo" else "unavailable"
    return jsonify({"status": status, "mode": config.AXELLE_MODE})
