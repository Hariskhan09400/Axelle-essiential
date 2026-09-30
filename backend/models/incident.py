"""Incident model for Axelle Sentinel."""

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Incident:
    """A security incident grouping related alerts."""

    id: str
    title: str
    severity: str  # critical | high | medium | low
    status: str = "open"  # open | investigating | resolved
    linked_alert_ids: list[str] = field(default_factory=list)
    created_at: str = ""
    resolved_at: str | None = None
    mode: str = "demo"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "severity": self.severity,
            "status": self.status,
            "linked_alert_ids": self.linked_alert_ids,
            "created_at": self.created_at,
            "resolved_at": self.resolved_at,
            "mode": self.mode,
        }
