# backend/app/services/auth_service.py
from typing import Dict, Any
from uuid import uuid4

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

from app.core.auth import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.repositories.auth_repo import AuthRepo


class AuthService:
    def __init__(self, db):
        self.repo = AuthRepo(db)

    async def register(
        self,
        *,
        name: str,
        email: str,
        password: str,
        workspace_name: str,
    ) -> Dict[str, Any]:
        """
        Register:
          - create user
          - create workspace
          - create membership (owner)
          - return token + workspace list

        Notes:
          - IDs are strings (user_xxx, ws_xxx, mem_xxx)
          - We translate Mongo DuplicateKeyError into 409 (clean API behavior)
        """
        existing = await self.repo.find_user_by_email(email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user_id = f"user_{uuid4().hex}"
        ws_id = f"ws_{uuid4().hex}"
        mem_id = f"mem_{uuid4().hex}"

        pw_hash = hash_password(password)

        try:
            user = await self.repo.create_user(
                user_id=user_id,
                email=email,
                name=name,
                password_hash=pw_hash,
            )

            ws = await self.repo.create_workspace(
                workspace_id=ws_id,
                name=workspace_name,
                owner_user_id=user_id,
                plan="trial",
            )

            await self.repo.create_membership(
                membership_id=mem_id,
                workspace_id=ws_id,
                user_id=user_id,
                role="owner",
            )
        except DuplicateKeyError:
            # Covers cases like:
            # - users.email unique collision
            # - users.username unique collision (null/duplicate)
            # - workspaces.slug unique collision
            raise HTTPException(status_code=409, detail="User/workspace already exists (duplicate key)")
        except HTTPException:
            raise
        except Exception as e:
            # Avoid leaking raw DB errors in production; keep detail for now.
            raise HTTPException(status_code=500, detail=str(e))

        # ✅ sub should always be a string (your IDs are already strings)
        token = create_access_token(
            sub=str(user_id),
            expires_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        )

        workspaces = await self.repo.list_user_workspaces(user_id)

        return {
            "accessToken": token,
            "tokenType": "bearer",
            "user": {"userId": str(user_id), "email": user.get("email"), "name": user.get("name")},
            "workspaces": workspaces,
        }

    async def login(self, *, email: str, password: str) -> Dict[str, Any]:
        user = await self.repo.find_user_by_email(email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if user.get("status") == "disabled":
            raise HTTPException(status_code=403, detail="User disabled")

        if not verify_password(password, user.get("passwordHash", "")):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # NOTE: user["_id"] is your string user_id like "user_xxx"
        await self.repo.update_last_login(user["_id"])

        # ✅ always stringify sub for consistency
        token = create_access_token(
            sub=str(user["_id"]),
            expires_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        )

        workspaces = await self.repo.list_user_workspaces(str(user["_id"]))

        return {
            "accessToken": token,
            "tokenType": "bearer",
            "user": {"userId": str(user["_id"]), "email": user.get("email"), "name": user.get("name")},
            "workspaces": workspaces,
        }
