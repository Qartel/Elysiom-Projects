from typing import List, Optional
from app.core.database import get_database
from app.models.schemas import (
    ContentCreate, ContentUpdate, ContentResponse,
    PlatformType, ContentStatus
)
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ContentService:
    def __init__(self):
        self.collection_name = "content"
    
    def _serialize_content(self, content: dict) -> dict:
        """Convert MongoDB document to response format"""
        if content and "_id" in content:
            content["id"] = str(content["_id"])
            content["_id"] = str(content["_id"])
        return content
    
    async def create_content(self, content: ContentCreate) -> ContentResponse:
        """
        Create new content piece
        """
        db = get_database()
        
        content_dict = content.model_dump()
        content_dict["createdAt"] = datetime.utcnow()
        content_dict["updatedAt"] = datetime.utcnow()
        
        result = await db[self.collection_name].insert_one(content_dict)
        created_content = await db[self.collection_name].find_one({"_id": result.inserted_id})
        
        return ContentResponse(**self._serialize_content(created_content))
    
    async def get_content(
        self,
        platform: Optional[PlatformType] = None,
        status: Optional[ContentStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[ContentResponse]:
        """
        Get content with optional filters
        """
        db = get_database()
        
        query = {}
        if platform:
            query["platform"] = platform
        if status:
            query["status"] = status
        
        cursor = db[self.collection_name].find(query).skip(skip).limit(limit).sort("createdAt", -1)
        content_list = await cursor.to_list(length=limit)
        
        return [ContentResponse(**self._serialize_content(c)) for c in content_list]
    
    async def get_content_by_id(self, content_id: str) -> Optional[ContentResponse]:
        """
        Get specific content by ID
        """
        db = get_database()
        
        try:
            content = await db[self.collection_name].find_one({"_id": ObjectId(content_id)})
            if content:
                return ContentResponse(**self._serialize_content(content))
            return None
        except Exception as e:
            logger.error(f"Error getting content by ID: {e}")
            return None
    
    async def update_content(
        self,
        content_id: str,
        content_update: ContentUpdate
    ) -> Optional[ContentResponse]:
        """
        Update existing content
        """
        db = get_database()
        
        try:
            update_data = content_update.model_dump(exclude_unset=True)
            update_data["updatedAt"] = datetime.utcnow()
            
            result = await db[self.collection_name].find_one_and_update(
                {"_id": ObjectId(content_id)},
                {"$set": update_data},
                return_document=True
            )
            
            if result:
                return ContentResponse(**self._serialize_content(result))
            return None
        except Exception as e:
            logger.error(f"Error updating content: {e}")
            return None
    
    async def delete_content(self, content_id: str) -> bool:
        """
        Delete content
        """
        db = get_database()
        
        try:
            result = await db[self.collection_name].delete_one({"_id": ObjectId(content_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting content: {e}")
            return False
    
    async def duplicate_content(
        self,
        content_id: str,
        target_platform: Optional[PlatformType] = None
    ) -> Optional[ContentResponse]:
        """
        Duplicate content to same or different platform
        """
        original_content = await self.get_content_by_id(content_id)
        if not original_content:
            return None
        
        # Create new content from original
        content_dict = original_content.model_dump(exclude={"id", "createdAt", "updatedAt", "postedDate"})
        
        # Change platform if specified
        if target_platform:
            content_dict["platform"] = target_platform
        
        # Reset to draft and clear metrics
        content_dict["status"] = ContentStatus.DRAFT
        content_dict["views"] = 0
        content_dict["likes"] = 0
        content_dict["reactions"] = 0
        content_dict["comments"] = 0
        content_dict["shares"] = 0
        content_dict["title"] = f"{content_dict['title']} (Copy)"
        
        new_content = ContentCreate(**content_dict)
        return await self.create_content(new_content)