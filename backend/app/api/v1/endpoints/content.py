from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import (
    ContentCreate, ContentUpdate, ContentResponse,
    PlatformType, ContentStatus
)
from app.services.content_service import ContentService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
content_service = ContentService()

@router.post("/", response_model=ContentResponse, status_code=201)
async def create_content(content: ContentCreate):
    """
    Create new content piece
    """
    try:
        result = await content_service.create_content(content)
        return result
    except Exception as e:
        logger.error(f"Error creating content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[ContentResponse])
async def get_all_content(
    platform: Optional[PlatformType] = None,
    status: Optional[ContentStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get all content with optional filters
    """
    try:
        result = await content_service.get_content(
            platform=platform,
            status=status,
            skip=skip,
            limit=limit
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{content_id}", response_model=ContentResponse)
async def get_content_by_id(content_id: str):
    """
    Get specific content by ID
    """
    try:
        result = await content_service.get_content_by_id(content_id)
        if not result:
            raise HTTPException(status_code=404, detail="Content not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(content_id: str, content_update: ContentUpdate):
    """
    Update existing content
    """
    try:
        result = await content_service.update_content(content_id, content_update)
        if not result:
            raise HTTPException(status_code=404, detail="Content not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{content_id}")
async def delete_content(content_id: str):
    """
    Delete content
    """
    try:
        result = await content_service.delete_content(content_id)
        if not result:
            raise HTTPException(status_code=404, detail="Content not found")
        return {"message": "Content deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{content_id}/duplicate", response_model=ContentResponse)
async def duplicate_content(
    content_id: str,
    target_platform: Optional[PlatformType] = None
):
    """
    Duplicate content to same or different platform
    """
    try:
        result = await content_service.duplicate_content(content_id, target_platform)
        if not result:
            raise HTTPException(status_code=404, detail="Content not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error duplicating content: {e}")
        raise HTTPException(status_code=500, detail=str(e))