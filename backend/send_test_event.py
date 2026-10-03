"""Send one test event to Axelle Sentinel (live mode).

Usage (project root se):
    python send_test_event.py

Ye INGEST_API_KEY ko .env file se padhta hai.
"""

import os

import requests
from dotenv import load_dotenv

load_dotenv()

URL = os.environ.get("SENTINEL_URL", "http://127.0.0.1:5000/api/events/ingest")
KEY = os.environ.get("INGEST_API_KEY", "")

event = {
    "severity": "high",
    "event_type": "ssh_bruteforce",
    "host": "my-test-server",
    "source_ip": "203.0.113.45",
    "destination_ip": "192.168.56.20",
    "rule_id": "RL-5503",
    "rule_description": "Multiple SSH authentication failures from same source",
    "attempt_count": 27,
    "mitre": {
        "technique_id": "T1110.001",
        "technique_name": "Password Guessing",
        "tactic": "Credential Access",
    },
}

response = requests.post(URL, json=event, headers={"X-API-Key": KEY}, timeout=10)
print("Status:", response.status_code)
print(response.text)