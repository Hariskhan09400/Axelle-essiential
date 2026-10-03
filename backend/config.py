"""Axelle Sentinel — configuration module.

All configuration is read from environment variables via python-dotenv.
No secrets are hardcoded; .env.example documents every variable.
"""

import os
from dotenv import load_dotenv

load_dotenv()


def _get_env(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


def _get_env_list(key: str, default: str = "") -> list[str]:
    raw = _get_env(key, default)
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


# ── Operating mode ──────────────────────────────────────────
AXELLE_MODE = _get_env("AXELLE_MODE", "demo")  # "demo" | "live"
if AXELLE_MODE not in {"demo", "live"}:
    raise ValueError("AXELLE_MODE must be 'demo' or 'live'")

# ── Ingest (live mode) ──────────────────────────────────────
# Secret key that senders must pass in the X-API-Key header when
# posting real events to /api/events/ingest. Leave empty to disable ingest.
INGEST_API_KEY = _get_env("INGEST_API_KEY", "")

# ── Flask ───────────────────────────────────────────────────
_default_flask_env = "production" if os.environ.get("VERCEL") else "development"
FLASK_ENV = _get_env("FLASK_ENV", _default_flask_env)
FLASK_PORT = int(_get_env("FLASK_PORT", "5000"))
FLASK_DEBUG = FLASK_ENV == "development"

# ── CORS ───────────────────────────────────────────────────
# Always allow local dev, preview, and deployment traffic for this tool.
CORS_ORIGINS = _get_env_list("CORS_ORIGINS", "*")
if "*" not in CORS_ORIGINS:
    _vercel_url = _get_env("VERCEL_URL", "")
    if _vercel_url:
        _origin = _vercel_url if _vercel_url.startswith("http") else f"https://{_vercel_url}"
        if _origin not in CORS_ORIGINS:
            CORS_ORIGINS.append(_origin)

# ── Wazuh (Phase 3 — placeholders) ──────────────────────────
WAZUH_URL = _get_env("WAZUH_URL", "")
WAZUH_USER = _get_env("WAZUH_USER", "")
WAZUH_PASSWORD = _get_env("WAZUH_PASSWORD", "")

# ── Telegram (Phase 5 — placeholders) ──────────────────────
TELEGRAM_BOT_TOKEN = _get_env("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = _get_env("TELEGRAM_CHAT_ID", "")

# ── Validation ─────────────────────────────────────────────
ALLOWED_SORT_FIELDS = {"timestamp", "severity", "event_type"}
ALLOWED_SORT_ORDERS = {"asc", "desc"}
ALLOWED_SEVERITIES = {"critical", "high", "medium", "low", "info"}
ALLOWED_STATUSES = {"new", "investigating", "confirmed", "false_positive", "incident_created", "resolved"}
ALLOWED_EVENT_TYPES = {
    "ssh_bruteforce", "network_scan", "auth_failure",
    "auth_success", "sudo_activity",
}
MAX_PAGE_SIZE = 100
DEFAULT_PAGE_SIZE = 20
MAX_SEARCH_LENGTH = 120