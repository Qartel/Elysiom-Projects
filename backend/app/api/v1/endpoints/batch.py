# backend/app/api/v1/endpoints/batch.py

from typing import Optional, Dict, Any, List
from uuid import uuid4
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile

from app.core.database import get_database
from app.core.auth import require_role
from app.api.v1.endpoints.events import publish_event
from app.models.batch_schemas import BatchUploadResponse, BatchUploadOptions
from app.services.batch_service import BatchService

router = APIRouter()


def now() -> datetime:
    return datetime.utcnow()


def iso(dt: datetime) -> str:
    return dt.isoformat()


def normalize_platform(p: str) -> str:
    return (p or "").strip().lower()


def _safe_str(x) -> str:
    return "" if x is None else str(x)


# --------------------------------------------------------------------
# LEGACY / COMPAT: BatchBoard JSON payload -> creates batch + jobs
# --------------------------------------------------------------------
@router.post("/batch")
async def create_batch_from_groups(
    payload: dict,
    ctx=Depends(require_role("publisher")),
    db=Depends(get_database),
):
    """
    LEGACY endpoint (kept for compatibility while we migrate to ZIP ingest).

    Uses tenant scoping:
      - workspaceId comes from X-Workspace-Id (ctx["workspaceId"])
      - ignores any workspaceId supplied by client payload

    Expected payload (from frontend BatchBoard):
    {
      "groups": [
        {
          "title": "reel",
          "caption": "...",
          "platforms": ["instagram","tiktok"],
          "scheduledAt": "2026-02-05T10:00:00.000Z",
          "files": [{ "name": "...", "type": "...", "size": 123 }]
        }
      ]
    }
    """
    workspace_id = ctx["workspaceId"]
    user_id = ctx["user"]["_id"]

    groups = payload.get("groups") or []
    if not isinstance(groups, list) or len(groups) == 0:
        raise HTTPException(status_code=400, detail="groups[] is required")

    batch_id = f"batch_{uuid4().hex}"

    batch_doc = {
        "_id": batch_id,
        "workspaceId": workspace_id,
        "createdAt": iso(now()),
        "updatedAt": iso(now()),
        "groupCount": len(groups),
        "jobCount": 0,
        "status": "created",
        "createdBy": user_id,
        "source": "batchboard_groups",
    }

    await db.batches.insert_one(batch_doc)

    created_jobs: List[Dict[str, Any]] = []

    for g in groups:
        title = _safe_str(g.get("title") or "post")
        caption = _safe_str(g.get("caption") or "")
        scheduled_at = g.get("scheduledAt")  # keep ISO string if provided
        platforms = [
            normalize_platform(x)
            for x in (g.get("platforms") or [])
            if normalize_platform(x)
        ]
        files = g.get("files") or []

        # skip invalid group rather than failing entire batch
        if not platforms:
            continue

        for platform in platforms:
            job_id = f"job_{uuid4().hex}"

            job = {
                "_id": job_id,
                "workspaceId": workspace_id,
                "batchId": batch_id,
                "platform": platform,
                "status": "scheduled" if scheduled_at else "queued",
                "title": f"{platform.title()} • {title}",
                "caption": caption,
                "assets": files,  # legacy metadata; ZIP path uses assets collection
                "scheduledAt": scheduled_at,
                "progress": {"stage": "created", "pct": 0},
                "attempts": 0,
                "lastError": None,
                "createdAt": iso(now()),
                "updatedAt": iso(now()),
                "lockedAt": None,
                "lockedBy": None,
                "lockExpiresAt": None,
            }

            await db.jobs.insert_one(job)
            created_jobs.append(job)

            # Publish job created event (WS + optional SSE)
            await publish_event(workspace_id, {
                "type": "job.created",
                "job": {
                    "_id": job["_id"],
                    "status": job["status"],
                    "platform": job["platform"],
                    "title": job["title"],
                    "progress": job["progress"],
                    "batchId": batch_id,
                }
            })

    await db.batches.update_one(
        {"_id": batch_id, "workspaceId": workspace_id},
        {"$set": {"status": "queued", "updatedAt": iso(now()), "jobCount": len(created_jobs)}},
    )

    await publish_event(workspace_id, {
        "type": "batch.created",
        "batchId": batch_id,
        "jobCount": len(created_jobs),
    })

    return {"batchId": batch_id, "jobs": created_jobs}


# --------------------------------------------------------------------
# ENTERPRISE: ZIP ingest -> assets + candidates (+ optional schedule/jobs)
# --------------------------------------------------------------------
@router.post("/batches/upload-zip", response_model=BatchUploadResponse)
async def upload_zip(
    file: UploadFile = File(...),
    options: Optional[BatchUploadOptions] = None,
    ctx=Depends(require_role("publisher")),
    db=Depends(get_database),
):
    """
    Enterprise ZIP ingest:
      - upload zip
      - safe extract
      - parse filenames
      - create assets + post_candidates
      - optionally scheduleAll + createJobs
    """
    if not file:
        raise HTTPException(status_code=400, detail="Missing file")

    if not (file.filename or "").lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip uploads are supported")

    opts = options or BatchUploadOptions()

    zip_bytes = await file.read()

    svc = BatchService(db)
    result = await svc.upload_zip_and_create(
        workspace_id=ctx["workspaceId"],
        user_id=ctx["user"]["_id"],
        filename=file.filename,
        zip_bytes=zip_bytes,
        schedule_all=opts.scheduleAll,
        create_jobs=opts.createJobs,
        policy=(opts.policy.model_dump() if opts.policy else None),
    )

    return result
