from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class PlatformType(str, Enum):
    INSTAGRAM = "instagram"
    YOUTUBE = "youtube"
    LINKEDIN = "linkedin"
    FACEBOOK = "facebook"
    THREADS = "threads"

class ContentStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    POSTED = "posted"

class ContentType(str, Enum):
    # Instagram
    POST = "post"
    REEL = "reel"
    STORY = "story"
    # YouTube
    VIDEO = "video"
    SHORT = "short"
    COMMUNITY = "community"
    # LinkedIn
    ARTICLE = "article"
    POLL = "poll"
    # Facebook
    EVENT = "event"
    # Threads
    TEXT = "text"
    THREAD = "thread"

class ContentBase(BaseModel):
    platform: PlatformType
    type: ContentType
    format: Optional[str] = None
    status: ContentStatus = ContentStatus.DRAFT
    title: str
    category: str
    caption: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None
    scheduledDate: Optional[datetime] = None
    postedDate: Optional[datetime] = None
    
    # Media
    mediaUrls: Optional[List[str]] = []
    thumbnailUrl: Optional[str] = None
    
    # Metrics
    views: Optional[int] = 0
    likes: Optional[int] = 0
    reactions: Optional[int] = 0
    comments: Optional[int] = 0
    shares: Optional[int] = 0
    replies: Optional[int] = 0
    reposts: Optional[int] = 0
    
    # Additional metadata
    tags: Optional[List[str]] = []
    duration: Optional[str] = None
    readTime: Optional[str] = None
    design: Optional[Dict[str, Any]] = {}
    
class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    status: Optional[ContentStatus] = None
    title: Optional[str] = None
    caption: Optional[str] = None
    content: Optional[str] = None
    scheduledDate: Optional[datetime] = None
    tags: Optional[List[str]] = None

class ContentInDB(ContentBase):
    id: str = Field(alias="_id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    userId: Optional[str] = None  # For multi-tenancy
    
    class Config:
        populate_by_name = True

class ContentResponse(ContentInDB):
    pass

# User Models (for future authentication)
class UserBase(BaseModel):
    email: EmailStr
    username: str
    fullName: Optional[str] = None
    
class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashedPassword: str
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

class UserResponse(UserBase):
    id: str
    isActive: bool
    createdAt: datetime

# Analytics Models
class PlatformStats(BaseModel):
    platform: PlatformType
    total: int
    posted: int
    scheduled: int
    draft: int
    avgEngagement: Optional[float] = None
    avgViews: Optional[int] = None

class OverallStats(BaseModel):
    totalContent: int
    posted: int
    scheduled: int
    draft: int
    platformStats: List[PlatformStats]