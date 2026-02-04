# backend/app/api/v1/endpoints/events.py
import asyncio
import json
from fastapi import APIRouter
from starlette.responses import StreamingResponse

router = APIRouter()

_subscribers: set[asyncio.Queue] = set()

async def _event_stream():
    q: asyncio.Queue = asyncio.Queue()
    _subscribers.add(q)
    try:
        # initial hello (helps client confirm connection)
        yield "event: hello\ndata: {}\n\n"
        while True:
            payload = await q.get()
            yield f"event: message\ndata: {json.dumps(payload)}\n\n"
    finally:
        _subscribers.discard(q)

@router.get("/events/stream")
async def stream_events():
    return StreamingResponse(_event_stream(), media_type="text/event-stream")

# Call this from publish/upload logic later
async def publish_event(payload: dict):
    for q in list(_subscribers):
        try:
            q.put_nowait(payload)
        except Exception:
            pass
