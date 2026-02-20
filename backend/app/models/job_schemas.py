from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.models.common import MongoBaseModel

class JobStatus(str, Enum):
    draft = "draft"
    scheduled = "scheduled"
    queued = "queued"
    processing = "processing"
    publishing = "publishing"
    succeeded = "succeeded"
    posted = "posted"
    failed = "failed"
    canceled = "canceled"

class AssetType(str, Enum):
    image = "image"
    video = "video"
    unknown = "unknown"

class AssetDoc(BaseModel):
    # For now: metadata only (later: storageKey/url/dimensions)
    name: str
    type: Optional[str] = None   # mime
    size: Optional[int] = None   # bytes
    ext: Optional[str] = None
    assetType: AssetType = AssetType.unknown

class JobProgress(BaseModel):
    stage: str = "created"
    pct: int = Field(default=0, ge=0, le=100)
    meta: Optional[Dict[str, Any]] = None

# --------------------
# DB Document Schemas
# --------------------

class BatchDoc(MongoBaseModel):
    workspaceId: str
    status: str = "created"
    groupCount: int = 0
    jobCount: int = 0
    createdAt: datetime
    updatedAt: datetime

class JobDoc(MongoBaseModel):
    workspaceId: str
    batchId: Optional[str] = None

    platform: str
    title: str
    caption: str = ""

    status: JobStatus = JobStatus.queued
    scheduledAt: Optional[str] = None  # store ISO string for simplicity

    assets: List[AssetDoc] = []

    progress: JobProgress = JobProgress()
    attempts: int = 0
    lastError: Optional[str] = None

    createdAt: str
    updatedAt: str

    lockedAt: Optional[str] = None
    lockedBy: Optional[str] = None
    lockExpiresAt: Optional[str] = None

# --------------------
# Requests/Responses
# --------------------

class BatchCreateGroup(BaseModel):
    title: str
    caption: str = ""
    platforms: List[str] = []
    scheduledAt: Optional[str] = None
    files: List[AssetDoc] = []

class BatchCreateRequest(BaseModel):
    workspaceId: str
    groups: List[BatchCreateGroup]

class BatchCreateResponse(BaseModel):
    batchId: str
    jobs: List[dict]  # keep loose because we return inserted docs from Mongo

class JobsListResponse(BaseModel):
    items: List[dict]
