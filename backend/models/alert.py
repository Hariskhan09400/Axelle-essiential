"""Normalized event model for Axelle Sentinel."""

from dataclasses import dataclass, field
from typing import Any

from .event import Event


@dataclass
class Alert:
    """An alert is a security event that has been flagged for analyst attention."""

    id: str
    event_id: str
    severity: str  # critical | high | medium | low
    status: str = "new"  # new | investigating | confirmed | false_positive | resolved
    analyst_notes: list[dict] = field(default_factory=list)
    incident_id: str | None = None

    # Valid state transitions for the analyst workflow state machine
    VALID_TRANSITIONS: dict[str, set[str]] = field(
        default_factory=lambda: {
            "new": {"investigating", "false_positive"},
            "investigating": {"confirmed", "false_positive"},
            "confirmed": {"incident_created", "false_positive"},
            "incident_created": {"resolved"},
            "false_positive": set(),
            "resolved": set(),
        },
        repr=False,
        compare=False,
    )

    def can_transition(self, new_status: str) -> bool:
        return new_status in self.VALID_TRANSITIONS.get(self.status, set())
