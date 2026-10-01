"""In-memory repository implementation.

Stores data in memory behind the Repository interface so that
SQLite/SQLAlchemy can replace it later without touching routes.
"""

import math
import json
from collections import Counter
from datetime import datetime, timedelta, timezone

from models.event import Event
from models.incident import Incident
from .repository import Repository
from .mock_data_service import generate_mock_data


class InMemoryRepository(Repository):
    """In-memory data store backed by deterministic mock data."""

    def __init__(self) -> None:
        self._events: list[Event] = []
        self._incidents: list[Incident] = []
        self._hosts: list[dict] = []
        self._loaded = False

    def _ensure_loaded(self) -> None:
        if not self._loaded:
            data = generate_mock_data()
            self._events = data["events"]
            self._incidents = data["incidents"]
            self._hosts = data["hosts"]
            self._loaded = True

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
        self._ensure_loaded()
        items = list(self._events)

        # Apply every filter before computing totals and pagination.
        if alerts_only:
            items = [e for e in items if e.severity != "info"]
        if severity and severity != "all":
            items = [e for e in items if e.severity == severity]
        if event_type and event_type != "all":
            items = [e for e in items if e.event_type == event_type]
        if status and status != "all":
            items = [e for e in items if e.status == status]
        if search:
            term = search.casefold()

            def matches(event: Event) -> bool:
                fields = [
                    event.id,
                    event.timestamp,
                    event.source_ip or "",
                    event.destination_ip or "",
                    event.host,
                    event.rule_id,
                    event.rule_description,
                    event.event_type,
                    json.dumps(event.mitre or {}, sort_keys=True),
                    json.dumps(event.raw_event, sort_keys=True),
                ]
                return term in " ".join(fields).casefold()

            items = [event for event in items if matches(event)]

        # Sort
        if sort == "severity":
            order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
            items.sort(key=lambda e: (order.get(e.severity, 99), e.timestamp), reverse=sort_order == "desc")
        elif sort == "event_type":
            items.sort(key=lambda e: (e.event_type, e.timestamp), reverse=sort_order == "desc")
        else:
            items.sort(key=lambda e: (e.timestamp, e.id), reverse=sort_order == "desc")

        total = len(items)
        pages = max(1, math.ceil(total / page_size))
        start = (page - 1) * page_size
        end = start + page_size
        page_items = items[start:end]

        return {
            "items": [e.to_dict() for e in page_items],
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": pages,
            "mode": "demo",
        }

    def get_event_by_id(self, event_id: str) -> Event | None:
        self._ensure_loaded()
        for e in self._events:
            if e.id == event_id:
                return e
        return None

    def get_all_events(self) -> list[Event]:
        self._ensure_loaded()
        return list(self._events)

    def get_statistics(self) -> dict:
        self._ensure_loaded()
        events = self._events

        severity_counts: Counter = Counter()
        ip_counts: Counter = Counter()
        technique_counts: dict[str, dict] = {}

        for e in events:
            severity_counts[e.severity] += 1
            if e.source_ip:
                ip_counts[e.source_ip] += 1
            if e.mitre:
                tid = e.mitre.get("technique_id", "")
                if tid:
                    if tid not in technique_counts:
                        technique_counts[tid] = {
                            "technique_name": e.mitre.get("technique_name", ""),
                            "count": 0,
                        }
                    technique_counts[tid]["count"] += 1

        # Time buckets — 2h buckets over last 24h
        now = datetime.now(timezone.utc)
        buckets = []
        for i in range(11, -1, -1):
            start = now - timedelta(hours=(i + 1) * 2)
            end = now - timedelta(hours=i * 2)
            count = sum(
                1 for e in events
                if start <= datetime.fromisoformat(e.timestamp.replace("Z", "+00:00")) < end
            )
            buckets.append({"bucket": end.strftime("%H:%M"), "count": count})

        top_ips = [
            {"ip": ip, "count": count}
            for ip, count in ip_counts.most_common(8)
        ]
        top_techniques = [
            {"technique_id": tid, "technique_name": v["technique_name"], "count": v["count"]}
            for tid, v in sorted(technique_counts.items(), key=lambda x: x[1]["count"], reverse=True)
        ]

        return {
            "mode": "demo",
            "totals": {
                "events": len(events),
                "alerts": sum(1 for e in events if e.severity != "info"),
                "incidents": len(self._incidents),
                "critical_alerts": severity_counts.get("critical", 0),
            },
            "severity_counts": {
                "critical": severity_counts.get("critical", 0),
                "high": severity_counts.get("high", 0),
                "medium": severity_counts.get("medium", 0),
                "low": severity_counts.get("low", 0),
                "info": severity_counts.get("info", 0),
            },
            "top_source_ips": top_ips,
            "top_techniques": top_techniques,
            "events_per_bucket": buckets,
        }

    def get_hosts(self) -> list[dict]:
        self._ensure_loaded()
        return list(self._hosts)

    def get_incidents(self) -> list[Incident]:
        self._ensure_loaded()
        return list(self._incidents)

    def get_incident_by_id(self, incident_id: str) -> Incident | None:
        self._ensure_loaded()
        for inc in self._incidents:
            if inc.id == incident_id:
                return inc
        return None

    def add_incident(self, incident: Incident) -> None:
        self._ensure_loaded()
        self._incidents.append(incident)
