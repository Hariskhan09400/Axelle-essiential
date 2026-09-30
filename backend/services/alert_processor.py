"""Alert processor service — Phase 2+ placeholder.

This module will handle:
- Alert deduplication and correlation
- Alert enrichment (adding MITRE mappings, geolocation)
- Alert status transitions and workflow enforcement
- Alert severity recalibration

Not implemented in Phase 1. All methods are stubs with docstrings.
"""

from utils.logger import get_logger

logger = get_logger("alert_processor")


class AlertProcessor:
    """Processes raw events into alerts with enrichment and correlation.

    Phase 2+ will implement:
    - Deduplication of repeated alerts from the same source
    - Correlation of related events into alert groups
    - MITRE ATT&CK technique mapping based on rule IDs
    - Severity recalibration based on context
    - Alert status workflow enforcement (state machine)
    """

    def process_event(self, event: dict) -> dict:
        """Process a raw event into an alert with enrichment."""
        raise NotImplementedError("Alert processing is Phase 2+")

    def transition_status(self, alert_id: str, new_status: str) -> dict:
        """Transition an alert's status following the state machine.

        Valid transitions:
            new → investigating → (confirmed | false_positive)
            confirmed → incident_created → resolved
            false_positive → (terminal)
        Returns 409 on invalid transitions.
        """
        raise NotImplementedError("Alert workflow is Phase 2+")
