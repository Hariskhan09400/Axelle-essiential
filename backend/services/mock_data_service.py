"""Deterministic mock data generator for Axelle Sentinel Phase 1.

Generates 150–300 realistic security events over the last 24 hours
using a seeded PRNG. All data uses private lab IP ranges (192.168.56.0/24).
Every record carries mode="demo".
"""

import random
import uuid
from datetime import datetime, timedelta, timezone

from models.event import Event

# ── Seeded PRNG ─────────────────────────────────────────────
_rng = random.Random(42)

# ── MITRE mappings ──────────────────────────────────────────
_MITRE = {
    "T1110_001": {
        "technique_id": "T1110.001",
        "technique_name": "Password Guessing",
        "tactic": "Credential Access",
    },
    "T1046": {
        "technique_id": "T1046",
        "technique_name": "Network Service Discovery",
        "tactic": "Discovery",
    },
    "T1078": {
        "technique_id": "T1078",
        "technique_name": "Valid Accounts",
        "tactic": "Defense Evasion, Persistence, Privilege Escalation, Initial Access",
    },
    "T1548_003": {
        "technique_id": "T1548.003",
        "technique_name": "Sudo and Sudo Caching",
        "tactic": "Privilege Escalation, Defense Evasion",
    },
}

# ── Hosts ──────────────────────────────────────────────────
_HOSTS = [
    {"hostname": "ubuntu-target", "ip": "192.168.56.20", "os": "Ubuntu 22.04 LTS", "agent_status": "online", "last_seen": datetime.now(timezone.utc).isoformat()},
    {"hostname": "kali-attacker", "ip": "192.168.56.10", "os": "Kali Linux 2024.1", "agent_status": "online", "last_seen": datetime.now(timezone.utc).isoformat()},
    {"hostname": "wazuh-server", "ip": "192.168.56.30", "os": "Ubuntu 22.04 LTS", "agent_status": "online", "last_seen": datetime.now(timezone.utc).isoformat()},
    {"hostname": "web-proxy-01", "ip": "192.168.56.40", "os": "Debian 12", "agent_status": "offline", "last_seen": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()},
    {"hostname": "db-server-01", "ip": "192.168.56.50", "os": "Ubuntu 20.04 LTS", "agent_status": "online", "last_seen": datetime.now(timezone.utc).isoformat()},
]

_ATTACKER_IPS = ["192.168.56.10", "192.168.56.11", "192.168.56.12"]
_TARGET_IP = "192.168.56.20"
_TARGET_HOST = "ubuntu-target"
_USERS = ["root", "admin", "user", "ubuntu", "postgres", "gitlab", "sysadmin"]
_SUDO_CMDS = ["apt update", "systemctl restart sshd", "cat /etc/shadow", "useradd -m service_acct", "chmod 4755 /bin/bash"]


def _hours_ago(h: float) -> str:
    return (datetime.now(timezone.utc) - timedelta(hours=h)).isoformat()


def _rand_ip() -> str:
    return f"192.168.56.{_rng.randint(2, 254)}"


def _pick(lst: list) -> object:
    return _rng.choice(lst)


def _gen_id(n: int) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"axelle-sentinel-demo-event-{n}"))


def _gen_ssh_bruteforce(n: int, hours_back: float) -> Event:
    timestamp = _hours_ago(hours_back)
    src_ip = _pick(_ATTACKER_IPS)
    attempts = _rng.randint(20, 80)
    return Event(
        id=_gen_id(n),
        timestamp=timestamp,
        severity="critical",
        event_type="ssh_bruteforce",
        source_ip=src_ip,
        destination_ip=_TARGET_IP,
        host=_TARGET_HOST,
        rule_id="RL-5503",
        rule_description="Multiple SSH authentication failures from same source",
        attempt_count=attempts,
        mitre=_MITRE["T1110_001"],
        status="new",
        raw_event={
            "timestamp": timestamp,
            "src_ip": src_ip,
            "dst_ip": _TARGET_IP,
            "dst_port": "22",
            "protocol": "SSH",
            "action": "fail",
            "user": _pick(_USERS),
            "attempt_count": str(attempts),
            "rule_id": "5503",
            "rule_level": "10",
            "description": "SSHD: Multiple authentication failures",
        },
    )


def _gen_network_scan(n: int, hours_back: float) -> Event:
    timestamp = _hours_ago(hours_back)
    src_ip = _pick(_ATTACKER_IPS)
    ports = _pick(["22,80,443,3306,8080", "1-1000", "21,22,23,25,53,80,110,143,443", "443,445,3306,5432,6379,8080,9200"])
    attempts = _rng.randint(15, 50)
    return Event(
        id=_gen_id(n),
        timestamp=timestamp,
        severity="high",
        event_type="network_scan",
        source_ip=src_ip,
        destination_ip=_TARGET_IP,
        host=_TARGET_HOST,
        rule_id="RL-5602",
        rule_description="Network service scan detected — sequential port connection pattern",
        attempt_count=attempts,
        mitre=_MITRE["T1046"],
        status="new",
        raw_event={
            "timestamp": timestamp,
            "src_ip": src_ip,
            "dst_ip": _TARGET_IP,
            "scanned_ports": ports,
            "protocol": "TCP",
            "action": "scan",
            "attempt_count": str(attempts),
            "rule_id": "5602",
            "rule_level": "8",
            "description": "Port scan detected from external source",
        },
    )


def _gen_auth_failure(n: int, hours_back: float) -> Event:
    timestamp = _hours_ago(hours_back)
    src_ip = _rand_ip()
    host = _pick(["ubuntu-target", "db-server-01", "wazuh-server"])
    return Event(
        id=_gen_id(n),
        timestamp=timestamp,
        severity="medium",
        event_type="auth_failure",
        source_ip=src_ip,
        destination_ip=_TARGET_IP,
        host=host,
        rule_id="RL-5501",
        rule_description="SSH authentication failure",
        attempt_count=1,
        mitre=None,
        status="new",
        raw_event={
            "timestamp": timestamp,
            "src_ip": src_ip,
            "dst_ip": _TARGET_IP,
            "dst_port": "22",
            "protocol": "SSH",
            "action": "fail",
            "user": _pick(_USERS),
            "attempt_count": "1",
            "rule_id": "5501",
            "rule_level": "5",
            "description": "SSHD: Failed password for invalid user",
        },
    )


def _gen_auth_success(n: int, hours_back: float) -> Event:
    timestamp = _hours_ago(hours_back)
    src_ip = _rand_ip()
    user = _pick(["ubuntu", "admin", "user", "sysadmin"])
    host = _pick(["ubuntu-target", "db-server-01", "wazuh-server"])
    valid_account = _rng.random() > 0.7
    return Event(
        id=_gen_id(n),
        timestamp=timestamp,
        severity="low" if valid_account else "info",
        event_type="auth_success",
        source_ip=src_ip,
        destination_ip=_TARGET_IP,
        host=host,
        rule_id="RL-5710" if valid_account else "RL-5500",
        rule_description="Successful login using valid credentials from new source" if valid_account else "SSH session opened",
        attempt_count=None,
        mitre=_MITRE["T1078"] if valid_account else None,
        status="new",
        raw_event={
            "timestamp": timestamp,
            "src_ip": src_ip,
            "dst_ip": _TARGET_IP,
            "dst_port": "22",
            "protocol": "SSH",
            "action": "accept",
            "user": user,
            "rule_id": "5710" if valid_account else "5500",
            "rule_level": "3" if valid_account else "2",
            "description": "SSHD: Accepted password from new source IP" if valid_account else "SSHD: Session opened",
        },
    )


def _gen_sudo_activity(n: int, hours_back: float) -> Event:
    timestamp = _hours_ago(hours_back)
    user = _pick(["ubuntu", "admin", "sysadmin"])
    command = _pick(_SUDO_CMDS)
    suspicious = "shadow" in command or "4755" in command
    return Event(
        id=_gen_id(n),
        timestamp=timestamp,
        severity="high" if suspicious else "low",
        event_type="sudo_activity",
        source_ip=None,
        destination_ip=_TARGET_IP,
        host=_TARGET_HOST,
        rule_id="RL-5402" if suspicious else "RL-5401",
        rule_description="Privileged command execution via sudo — potentially suspicious command" if suspicious else "Sudo command execution",
        attempt_count=None,
        mitre=_MITRE["T1548_003"] if suspicious else None,
        status="new",
        raw_event={
            "timestamp": timestamp,
            "user": user,
            "command": command,
            "action": "sudo",
            "rule_id": "5402" if suspicious else "5401",
            "rule_level": "7" if suspicious else "3",
            "description": f"Sudo: {user} executed: {command}",
        },
    )


def _gen_noise(n: int, hours_back: float) -> Event:
    timestamp = _hours_ago(hours_back)
    source_ip = _rand_ip()
    host = _pick([h["hostname"] for h in _HOSTS])
    return Event(
        id=_gen_id(n),
        timestamp=timestamp,
        severity="info",
        event_type="auth_success",
        source_ip=source_ip,
        destination_ip="192.168.56.20",
        host=host,
        rule_id="RL-5001",
        rule_description="Routine SSH session opened",
        attempt_count=None,
        mitre=None,
        status="new",
        raw_event={
            "timestamp": timestamp,
            "src_ip": source_ip,
            "dst_ip": "192.168.56.20",
            "protocol": "SSH",
            "action": "accept",
            "user": _pick(["ubuntu", "admin", "user", "sysadmin"]),
            "rule_id": "5001",
            "rule_level": "1",
            "description": "SSHD: Session opened",
        },
    )


def generate_mock_data() -> dict:
    """Generate deterministic mock data. Returns {events, incidents, hosts}."""
    events: list[Event] = []
    n = 1

    # SSH brute-force bursts: 3 bursts, 15–25 events each
    for _ in range(3):
        base_hour = _rng.randint(1, 22)
        count = _rng.randint(15, 25)
        for _ in range(count):
            events.append(_gen_ssh_bruteforce(n, base_hour + _rng.random() * 0.5))
            n += 1

    # Network scans: 2 scans, 10–15 events each
    for _ in range(2):
        base_hour = _rng.randint(2, 20)
        count = _rng.randint(10, 15)
        for _ in range(count):
            events.append(_gen_network_scan(n, base_hour + _rng.random() * 0.3))
            n += 1

    # Auth failures: ~20
    for _ in range(20):
        events.append(_gen_auth_failure(n, _rng.random() * 24))
        n += 1

    # Auth successes: ~30
    for _ in range(30):
        events.append(_gen_auth_success(n, _rng.random() * 24))
        n += 1

    # Sudo activity: ~15
    for _ in range(15):
        events.append(_gen_sudo_activity(n, _rng.random() * 24))
        n += 1

    # Noise/info: ~40
    for _ in range(40):
        events.append(_gen_noise(n, _rng.random() * 24))
        n += 1

    # Sort by timestamp descending
    events.sort(key=lambda e: e.timestamp, reverse=True)

    # Link related brute-force events by source IP
    bf_events = [e for e in events if e.event_type == "ssh_bruteforce"]
    by_ip: dict[str, list[Event]] = {}
    for e in bf_events:
        key = e.source_ip or "unknown"
        by_ip.setdefault(key, []).append(e)
    for group in by_ip.values():
        if len(group) > 1:
            ids = [e.id for e in group]
            for e in group:
                e.related_event_ids = [i for i in ids if i != e.id]

    return {"events": events, "incidents": [], "hosts": _HOSTS}
