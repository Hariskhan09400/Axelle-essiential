"""Validated event and alert query parameters shared by API routes."""

from flask import abort, request

import config


def _integer(name: str, default: str, minimum: int, maximum: int) -> int:
    try:
        value = int(request.args.get(name, default))
    except ValueError:
        abort(400, description=f"'{name}' must be an integer")
    if not minimum <= value <= maximum:
        abort(400, description=f"'{name}' must be between {minimum} and {maximum}")
    return value


def parse_event_query(default_sort: str = "timestamp") -> dict:
    """Parse and validate supported event/alert filters and pagination."""
    page = _integer("page", "1", 1, 10000)
    page_size = _integer("page_size", str(config.DEFAULT_PAGE_SIZE), 1, config.MAX_PAGE_SIZE)
    sort = request.args.get("sort", default_sort)
    if sort not in config.ALLOWED_SORT_FIELDS:
        abort(400, description=f"Invalid sort field: {sort}")

    default_order = "asc" if sort in {"severity", "event_type"} else "desc"
    sort_order = request.args.get("sort_order", default_order)
    if sort_order not in config.ALLOWED_SORT_ORDERS:
        abort(400, description=f"Invalid sort order: {sort_order}")

    severity = request.args.get("severity")
    if severity and severity not in config.ALLOWED_SEVERITIES:
        abort(400, description=f"Invalid severity: {severity}")

    event_type = request.args.get("event_type")
    if event_type and event_type not in config.ALLOWED_EVENT_TYPES:
        abort(400, description=f"Invalid event_type: {event_type}")

    status = request.args.get("status")
    if status and status not in config.ALLOWED_STATUSES:
        abort(400, description=f"Invalid status: {status}")

    search = request.args.get("q", "").strip()
    if len(search) > config.MAX_SEARCH_LENGTH:
        abort(400, description=f"'q' must be at most {config.MAX_SEARCH_LENGTH} characters")

    return {
        "page": page,
        "page_size": page_size,
        "sort": sort,
        "sort_order": sort_order,
        "severity": severity,
        "event_type": event_type,
        "status": status,
        "search": search,
    }