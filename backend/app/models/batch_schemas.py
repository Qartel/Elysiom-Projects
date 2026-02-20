# backend/app/models/batch_schemas.py
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SchedulePolicy(BaseModel):
    startAt: Optional[str] = None                 # ISO
    daysOfWeek: List[int] = Field(default_factory=lambda: [1, 3, 5, 0])  # Mon Wed Fri Sun
    timesOfDay: List[str] = Field(default_factory=lambda: ["09:00"])     # local time strings
    weeks: Optional[int] = None                   # auto computed if not provided

class BatchUploadOptions(BaseModel):
    scheduleAll: bool = False
    createJobs: bool = False                      # if true, creates platform jobs from candidates
    policy: Optional[SchedulePolicy] = None

class InvalidFileOut(BaseModel):
    name: str
    issues: List[str]

class AssetOut(BaseModel):
    assetId: str
    originalName: str
    storedKey: str
    ext: str
    size: int
    mime: Optional[str] = None
    parsed: Dict[str, Any] = Field(default_factory=dict)

class CandidateOut(BaseModel):
    candidateId: str
    order: int
    title: str
    caption: str = ""
    platforms: List[str] = Field(default_factory=list)
    types: List[str] = Field(default_factory=list)
    assetIds: List[str] = Field(default_factory=list)
    issues: List[str] = Field(default_factory=list)
    status: str = "draft"
    scheduledAt: Optional[str] = None

class JobOut(BaseModel):
    jobId: str
    platform: str
    status: str
    scheduledAt: Optional[str] = None

class BatchUploadResponse(BaseModel):
    batchId: str
    workspaceId: str
    status: str
    totals: Dict[str, int]
    candidates: List[CandidateOut]
    invalid: List[InvalidFileOut]
    jobs: List[JobOut] = Field(default_factory=list)
