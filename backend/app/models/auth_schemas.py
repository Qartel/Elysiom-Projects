# backend/app/models/auth_schemas.py
from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

from app.models.common import MongoBaseModel

class UserStatus(str, Enum):
    active = "active"
    disabled = "disabled"

class WorkspacePlan(str, Enum):
    trial = "trial"
    pro = "pro"
    enterprise = "enterprise"

class MemberStatus(str, Enum):
    invited = "invited"
    active = "active"
    suspended = "suspended"

class WorkspaceRole(str, Enum):
    owner = "owner"
    admin = "admin"
    manager = "manager"
    publisher = "publisher"
    viewer = "viewer"

# --------------------
# DB Document Schemas
# --------------------

class UserDoc(MongoBaseModel):
    email: EmailStr
    passwordHash: str
    name: str
    status: UserStatus = UserStatus.active
    createdAt: datetime
    lastLoginAt: Optional[datetime] = None

class WorkspaceDoc(MongoBaseModel):
    name: str
    slug: str
    ownerUserId: str
    plan: WorkspacePlan = WorkspacePlan.trial
    createdAt: datetime

class WorkspaceMemberDoc(MongoBaseModel):
    workspaceId: str
    userId: str
    role: WorkspaceRole = WorkspaceRole.viewer
    status: MemberStatus = MemberStatus.active
    createdAt: datetime

# --------------------
# Request/Response
# --------------------

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    # internal python name: workspace_name
    # accept frontend key: workspaceName
    workspace_name: str = Field(..., alias="workspaceName")

    class Config:
        populate_by_name = True  # allow workspace_name or workspaceName

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

class AuthTokens(BaseModel):
    accessToken: str
    tokenType: str = "bearer"

class WorkspaceSummary(BaseModel):
    workspaceId: str
    name: str
    slug: str
    role: WorkspaceRole

class MeResponse(BaseModel):
    userId: str
    email: EmailStr
    name: str
    status: UserStatus
    workspaces: List[WorkspaceSummary]

class JwtClaims(BaseModel):
    sub: str
    exp: int
    iat: int
