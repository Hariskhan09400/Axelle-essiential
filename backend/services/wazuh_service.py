"""Wazuh SIEM integration service — Phase 3 placeholder.

This module will handle:
- Authentication with the Wazuh API
- Fetching alerts and events from Wazuh
- Mapping Wazuh rule levels to Axelle severity levels
- Normalizing Wazuh events to the Axelle event model

Not implemented in Phase 1. All methods are stubs with docstrings.
"""

from utils.logger import get_logger

logger = get_logger("wazuh_service")


class WazuhService:
    """Service for communicating with the Wazuh SIEM API.

    Phase 3 will implement:
    - API authentication (token-based)
    - Alert fetching with pagination
    - Rule level → severity mapping (12+ = critical, 9-11 = high, 6-8 = medium, 3-5 = low, 1-2 = info)
    - Event normalization to the Axelle Event model
    - Caching and rate limiting
    """

    def __init__(self, url: str, username: str, password: str) -> None:
        self.url = url
        self.username = username
        self.password = password
        self._token: str | None = None

    def authenticate(self) -> str:
        """Authenticate with the Wazuh API and return a session token."""
        raise NotImplementedError("Wazuh integration is Phase 3")

    def get_alerts(self, limit: int = 100, offset: int = 0) -> list[dict]:
        """Fetch alerts from Wazuh API with pagination."""
        raise NotImplementedError("Wazuh integration is Phase 3")

    def map_severity(self, rule_level: int) -> str:
        """Map a Wazuh rule level (1-16) to Axelle severity."""
        if rule_level >= 12:
            return "critical"
        if rule_level >= 9:
            return "high"
        if rule_level >= 6:
            return "medium"
        if rule_level >= 3:
            return "low"
        return "info"
