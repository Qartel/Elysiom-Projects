# backend/app/api/v1/endpoints/ws.py
import asyncio
import json
from datetime import datetime
from typing import Dict, Any, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.database import get_database
from app.core.auth import decode_access_token  # ✅ reuse same JWT logic as REST

router = APIRouter()

# workspaceId -> set of websocket connections
_ws_subscribers: dict[str, set[WebSocket]] = {}


def _get_bucket(workspace_id: str) -> set[WebSocket]:
    if workspace_id not in _ws_subscribers:
        _ws_subscribers[workspace_id] = set()
    return _ws_subscribers[workspace_id]


def _now_iso() -> str:
    return datetime.utcnow().isoformat()


async def ws_publish_event(workspace_id: str, payload: Dict[str, Any]):
    """
    Push event to all WS subscribers for a workspace.
    Payload is JSON and gets `ts`.
    """
    msg = {**payload, "ts": _now_iso()}
    dead: list[WebSocket] = []

    for ws in list(_get_bucket(workspace_id)):
        try:
            await ws.send_text(json.dumps(msg))
        except Exception:
            dead.append(ws)

    bucket = _get_bucket(workspace_id)
    for ws in dead:
        bucket.discard(ws)


async def _validate_membership(db, user_id: str, workspace_id: str) -> Optional[dict]:
    """
    Matches your string-id approach:
      users._id = "user_xxx"
      workspace_members.userId = "user_xxx"
      workspace_members.workspaceId = "ws_xxx"
    """
    user = await db.users.find_one({"_id": user_id})
    if not user or user.get("status") == "disabled":
        return None

    membership = await db.workspace_members.find_one({
        "workspaceId": workspace_id,
        "userId": user_id,
        "status": "active",
    })
    if not membership:
        return None

    return {
        "userId": user_id,
        "workspaceId": workspace_id,
        "role": membership.get("role", "viewer"),
    }


async def _auth_first_message(websocket: WebSocket) -> Optional[dict]:
    """
    Expect first WS message to be:
      { "type": "auth", "token": "<jwt>", "workspaceId": "<ws_xxx>" }
    """
    try:
        raw = await asyncio.wait_for(websocket.receive_text(), timeout=10)
    except Exception:
        await websocket.close(code=4401)  # Unauthorized
        return None

    try:
        msg = json.loads(raw)
    except Exception:
        await websocket.close(code=4400)  # Bad request
        return None

    if (msg.get("type") or "").lower() != "auth":
        await websocket.close(code=4400)
        return None

    token = (msg.get("token") or "").strip()
    workspace_id = (msg.get("workspaceId") or "").strip()

    if not token or not workspace_id:
        await websocket.close(code=4400)
        return None

    # ✅ use same decoder as REST
    try:
        payload = decode_access_token(token)
    except Exception:
        await websocket.close(code=4401)
        return None

    user_id = str(payload.get("sub") or "").strip()
    if not user_id:
        await websocket.close(code=4401)
        return None

    db = get_database()
    ctx = await _validate_membership(db, user_id, workspace_id)
    if not ctx:
        await websocket.close(code=4403)  # Forbidden
        return None

    return ctx


@router.websocket("/ws")
async def websocket_events(websocket: WebSocket):
    """
    Connect:
      ws://host/api/v1/ws

    First message must be auth:
      {"type":"auth","token":"<jwt>","workspaceId":"ws_xxx"}

    Server sends:
      {"type":"hello", ...}
      {"type":"job", ...}
      {"type":"upload", ...}
    """
    await websocket.accept()

    ctx = await _auth_first_message(websocket)
    if not ctx:
        return

    workspace_id = ctx["workspaceId"]
    bucket = _get_bucket(workspace_id)
    bucket.add(websocket)

    # hello handshake
    await websocket.send_text(json.dumps({
        "type": "hello",
        "workspaceId": workspace_id,
        "role": ctx.get("role", "viewer"),
        "ts": _now_iso(),
    }))

    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text(json.dumps({"type": "pong", "ts": _now_iso()}))
    except WebSocketDisconnect:
        bucket.discard(websocket)
    except Exception:
        bucket.discard(websocket)
        try:
            await websocket.close()
        except Exception:
            pass
