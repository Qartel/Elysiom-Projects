# backend/app/api/v1/endpoints/jobs.py
from fastapi import APIRouter, Depends, Query, HTTPException
from datetime import datetime, timedelta
from bson import ObjectId

from app.core.database import get_database
from app.api.v1.endpoints.events import publish_event

# Motor uses PyMongo enums for return_document
try:
    from pymongo import ReturnDocument
except Exception:
    ReturnDocument = None  # fallback if pymongo isn't installed

router = APIRouter()


def now():
    return datetime.utcnow()


def iso(dt: datetime):
    return dt.isoformat()


def oid(maybe_id: str):
    """
    Accept either ObjectId string or a plain string.
    - If it's a valid ObjectId hex string, convert to ObjectId
    - Otherwise, return as-is
    """
    try:
        return ObjectId(maybe_id)
    except Exception:
        return maybe_id


def to_json(doc: dict):
    """
    Convert Mongo documents to JSON-safe dicts.
    - ObjectId -> str
    """
    if not doc:
        return doc
    if isinstance(doc.get("_id"), ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("/jobs")
async def list_jobs(
    workspaceId: str = Query(default="demo-workspace"),
    status: str = Query(default="queued,processing,failed"),
    limit: int = Query(default=50, ge=1, le=200),
    db=Depends(get_database),
):
    """
    Return jobs for a workspace filtered by statuses.
    Frontend expects: { jobs: [...] }
    """
    if not workspaceId:
        raise HTTPException(status_code=400, detail="workspaceId is required")

    statuses = [s.strip() for s in status.split(",") if s.strip()]

    cursor = (
        db.jobs.find({"workspaceId": workspaceId, "status": {"$in": statuses}})
        .sort("createdAt", -1)
        .limit(limit)
    )
    items = await cursor.to_list(length=limit)
    items = [to_json(x) for x in items]

    return {"jobs": items}


@router.post("/jobs/{jobId}/lock")
async def lock_job(
    jobId: str,
    workspaceId: str = Query(default="demo-workspace"),
    workerId: str = Query(default="n8n-worker"),
    lockMinutes: int = Query(default=8, ge=1, le=60),
    db=Depends(get_database),
):
    """
    Atomic lock:
    - only lock if queued
    - and unlocked OR lock expired
    """
    if not workspaceId:
        raise HTTPException(status_code=400, detail="workspaceId is required")

    lock_expires = now() + timedelta(minutes=lockMinutes)

    q = {
        "_id": oid(jobId),
        "workspaceId": workspaceId,
        "status": "queued",
        "$or": [
            {"lockExpiresAt": None},
            {"lockExpiresAt": {"$exists": False}},
            {"lockExpiresAt": {"$lt": iso(now())}},
        ],
    }

    update = {
        "$set": {
            "status": "processing",
            "lockedAt": iso(now()),
            "lockedBy": workerId,
            "lockExpiresAt": iso(lock_expires),
            "updatedAt": iso(now()),
            "progress": {
                "stage": "locked",
                "pct": 5,
            },
        }
    }

    if ReturnDocument:
        doc = await db.jobs.find_one_and_update(q, update, return_document=ReturnDocument.AFTER)
    else:
        res = await db.jobs.update_one(q, update)
        if res.modified_count != 1:
            doc = None
        else:
            doc = await db.jobs.find_one({"_id": oid(jobId), "workspaceId": workspaceId})

    if not doc:
        raise HTTPException(status_code=409, detail="Job not available to lock")

    doc = to_json(doc)

    await publish_event(workspaceId, {
        "type": "job",
        "job": {
            "_id": doc.get("_id"),
            "status": doc.get("status"),
            "platform": doc.get("platform"),
            "progress": doc.get("progress"),
            "lockedBy": doc.get("lockedBy"),
        },
    })

    return {"job": doc}


@router.patch("/jobs/{jobId}")
async def update_job(
    jobId: str,
    payload: dict,
    workspaceId: str = Query(default="demo-workspace"),
    db=Depends(get_database),
):
    """
    payload can include:
      status, progress:{stage,pct}, lastError, attempts
    """
    if not workspaceId:
        raise HTTPException(status_code=400, detail="workspaceId is required")

    doc = await db.jobs.find_one({"_id": oid(jobId), "workspaceId": workspaceId})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")

    set_fields = {"updatedAt": iso(now())}

    if "status" in payload:
        set_fields["status"] = payload["status"]
    if "progress" in payload:
        set_fields["progress"] = payload["progress"]
    if "lastError" in payload:
        set_fields["lastError"] = payload["lastError"]
    if "attempts" in payload:
        set_fields["attempts"] = payload["attempts"]

    # unlock on terminal states
    if payload.get("status") in ("succeeded", "failed", "canceled", "posted"):
        set_fields["lockedAt"] = None
        set_fields["lockedBy"] = None
        set_fields["lockExpiresAt"] = None

    await db.jobs.update_one({"_id": oid(jobId), "workspaceId": workspaceId}, {"$set": set_fields})
    updated = await db.jobs.find_one({"_id": oid(jobId), "workspaceId": workspaceId})
    updated = to_json(updated)

    await publish_event(workspaceId, {
        "type": "job",
        "job": {
            "_id": updated.get("_id"),
            "status": updated.get("status"),
            "platform": updated.get("platform"),
            "progress": updated.get("progress"),
            "lastError": updated.get("lastError"),
            "attempts": updated.get("attempts"),
        },
    })

    return {"job": updated}
