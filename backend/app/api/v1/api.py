# backend/app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import content, analytics, events, auth, jobs, ws, batch

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

api_router.include_router(events.router, tags=["events"])
api_router.include_router(jobs.router, tags=["jobs"])

# Batch ZIP ingest + candidate creation
api_router.include_router(batch.router, tags=["batch"])

# WebSocket endpoint lives here
api_router.include_router(ws.router, tags=["ws"])
