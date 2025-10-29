from app.core.database import get_database
from app.models.schemas import OverallStats, PlatformStats, PlatformType
import logging

logger = logging.getLogger(__name__)

class AnalyticsService:
    def __init__(self):
        self.collection_name = "content"
    
    async def get_overall_stats(self) -> OverallStats:
        """
        Get overall statistics across all platforms
        """
        db = get_database()
        
        # Get total counts
        pipeline = [
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        status_counts = {}
        async for doc in db[self.collection_name].aggregate(pipeline):
            status_counts[doc["_id"]] = doc["count"]
        
        total_content = sum(status_counts.values())
        
        # Get platform stats
        platform_stats = []
        for platform in PlatformType:
            stats = await self.get_platform_stats(platform)
            platform_stats.append(stats)
        
        return OverallStats(
            totalContent=total_content,
            posted=status_counts.get("posted", 0),
            scheduled=status_counts.get("scheduled", 0),
            draft=status_counts.get("draft", 0),
            platformStats=platform_stats
        )
    
    async def get_platform_stats(self, platform: PlatformType) -> PlatformStats:
        """
        Get statistics for specific platform
        """
        db = get_database()
        
        # Get counts by status
        pipeline = [
            {"$match": {"platform": platform}},
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        status_counts = {}
        async for doc in db[self.collection_name].aggregate(pipeline):
            status_counts[doc["_id"]] = doc["count"]
        
        total = sum(status_counts.values())
        
        # Calculate engagement metrics for posted content
        engagement_pipeline = [
            {"$match": {"platform": platform, "status": "posted"}},
            {
                "$group": {
                    "_id": None,
                    "avgViews": {"$avg": "$views"},
                    "avgLikes": {"$avg": "$likes"},
                    "avgReactions": {"$avg": "$reactions"},
                    "avgComments": {"$avg": "$comments"},
                }
            }
        ]
        
        avg_engagement = None
        avg_views = None
        
        async for doc in db[self.collection_name].aggregate(engagement_pipeline):
            # Calculate simple engagement rate
            total_interactions = (doc.get("avgLikes", 0) or 0) + \
                               (doc.get("avgReactions", 0) or 0) + \
                               (doc.get("avgComments", 0) or 0)
            views = doc.get("avgViews", 0) or 0
            
            if views > 0:
                avg_engagement = round((total_interactions / views) * 100, 2)
            
            avg_views = int(views) if views else None
        
        return PlatformStats(
            platform=platform,
            total=total,
            posted=status_counts.get("posted", 0),
            scheduled=status_counts.get("scheduled", 0),
            draft=status_counts.get("draft", 0),
            avgEngagement=avg_engagement,
            avgViews=avg_views
        )