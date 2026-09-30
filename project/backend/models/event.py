"""Normalized event model for Axelle Sentinel."""

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Event:
    """A normalized security event from any log source."""

    id: str
    timestamp: str  # ISO-8601 UTC
    severity: str  # critical | high | medium | low | info
    event_type: str  # ssh_bruteforce | network_scan | auth_failure | auth_success | sudo_activity
    source_ip: str | None = None
    destination_ip: str | None = None
    host: str = ""
    rule_id: str = ""
    rule_description: str = ""
    attempt_count: int | None = None
    mitre: dict | None = None  # {technique_id, technique_name, tactic}
    status: str = "new"  # new | investigating | confirmed | false_positive | incident_created | resolved
    analyst_notes: list[dict] = field(default_factory=list)
    incident_id: str | None = None
    related_event_ids: list[str] = field(default_factory=list)
    mode: str = "demo"  # demo | live
    raw_event: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "severity": self.severity,
            "event_type": self.event_type,
            "source_ip": self.source_ip,
            "destination_ip": self.destination_ip,
            "host": self.host,
            "rule_id": self.rule_id,
            "rule_description": self.rule_description,
            "attempt_count": self.attempt_count,
            "mitre": self.mitre,
            "status": self.status,
            "analyst_notes": self.analyst_notes,
            "incident_id": self.incident_id,
            "related_event_ids": self.related_event_ids,
            "mode": self.mode,
            "raw_event": self.raw_event,
        }
