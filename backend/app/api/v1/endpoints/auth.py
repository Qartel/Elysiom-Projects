# backend/app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException
import logging

from app.core.database import get_database
from app.services.auth_service import AuthService
from app.core.auth import get_current_user
from app.models.auth_schemas import RegisterRequest, LoginRequest

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register")
async def register(payload: RegisterRequest, db=Depends(get_database)):
    try:
        svc = AuthService(db)
        return await svc.register(
            name=payload.name,
            email=payload.email,
            password=payload.password,
            workspace_name=payload.workspace_name,  # ✅ snake_case internal
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Auth register failed")
        # ✅ return JSON error so frontend/you can see it
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(payload: LoginRequest, db=Depends(get_database)):
    try:
        svc = AuthService(db)
        return await svc.login(email=payload.email, password=payload.password)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Auth login failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def me(user=Depends(get_current_user), db=Depends(get_database)):
    from app.repositories.auth_repo import AuthRepo
    repo = AuthRepo(db)
    workspaces = await repo.list_user_workspaces(user["_id"])

    return {
        "userId": str(user["_id"]),
        "email": user.get("email"),
        "name": user.get("name"),
        "status": user.get("status"),
        "workspaces": workspaces,
    }
