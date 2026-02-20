# backend/app/core/auth.py
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Callable

from fastapi import Depends, Header, HTTPException
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings
from app.core.database import get_database

# ✅ No bcrypt dependency. No 72-byte limit. No backend mismatch issues.
# If you previously had bcrypt hashes, you *can* keep bcrypt in the list,
# but since bcrypt is currently broken in your env, we exclude it for stability.
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)

ROLE_ORDER = {
    "viewer": 1,
    "publisher": 2,
    "manager": 3,
    "admin": 4,
    "owner": 5,
}


def hash_password(password: str) -> str:
    if not password:
        raise HTTPException(status_code=400, detail="Password is required")
    try:
        return pwd_context.hash(password)
    except Exception as e:
        # clean API error instead of crashing
        raise HTTPException(status_code=500, detail=str(e))


def verify_password(password: str, password_hash: str) -> bool:
    if not password_hash:
        return False
    try:
        return pwd_context.verify(password, password_hash)
    except Exception:
        return False


def create_access_token(*, sub: str, expires_minutes: int) -> str:
    now = datetime.utcnow()
    exp = now + timedelta(minutes=expires_minutes)
    claims = {
        "sub": str(sub),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(claims, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False},
            leeway=60,  # ✅ tolerate 60s skew
        )

        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Invalid token (no sub)")

        return payload

    except JWTError as e:
        # TEMP: show why
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def safe_user(user: Dict[str, Any]) -> Dict[str, Any]:
    if not user:
        return user
    return {
        "_id": str(user.get("_id", "")),
        "email": user.get("email"),
        "name": user.get("name"),
        "status": user.get("status", "active"),
        "createdAt": user.get("createdAt"),
        "lastLoginAt": user.get("lastLoginAt"),
    }


async def get_current_user(
    authorization: str = Header(default=""),
    db=Depends(get_database),
) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ", 1)[1].strip()
    payload = decode_access_token(token)
    user_id = str(payload.get("sub"))

    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.get("status") == "disabled":
        raise HTTPException(status_code=403, detail="User disabled")

    return user


async def get_workspace_id(
    x_workspace_id: Optional[str] = Header(default=None, alias="X-Workspace-Id"),
) -> str:
    if not x_workspace_id:
        raise HTTPException(status_code=400, detail="Missing X-Workspace-Id header")
    return x_workspace_id


async def require_workspace(
    user=Depends(get_current_user),
    workspace_id: str = Depends(get_workspace_id),
    db=Depends(get_database),
) -> Dict[str, Any]:
    membership = await db.workspace_members.find_one({
        "workspaceId": workspace_id,
        "userId": str(user["_id"]),
        "status": "active",
    })
    if not membership:
        raise HTTPException(status_code=403, detail="No workspace access")

    return {
        "user": safe_user(user),
        "workspaceId": workspace_id,
        "role": membership.get("role", "viewer"),
        "membershipId": membership.get("_id") or membership.get("id"),
    }


def require_role(min_role: str) -> Callable:
    async def _dep(ctx=Depends(require_workspace)) -> Dict[str, Any]:
        have = ROLE_ORDER.get(ctx.get("role", "viewer"), 1)
        need = ROLE_ORDER.get(min_role, 1)
        if have < need:
            raise HTTPException(status_code=403, detail="Insufficient role")
        return ctx
    return _dep
