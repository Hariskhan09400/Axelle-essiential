"""Business rules for analyst event and incident workflow transitions."""

from datetime import datetime, timezone
from uuid import uuid4

from models.incident import Incident
from services.repository import Repository


class InvalidTransitionError(ValueError):
    """Raised when an analyst requests a disallowed workflow transition."""


def transition_event(repository: Repository, event_id: str, new_status: str):
    """Update one event if the requested analyst transition is valid."""
    event = repository.get_event_by_id(event_id)
    if event is None:
        raise KeyError(event_id)

    transitions = {
        "new": {"investigating"},
        "investigating": {"confirmed", "false_positive"},
        "confirmed": set(),
        "false_positive": set(),
        "incident_created": {"resolved"},
        "resolved": set(),
    }
    if new_status not in transitions.get(event.status, set()):
        raise InvalidTransitionError(f"Cannot transition event from {event.status} to {new_status}")

    event.status = new_status
    if new_status == "resolved" and event.incident_id:
        incident = repository.get_incident_by_id(event.incident_id)
        linked_events = [repository.get_event_by_id(item_id) for item_id in incident.linked_alert_ids] if incident else []
        if incident and all(item and item.status == "resolved" for item in linked_events):
            incident.status = "resolved"
            incident.resolved_at = datetime.now(timezone.utc).isoformat()
    return event


def create_incident(
    repository: Repository,
    title: str,
    severity: str,
    event_ids: list[str],
    created_at: str,
) -> Incident:
    """Create an incident only from confirmed, unlinked events."""
    if len(event_ids) != len(set(event_ids)):
        raise InvalidTransitionError("An event may only be linked once")

    events = [repository.get_event_by_id(event_id) for event_id in event_ids]
    if any(event is None for event in events):
        missing = event_ids[next(index for index, event in enumerate(events) if event is None)]
        raise KeyError(missing)
    if any(event.status != "confirmed" or event.incident_id for event in events if event):
        raise InvalidTransitionError("Incidents can only be created from confirmed, unlinked events")

    incident = Incident(
        id=f"INC-{uuid4().hex[:12].upper()}",
        title=title,
        severity=severity,
        status="open",
        linked_alert_ids=event_ids,
        created_at=created_at,
    )
    repository.add_incident(incident)
    for event in events:
        event.incident_id = incident.id
        event.status = "incident_created"
    return incident