"""Basic pytest tests for Axelle Sentinel Phase 1 endpoints.

Tests cover:
- GET /api/health
- GET /api/events (pagination, filtering, sorting)
- GET /api/events/<id>
- GET /api/statistics
- GET /api/hosts
"""

import pytest
from sentinel import create_app


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# ── Health ─────────────────────────────────────────────────
class TestHealth:
    def test_health_returns_ok(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "ok"
        assert data["mode"] in ("demo", "live")

    def test_health_mode_is_demo(self, client):
        resp = client.get("/api/health")
        data = resp.get_json()
        assert data["mode"] == "demo"


# ── Events ─────────────────────────────────────────────────
class TestEvents:
    def test_events_returns_paginated(self, client):
        resp = client.get("/api/events?page=1&page_size=10")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "pages" in data
        assert data["page"] == 1
        assert data["page_size"] == 10
        assert len(data["items"]) <= 10

    def test_events_default_pagination(self, client):
        resp = client.get("/api/events")
        data = resp.get_json()
        assert data["page"] == 1
        assert data["page_size"] == 20

    def test_events_all_have_mode_demo(self, client):
        resp = client.get("/api/events?page_size=100")
        data = resp.get_json()
        for item in data["items"]:
            assert item["mode"] == "demo"

    def test_events_all_have_required_fields(self, client):
        resp = client.get("/api/events?page_size=5")
        data = resp.get_json()
        required = {
            "id", "timestamp", "severity", "event_type",
            "source_ip", "destination_ip", "host", "rule_id",
            "rule_description", "mitre", "status", "mode", "raw_event",
        }
        for item in data["items"]:
            assert required.issubset(item.keys())

    def test_events_severity_filter(self, client):
        resp = client.get("/api/events?severity=critical&page_size=50")
        data = resp.get_json()
        for item in data["items"]:
            assert item["severity"] == "critical"

    def test_events_event_type_filter(self, client):
        resp = client.get("/api/events?event_type=ssh_bruteforce&page_size=50")
        data = resp.get_json()
        for item in data["items"]:
            assert item["event_type"] == "ssh_bruteforce"

    def test_events_search_filters_before_pagination(self, client):
        response = client.get("/api/events?q=RL-5602&page=1&page_size=5")
        data = response.get_json()
        assert response.status_code == 200
        assert data["total"] > len(data["items"])
        assert len(data["items"]) == 5
        assert all(item["rule_id"] == "RL-5602" for item in data["items"])

    def test_events_status_filter(self, client):
        response = client.get("/api/events?status=confirmed")
        data = response.get_json()
        assert response.status_code == 200
        assert data["total"] == 0
        assert data["items"] == []

    def test_events_rejects_invalid_status(self, client):
        response = client.get("/api/events?status=compromised")
        assert response.status_code == 400
        assert response.get_json()["error"]["code"] == "BAD_REQUEST"

    def test_events_invalid_severity_returns_400(self, client):
        resp = client.get("/api/events?severity=bogus")
        assert resp.status_code == 400
        data = resp.get_json()
        assert "error" in data
        assert data["error"]["code"] == "BAD_REQUEST"

    def test_events_invalid_sort_field_returns_400(self, client):
        resp = client.get("/api/events?sort=bogus")
        assert resp.status_code == 400

    def test_events_invalid_page_size_returns_400(self, client):
        resp = client.get("/api/events?page_size=999")
        assert resp.status_code == 400

    def test_events_sort_by_severity(self, client):
        resp = client.get("/api/events?sort=severity&page_size=50")
        data = resp.get_json()
        order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
        severities = [order[item["severity"]] for item in data["items"]]
        assert severities == sorted(severities)

    def test_events_sort_by_event_type(self, client):
        resp = client.get("/api/events?sort=event_type&page_size=100")
        event_types = [item["event_type"] for item in resp.get_json()["items"]]
        assert event_types == sorted(event_types)

    def test_event_by_id(self, client):
        resp = client.get("/api/events?page_size=1")
        event_id = resp.get_json()["items"][0]["id"]
        resp2 = client.get(f"/api/events/{event_id}")
        assert resp2.status_code == 200
        assert resp2.get_json()["id"] == event_id

    def test_event_by_id_not_found(self, client):
        resp = client.get("/api/events/nonexistent-id")
        assert resp.status_code == 404
        data = resp.get_json()
        assert data["error"]["code"] == "NOT_FOUND"

    def test_events_total_is_realistic(self, client):
        resp = client.get("/api/events?page_size=1")
        data = resp.get_json()
        assert 150 <= data["total"] <= 300


# ── Statistics ──────────────────────────────────────────────
class TestAlerts:
    def test_alerts_search_and_pagination_are_consistent(self, client):
        first = client.get("/api/alerts?q=RL-5602&page=1&page_size=15").get_json()
        second = client.get("/api/alerts?q=RL-5602&page=2&page_size=15").get_json()

        assert first["mode"] == "demo"
        assert first["total"] == 20
        assert first["pages"] == 2
        assert len(first["items"]) == 15
        assert len(second["items"]) == 5
        assert all(item["severity"] != "info" for item in first["items"] + second["items"])
        assert all(item["rule_id"] == "RL-5602" for item in first["items"] + second["items"])

    def test_alert_query_rejects_invalid_sort_order(self, client):
        response = client.get("/api/alerts?sort_order=sideways")
        assert response.status_code == 400
        assert response.get_json()["error"]["code"] == "BAD_REQUEST"

    def test_search_rejects_oversized_query(self, client):
        response = client.get(f"/api/events?q={'x' * 121}")
        assert response.status_code == 400
        assert response.get_json()["error"]["code"] == "BAD_REQUEST"


# ── Statistics ──────────────────────────────────────────────
class TestStatistics:
    def test_statistics_returns_all_fields(self, client):
        resp = client.get("/api/statistics")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "totals" in data
        assert "severity_counts" in data
        assert "top_source_ips" in data
        assert "top_techniques" in data
        assert "events_per_bucket" in data
        assert data["mode"] == "demo"

    def test_statistics_totals(self, client):
        resp = client.get("/api/statistics")
        data = resp.get_json()
        totals = data["totals"]
        assert "events" in totals
        assert "alerts" in totals
        assert "incidents" in totals
        assert "critical_alerts" in totals
        assert totals["events"] > 0

    def test_statistics_severity_counts(self, client):
        resp = client.get("/api/statistics")
        data = resp.get_json()
        counts = data["severity_counts"]
        for sev in ("critical", "high", "medium", "low", "info"):
            assert sev in counts
            assert isinstance(counts[sev], int)

    def test_statistics_top_source_ips(self, client):
        resp = client.get("/api/statistics")
        data = resp.get_json()
        ips = data["top_source_ips"]
        assert isinstance(ips, list)
        for item in ips:
            assert "ip" in item
            assert "count" in item
            assert item["ip"].startswith("192.168.56.")

    def test_statistics_events_per_bucket(self, client):
        resp = client.get("/api/statistics")
        data = resp.get_json()
        buckets = data["events_per_bucket"]
        assert isinstance(buckets, list)
        assert len(buckets) == 12  # 2h buckets over 24h
        for b in buckets:
            assert "bucket" in b
            assert "count" in b


# ── Hosts ──────────────────────────────────────────────────
class TestHosts:
    def test_hosts_returns_list(self, client):
        resp = client.get("/api/hosts")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["mode"] == "demo"
        assert isinstance(data["items"], list)
        assert len(data["items"]) > 0

    def test_incidents_collection_includes_mode(self, client):
        response = client.get("/api/incidents")
        assert response.status_code == 200
        assert response.get_json() == {"items": [], "mode": "demo"}

    def test_hosts_have_required_fields(self, client):
        resp = client.get("/api/hosts")
        data = resp.get_json()
        required = {"hostname", "ip", "os", "agent_status", "last_seen"}
        for host in data["items"]:
            assert required.issubset(host.keys())

    def test_hosts_use_private_ips(self, client):
        resp = client.get("/api/hosts")
        data = resp.get_json()
        for host in data["items"]:
            assert host["ip"].startswith("192.168.56.")


# ── Error format ────────────────────────────────────────────
class TestAnalystWorkflow:
    def test_incident_requires_confirmed_event(self, client):
        event_id = client.get("/api/events?page_size=1").get_json()["items"][0]["id"]
        response = client.post("/api/incidents", json={
            "title": "Unconfirmed event",
            "severity": "high",
            "event_ids": [event_id],
        })
        assert response.status_code == 409
        assert response.get_json()["error"]["code"] == "CONFLICT"

    def test_confirmed_event_can_create_and_resolve_incident(self, client):
        event_id = client.get("/api/events?page_size=1").get_json()["items"][0]["id"]
        for status in ("investigating", "confirmed"):
            response = client.patch(f"/api/events/{event_id}/status", json={"status": status})
            assert response.status_code == 200

        created = client.post("/api/incidents", json={
            "title": "Analyst confirmed event",
            "severity": "high",
            "event_ids": [event_id],
        })
        assert created.status_code == 201
        incident = created.get_json()["incident"]
        assert incident["linked_alert_ids"] == [event_id]
        assert incident["mode"] == "demo"

        event = client.get(f"/api/events/{event_id}").get_json()
        assert event["status"] == "incident_created"
        resolved = client.patch(f"/api/events/{event_id}/status", json={"status": "resolved"})
        assert resolved.status_code == 200
        updated_incident = client.get(f"/api/incidents/{incident['id']}").get_json()
        assert updated_incident["status"] == "resolved"

    def test_invalid_transition_returns_conflict(self, client):
        event_id = client.get("/api/events?page_size=1").get_json()["items"][0]["id"]
        response = client.patch(f"/api/events/{event_id}/status", json={"status": "confirmed"})
        assert response.status_code == 409
        assert response.get_json()["error"]["code"] == "CONFLICT"

    def test_live_mode_never_returns_demo_events(self, client, monkeypatch):
        import config

        monkeypatch.setattr(config, "AXELLE_MODE", "live")
        health = client.get("/api/health").get_json()
        events = client.get("/api/events")
        assert health == {"status": "unavailable", "mode": "live"}
        assert events.status_code == 503
        assert events.get_json()["error"]["code"] == "LIVE_INGESTION_UNAVAILABLE"


# ── Error format ────────────────────────────────────────────
class TestErrorFormat:
    def test_error_response_format(self, client):
        resp = client.get("/api/events?severity=bogus")
        data = resp.get_json()
        assert "error" in data
        assert "code" in data["error"]
        assert "message" in data["error"]
