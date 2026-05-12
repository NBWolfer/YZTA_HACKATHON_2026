from fastapi import APIRouter

from app.agent_log import get_logs, get_all_logs

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("/logs")
def get_agent_logs(since: int = 0):
    """
    Return agent activity logs.
    
    Query params:
        since: index to fetch from (for incremental polling).
               If 0 or omitted, returns all logs.
    """
    if since > 0:
        entries, next_index = get_logs(since)
    else:
        entries = get_all_logs()
        next_index = len(entries)

    return {
        "logs": entries,
        "next_index": next_index,
    }
