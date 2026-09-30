"""Notification service — Phase 5 placeholder.

This module will handle:
- Telegram alert delivery
- Notification templates and severity-based routing
- Rate limiting and retry logic
- Notification logging

Not implemented in Phase 1. All methods are stubs with docstrings.
"""

from utils.logger import get_logger

logger = get_logger("notification_service")


class NotificationService:
    """Sends alert notifications via configured channels.

    Phase 5 will implement:
    - Telegram bot API integration
    - Severity-based notification routing (critical/high → immediate)
    - Templated alert messages with MITRE mappings
    - Rate limiting to avoid notification storms
    - Delivery retry with exponential backoff
    """

    def send_telegram(self, message: str, chat_id: str | None = None) -> bool:
        """Send a message via Telegram bot API."""
        raise NotImplementedError("Telegram integration is Phase 5")

    def format_alert(self, alert: dict) -> str:
        """Format an alert into a human-readable notification message."""
        raise NotImplementedError("Notification formatting is Phase 5")
