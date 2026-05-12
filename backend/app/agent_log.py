"""
Shared in-memory agent activity log.

Stores recent agent events for the frontend to poll.
Used by the orchestrator to record real tool calls and chat completions.
"""

from datetime import datetime
from threading import Lock

MAX_LOG_SIZE = 200

_log: list[dict] = []
_lock = Lock()


def add_log(agent: str, message: str, level: str = "info"):
    """Append a log entry. Thread-safe."""
    entry = {
        "time": datetime.now().strftime("%H:%M:%S.%f")[:-3],
        "agent": agent,
        "message": message,
        "level": level,
    }
    with _lock:
        _log.append(entry)
        # Trim old entries to avoid unbounded memory growth
        if len(_log) > MAX_LOG_SIZE:
            del _log[: len(_log) - MAX_LOG_SIZE]


def get_logs(since_index: int = 0) -> tuple[list[dict], int]:
    """
    Return log entries starting from `since_index`.
    Returns (entries, next_index) so the frontend can do incremental polling.
    """
    with _lock:
        entries = _log[since_index:]
        next_index = len(_log)
    return entries, next_index


def get_all_logs() -> list[dict]:
    """Return all log entries."""
    with _lock:
        return list(_log)
