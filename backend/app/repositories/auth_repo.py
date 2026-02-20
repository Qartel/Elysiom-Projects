# backend/app/repositories/auth_repo.py
from typing import Any, Dict, List, Optional
from datetime import datetime
import re
from uuid import uuid4

def utcnow():
    return datetime.utcnow()

def slugify(s: str) -> str:
    s = (s or "").strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or f"ws-{uuid4().hex[:8]}"

class AuthRepo:
    def __init__(self, db):
        self.db = db
        self.users = db.users
        self.workspaces = db.workspaces
        self.members = db.workspace_members

    async def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return await self.users.find_one({"email": (email or "").strip().lower()})

    async def create_user(self, *, user_id: str, email: str, name: str, password_hash: str) -> Dict[str, Any]:
        doc = {
            "_id": str(user_id),  # ✅ string ids everywhere
            "email": (email or "").strip().lower(),
            "name": name,
            "passwordHash": password_hash,
            "status": "active",
            "createdAt": utcnow(),
            "lastLoginAt": None,
        }
        await self.users.insert_one(doc)
        return doc

    async def update_last_login(self, user_id: str) -> None:
        await self.users.update_one(
            {"_id": str(user_id)},
            {"$set": {"lastLoginAt": utcnow()}}
        )

    async def create_workspace(
        self,
        *,
        workspace_id: str,
        name: str,
        owner_user_id: str,
        plan: str = "trial",
    ) -> Dict[str, Any]:
        # ✅ generate slug + handle collisions
        base_slug = slugify(name)
        slug = base_slug

        # try a few times if slug already used
        for i in range(6):
            exists = await self.workspaces.find_one({"slug": slug})
            if not exists:
                break
            slug = f"{base_slug}-{uuid4().hex[:4]}"

        doc = {
            "_id": str(workspace_id),
            "workspaceId": str(workspace_id),  # optional, helps frontend
            "name": name,
            "slug": slug,
            "ownerUserId": str(owner_user_id),
            "plan": plan,
            "createdAt": utcnow(),
        }
        await self.workspaces.insert_one(doc)
        return doc

    async def create_membership(
        self,
        *,
        membership_id: str,
        workspace_id: str,
        user_id: str,
        role: str = "owner",
        status: str = "active",
    ) -> Dict[str, Any]:
        doc = {
            "_id": str(membership_id),
            "workspaceId": str(workspace_id),
            "userId": str(user_id),
            "role": role,
            "status": status,
            "createdAt": utcnow(),
        }
        await self.members.insert_one(doc)
        return doc

    async def list_user_workspaces(self, user_id: str) -> List[Dict[str, Any]]:
        user_id = str(user_id)

        # memberships for user
        mems = await self.members.find({"userId": user_id, "status": {"$ne": "suspended"}}).to_list(length=200)
        ws_ids = [m["workspaceId"] for m in mems]

        if not ws_ids:
            return []

        wss = await self.workspaces.find({"_id": {"$in": ws_ids}}).to_list(length=200)
        ws_by_id = {w["_id"]: w for w in wss}

        out: List[Dict[str, Any]] = []
        for m in mems:
            w = ws_by_id.get(m["workspaceId"])
            if not w:
                continue
            out.append({
                "workspaceId": w.get("workspaceId") or w["_id"],
                "name": w.get("name"),
                "slug": w.get("slug"),
                "role": m.get("role", "member"),
                "status": m.get("status", "active"),
            })

        # stable sort for UI
        out.sort(key=lambda x: (x.get("name") or "").lower())
        return out
