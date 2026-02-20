# backend/app/repositories/batches_repo.py
from typing import Any, Dict, List, Optional
from datetime import datetime

def now_iso() -> str:
    return datetime.utcnow().isoformat()

class BatchesRepo:
    def __init__(self, db):
        self.db = db

    async def create_batch(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        await self.db.batches.insert_one(doc)
        return doc

    async def update_batch(self, batch_id: str, workspace_id: str, patch: Dict[str, Any]):
        patch = {**patch, "updatedAt": now_iso()}
        await self.db.batches.update_one({"_id": batch_id, "workspaceId": workspace_id}, {"$set": patch})

    async def insert_assets(self, assets: List[Dict[str, Any]]):
        if not assets:
            return
        await self.db.assets.insert_many(assets)

    async def insert_candidates(self, candidates: List[Dict[str, Any]]):
        if not candidates:
            return
        await self.db.post_candidates.insert_many(candidates)

    async def insert_jobs(self, jobs: List[Dict[str, Any]]):
        if not jobs:
            return
        await self.db.jobs.insert_many(jobs)

    async def list_candidates(self, workspace_id: str, batch_id: str) -> List[Dict[str, Any]]:
        cursor = self.db.post_candidates.find({"workspaceId": workspace_id, "batchId": batch_id}).sort("order", 1)
        return await cursor.to_list(length=500)

    async def list_assets(self, workspace_id: str, batch_id: str) -> List[Dict[str, Any]]:
        cursor = self.db.assets.find({"workspaceId": workspace_id, "batchId": batch_id}).sort("createdAt", -1)
        return await cursor.to_list(length=2000)
