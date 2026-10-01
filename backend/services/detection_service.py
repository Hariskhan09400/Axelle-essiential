"""Detection service — Phase 9 placeholder.

This module will handle:
- Custom detection rule evaluation
- Correlation across multiple event types
- Behavioral anomaly detection
- Detection rule management

Not implemented in Phase 1. All methods are stubs with docstrings.
"""

from utils.logger import get_logger

logger = get_logger("detection_service")


class DetectionService:
    """Evaluates detection rules against incoming events.

    Phase 9 will implement:
    - Custom Sigma-like detection rules
    - Multi-event correlation (e.g., brute-force → successful login = account compromise)
    - Behavioral baselining and anomaly detection
    - Rule management (CRUD for detection rules)
    """

    def evaluate(self, event: dict) -> list[dict]:
        """Evaluate detection rules against an event. Returns matching alerts."""
        raise NotImplementedError("Advanced detection is Phase 9")

    def correlate(self, events: list[dict]) -> list[dict]:
        """Correlate multiple events to detect multi-stage attacks."""
        raise NotImplementedError("Event correlation is Phase 9")
