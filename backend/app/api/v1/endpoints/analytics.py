from fastapi import APIRouter, HTTPException
from app.models.schemas import OverallStats, PlatformStats, PlatformType
from app.services.analytics_service import AnalyticsService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
analytics_service = AnalyticsService()

@router.get("/overview", response_model=OverallStats)
async def get_overall_stats():
    """
    Get overall statistics across all platforms
    """
    try:
        result = await analytics_service.get_overall_stats()
        return result
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/platform/{platform}", response_model=PlatformStats)
async def get_platform_stats(platform: PlatformType):
    """
    Get statistics for specific platform
    """
    try:
        result = await analytics_service.get_platform_stats(platform)
        return result
    except Exception as e:
        logger.error(f"Error fetching platform stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))