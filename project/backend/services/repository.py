"""Repository interface for data access.

This abstracts storage so SQLite/SQLAlchemy can replace in-memory
storage without touching routes or services.
"""

from abc import ABC, abstractmethod
from typing import Any

from models.event import Event
from models.incident import Incident


class Repository(ABC):
    """Abstract repository — all data access goes through this interface."""

    @abstractmethod
    def get_events(
        self,
        page: int = 1,
        page_size: int = 20,
        sort: str = "timestamp",
        severity: str | None = None,
        event_type: str | None = None,
        status: str | None = None,
        search: str = "",
        sort_order: str = "desc",
        alerts_only: bool = False,
    ) -> dict:
        """Return paginated events: {items, total, page, page_size, pages}."""

    @abstractmethod
    def get_event_by_id(self, event_id: str) -> Event | None:
        """Return a single event by ID, or None."""

    @abstractmethod
    def get_all_events(self) -> list[Event]:
        """Return all events (used for statistics)."""

    @abstractmethod
    def get_statistics(self) -> dict:
        """Return aggregated statistics."""

    @abstractmethod
    def get_hosts(self) -> list[dict]:
        """Return monitored hosts."""

    @abstractmethod
    def get_incidents(self) -> list[Incident]:
        """Return all incidents."""

    @abstractmethod
    def get_incident_by_id(self, incident_id: str) -> Incident | None:
        """Return a single incident by ID, or None."""

    @abstractmethod
    def add_incident(self, incident: Incident) -> None:
        """Persist an incident in the configured repository."""
