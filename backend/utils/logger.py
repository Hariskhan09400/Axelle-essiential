"""Structured logger that avoids leaking sensitive fields."""

import logging
import sys

# Fields that must never appear in log output
SENSITIVE_KEYS = {"password", "token", "secret", "api_key", "authorization"}


class SensitiveFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        msg = str(record.getMessage())
        for key in SENSITIVE_KEYS:
            if key.lower() in msg.lower():
                record.msg = "[REDACTED — sensitive field detected]"
                break
        return True


def get_logger(name: str = "axelle") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
        handler.addFilter(SensitiveFilter())
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG if os.environ.get("FLASK_ENV") == "development" else logging.INFO)
    return logger


import os  # noqa: E402 — used by get_logger for level check
