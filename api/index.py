"""Vercel serverless entry — one Python function that serves the Flask API."""

from __future__ import annotations

import sys
from pathlib import Path

_backend = Path(__file__).resolve().parent.parent / "backend"
backend_path = str(_backend)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from sentinel import app  # noqa: E402
