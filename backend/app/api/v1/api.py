from fastapi import APIRouter
from app.api.v1.endpoints import content, analytics, events

api_router = APIRouter()

api_router.include_router(
    content.router,
    prefix="/content",
    tags=["content"]
)

api_router.include_router(
    analytics.router,
    prefix="/analytics",
    tags=["analytics"]
)

api_router.include_router(events.router, tags=["events"])