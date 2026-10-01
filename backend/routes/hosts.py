"""Hosts endpoint — monitored host inventory."""

from flask import Blueprint, current_app, jsonify

import config

hosts_bp = Blueprint("hosts", __name__)


@hosts_bp.route("/hosts", methods=["GET"])
def get_hosts():
    """Return all monitored hosts with agent status."""
    return jsonify({"items": current_app.config["REPOSITORY"].get_hosts(), "mode": config.AXELLE_MODE})
