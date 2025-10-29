from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGO_URL)
    db.db = db.client[settings.DB_NAME]
    logger.info(f"Connected to MongoDB: {settings.DB_NAME}")
    
    # Create indexes
    await create_indexes()

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db.client:
        db.client.close()
    logger.info("MongoDB connection closed")

async def create_indexes():
    """Create database indexes for performance"""
    # Content indexes
    await db.db.content.create_index("platform")
    await db.db.content.create_index("status")
    await db.db.content.create_index("scheduledDate")
    await db.db.content.create_index([("platform", 1), ("status", 1)])
    
    # User indexes (for future multi-tenancy)
    await db.db.users.create_index("email", unique=True)
    await db.db.users.create_index("username", unique=True)
    
    logger.info("Database indexes created")

def get_database():
    return db.db