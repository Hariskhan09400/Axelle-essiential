"""Axelle Sentinel — Flask application factory and route registration."""

from flask import Flask, jsonify, request
from flask_cors import CORS

import config
from utils.logger import get_logger
from services.in_memory_repository import InMemoryRepository

logger = get_logger("axelle.app")

# Singleton repository — in-memory for Phase 1
repo = InMemoryRepository()


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False
    app.config["REPOSITORY"] = repo

    # CORS — restrictive, configured origins only
    CORS(app, origins=config.CORS_ORIGINS)

    @app.before_request
    def require_live_ingestion():
        if (
            config.AXELLE_MODE == "live"
            and request.path.startswith("/api/")
            and request.path != "/api/health"
        ):
            return jsonify({
                "error": {
                    "code": "LIVE_INGESTION_UNAVAILABLE",
                    "message": "Live ingestion is not available in Phase 1.",
                }
            }), 503

    # Register blueprints
    from routes.health import health_bp
    from routes.events import events_bp
    from routes.statistics import statistics_bp
    from routes.hosts import hosts_bp
    from routes.incidents import incidents_bp
    from routes.alerts import alerts_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(events_bp, url_prefix="/api")
    app.register_blueprint(statistics_bp, url_prefix="/api")
    app.register_blueprint(hosts_bp, url_prefix="/api")
    app.register_blueprint(incidents_bp, url_prefix="/api")
    app.register_blueprint(alerts_bp, url_prefix="/api")

    # Error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": {"code": "BAD_REQUEST", "message": str(e.description)}}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": {"code": "NOT_FOUND", "message": "Resource not found"}}), 404

    @app.errorhandler(409)
    def conflict(e):
        return jsonify({"error": {"code": "CONFLICT", "message": str(e.description)}}), 409

    @app.errorhandler(500)
    def server_error(e):
        logger.error("Internal server error: %s", e)
        return jsonify({"error": {"code": "INTERNAL_ERROR", "message": "Internal server error"}}), 500

    return app


# Create the app instance for gunicorn / flask run / Vercel
app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=config.FLASK_PORT,
        debug=config.FLASK_DEBUG,
    )
