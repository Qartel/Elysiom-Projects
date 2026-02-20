# backend/app/api/v1/endpoints/events.py
import asyncio
import json
from datetime import datetime
from fastapi import APIRouter, Query
from starlette.responses import StreamingResponse

# WebSocket broadcaster (preferred)
from app.api.v1.endpoints.ws import ws_publish_event

router = APIRouter()

# workspaceId -> set of subscriber queues (SSE legacy)
_subscribers: dict[str, set[asyncio.Queue]] = {}


def _get_bucket(workspace_id: str) -> set[asyncio.Queue]:
    if workspace_id not in _subscribers:
        _subscribers[workspace_id] = set()
    return _subscribers[workspace_id]


def _now_iso() -> str:
    return datetime.utcnow().isoformat()


async def publish_event(workspace_id: str, payload: dict):
    """
    Unified publisher:
      - fan-out to WS subscribers (primary)
      - fan-out to SSE subscribers (optional legacy)
    """
    msg = {**payload, "ts": _now_iso()}

    # WS (preferred)
    try:
        await ws_publish_event(workspace_id, msg)
    except Exception:
        # Don't break SSE if WS layer fails
        pass

    # SSE (optional)
    for q in list(_get_bucket(workspace_id)):
        try:
            q.put_nowait(msg)
        except Exception:
            pass


@router.get("/events/stream")
async def stream_events(workspaceId: str = Query(default="demo-workspace")):
    """
    SSE stream (legacy / optional).
    Keep for debugging even if Queue uses WS.
    """
    q: asyncio.Queue = asyncio.Queue()
    bucket = _get_bucket(workspaceId)
    bucket.add(q)

    async def gen():
        heartbeat_every = 20  # seconds
        try:
            # handshake
            yield "event: hello\ndata: {}\n\n"

            while True:
                try:
                    msg = await asyncio.wait_for(q.get(), timeout=heartbeat_every)
                    yield f"event: message\ndata: {json.dumps(msg)}\n\n"
                except asyncio.TimeoutError:
                    # heartbeat comment (valid SSE, ignored by clients)
                    yield f": heartbeat {datetime.utcnow().isoformat()}\n\n"
        finally:
            bucket.discard(q)

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            # Helps with Nginx buffering if you proxy SSE
            "X-Accel-Buffering": "no",
        },
    )
