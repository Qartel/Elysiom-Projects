# backend/app/repositories/jobs_repo.py
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

def now():
    return datetime.utcnow()

def iso(dt: datetime):
    return dt.isoformat()

class JobsRepo:
    def __init__(self, db):
        self.db = db

    async def list_jobs(self, *, workspace_id: str, statuses: List[str], limit: int = 50) -> List[Dict[str, Any]]:
        cursor = (
            self.db.jobs
            .find({"workspaceId": workspace_id, "status": {"$in": statuses}})
            .sort("createdAt", -1)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)

    async def lock_job(self, *, job_id: str, worker_id: str, lock_minutes: int = 8) -> Dict[str, Any]:
        lock_expires = now() + timedelta(minutes=lock_minutes)

        q = {
            "_id": job_id,
            "status": "queued",
            "$or": [
                {"lockExpiresAt": None},
                {"lockExpiresAt": {"$lt": iso(now())}},
            ],
        }

        update = {
            "$set": {
                "status": "processing",
                "lockedAt": iso(now()),
                "lockedBy": worker_id,
                "lockExpiresAt": iso(lock_expires),
                "updatedAt": iso(now()),
                "progress.stage": "locked",
                "progress.pct": 5,
            }
        }

        doc = await self.db.jobs.find_one_and_update(q, update, return_document=True)
        return doc

    async def update_job(self, *, job_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        set_fields = {"updatedAt": iso(now())}

        for k in ("status", "progress", "lastError", "attempts"):
            if k in payload:
                set_fields[k] = payload[k]

        if payload.get("status") in ("succeeded", "failed", "canceled", "posted"):
            set_fields["lockedAt"] = None
            set_fields["lockedBy"] = None
            set_fields["lockExpiresAt"] = None

        await self.db.jobs.update_one({"_id": job_id}, {"$set": set_fields})
        return await self.db.jobs.find_one({"_id": job_id})
