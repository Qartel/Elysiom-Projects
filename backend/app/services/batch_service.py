# backend/app/services/batch_service.py
from __future__ import annotations
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime
from uuid import uuid4
import io
import zipfile

from fastapi import HTTPException

from app.core.config import settings
from app.api.v1.endpoints.events import publish_event
from app.repositories.batches_repo import BatchesRepo, now_iso
from app.services.storage_service import StorageService
from app.utils.batch_parser import build_candidates, schedule_candidates, parse_filename

def _is_safe_zip_name(name: str) -> bool:
    # block path traversal and absolute paths
    if not name:
        return False
    n = name.replace("\\", "/")
    if n.startswith("/") or n.startswith("../") or "/../" in n:
        return False
    return True

def _guess_mime(name: str) -> Optional[str]:
    ext = (name.split(".")[-1] or "").lower()
    if ext in ("jpg", "jpeg"): return "image/jpeg"
    if ext == "png": return "image/png"
    if ext == "webp": return "image/webp"
    if ext == "gif": return "image/gif"
    if ext == "mp4": return "video/mp4"
    if ext == "mov": return "video/quicktime"
    if ext == "webm": return "video/webm"
    return None

class BatchService:
    def __init__(self, db):
        self.db = db
        self.repo = BatchesRepo(db)
        self.storage = StorageService()

    async def upload_zip_and_create(
        self,
        *,
        workspace_id: str,
        user_id: str,
        filename: str,
        zip_bytes: bytes,
        schedule_all: bool,
        create_jobs: bool,
        policy: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        max_bytes = int(settings.MAX_UPLOAD_SIZE_MB) * 1024 * 1024
        if len(zip_bytes) > max_bytes:
            raise HTTPException(status_code=413, detail=f"ZIP exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

        batch_id = f"batch_{uuid4().hex}"

        batch_doc = {
            "_id": batch_id,
            "workspaceId": workspace_id,
            "filename": filename,
            "uploadedBy": user_id,
            "status": "uploaded",
            "totals": {"files": 0, "candidates": 0, "jobs": 0, "invalid": 0},
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        }

        await self.repo.create_batch(batch_doc)

        await publish_event(workspace_id, {"type": "batch", "stage": "uploaded", "batchId": batch_id})

        # save the zip for audit/debug
        try:
            safe_name = filename or f"{batch_id}.zip"
            if not safe_name.lower().endswith(".zip"):
                safe_name = f"{safe_name}.zip"
            self.storage.save_zip(workspace_id, batch_id, safe_name, zip_bytes)
        except Exception:
            # non-fatal
            pass

        # extract + store assets
        try:
            zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
        except Exception:
            await self.repo.update_batch(batch_id, workspace_id, {"status": "failed"})
            raise HTTPException(status_code=400, detail="Invalid ZIP file")

        await self.repo.update_batch(batch_id, workspace_id, {"status": "extracting"})
        await publish_event(workspace_id, {"type": "batch", "stage": "extracting", "batchId": batch_id})

        assets_docs: List[Dict[str, Any]] = []
        parser_entries: List[Dict[str, Any]] = []

        total_files = 0
        total_asset_bytes = 0
        max_files = 2000  # safety cap

        for info in zf.infolist():
            if info.is_dir():
                continue

            if total_files >= max_files:
                break

            name_in_zip = info.filename
            if not _is_safe_zip_name(name_in_zip):
                continue

            # read bytes
            try:
                data = zf.read(info)
            except Exception:
                continue

            total_files += 1
            total_asset_bytes += len(data)

            if total_asset_bytes > (max_bytes * 5):
                # cap extracted total bytes
                break

            asset_id = f"asset_{uuid4().hex}"
            stored_key = self.storage.save_asset_bytes(workspace_id, batch_id, name_in_zip, data)

            mime = _guess_mime(name_in_zip)

            parsed = parse_filename(name_in_zip)
            parsed_obj = {
                "order": parsed.order,
                "platform": parsed.platform,
                "type": parsed.type,
                "label": parsed.label,
                "ext": parsed.ext,
                "ok": parsed.ok,
                "issues": parsed.issues,
            }

            doc = {
                "_id": asset_id,
                "workspaceId": workspace_id,
                "batchId": batch_id,
                "originalName": name_in_zip,
                "storedKey": stored_key,
                "size": len(data),
                "ext": parsed.ext or "",
                "mime": mime,
                "parsed": parsed_obj,
                "createdAt": now_iso(),
            }
            assets_docs.append(doc)

            parser_entries.append({
                "assetId": asset_id,
                "name": name_in_zip,
                "size": len(data),
                "mime": mime,
                "storedKey": stored_key,
            })

            # emit asset event (optional “in your face” progress)
            if total_files % 25 == 0:
                await publish_event(workspace_id, {"type": "batch", "stage": "extracting", "batchId": batch_id, "files": total_files})

        await self.repo.insert_assets(assets_docs)

        # build candidates
        await self.repo.update_batch(batch_id, workspace_id, {"status": "parsed"})
        await publish_event(workspace_id, {"type": "batch", "stage": "parsed", "batchId": batch_id})

        candidates_raw, invalid = build_candidates(parser_entries)

        # schedule spillover (optional)
        jobs_docs: List[Dict[str, Any]] = []
        if schedule_all:
            p = policy or {}
            candidates_raw = schedule_candidates(
                candidates_raw,
                start_at_iso=p.get("startAt"),
                days_of_week=p.get("daysOfWeek"),
                times_of_day=p.get("timesOfDay"),
                weeks=p.get("weeks"),
            )

        # persist candidates
        candidates_docs: List[Dict[str, Any]] = []
        out_candidates: List[Dict[str, Any]] = []

        for c in candidates_raw:
            cand_id = f"cand_{uuid4().hex}"
            doc = {
                "_id": cand_id,
                "workspaceId": workspace_id,
                "batchId": batch_id,
                "order": int(c["order"]),
                "title": c["title"],
                "caption": c.get("caption", ""),
                "platforms": c.get("platforms", []),
                "types": c.get("types", []),
                "assetIds": c.get("assetIds", []),
                "issues": c.get("issues", []),
                "status": c.get("status", "draft"),
                "scheduledAt": c.get("scheduledAt"),
                "createdAt": now_iso(),
                "updatedAt": now_iso(),
            }
            candidates_docs.append(doc)

            out_candidates.append({
                "candidateId": cand_id,
                "order": doc["order"],
                "title": doc["title"],
                "caption": doc["caption"],
                "platforms": doc["platforms"],
                "types": doc["types"],
                "assetIds": doc["assetIds"],
                "issues": doc["issues"],
                "status": doc["status"],
                "scheduledAt": doc.get("scheduledAt"),
            })

        await self.repo.insert_candidates(candidates_docs)

        # optionally create jobs (per platform)
        out_jobs: List[Dict[str, Any]] = []
        if create_jobs:
            for cand in candidates_docs:
                platforms = cand.get("platforms") or []
                for plat in platforms:
                    job_id = f"job_{uuid4().hex}"
                    jdoc = {
                        "_id": job_id,
                        "workspaceId": workspace_id,
                        "batchId": batch_id,
                        "candidateId": cand["_id"],
                        "platform": plat,
                        "action": "publish",
                        "status": "queued" if cand.get("status") in ("scheduled", "queued") else "queued",
                        "scheduledAt": cand.get("scheduledAt"),
                        "progress": {"stage": "queued", "pct": 0},
                        "attempts": 0,
                        "lastError": None,
                        "lockedAt": None,
                        "lockedBy": None,
                        "lockExpiresAt": None,
                        "createdAt": now_iso(),
                        "updatedAt": now_iso(),
                    }
                    jobs_docs.append(jdoc)
                    out_jobs.append({"jobId": job_id, "platform": plat, "status": jdoc["status"], "scheduledAt": jdoc.get("scheduledAt")})

            await self.repo.insert_jobs(jobs_docs)

            # emit a single summary + a few job events for UI
            await publish_event(workspace_id, {"type": "batch", "stage": "jobs_created", "batchId": batch_id, "jobs": len(jobs_docs)})
            for j in jobs_docs[:10]:
                await publish_event(workspace_id, {"type": "job", "job": {"_id": j["_id"], "status": j["status"], "platform": j["platform"], "scheduledAt": j.get("scheduledAt")}})

        totals = {
            "files": len(assets_docs),
            "candidates": len(candidates_docs),
            "jobs": len(jobs_docs),
            "invalid": len(invalid),
        }

        await self.repo.update_batch(batch_id, workspace_id, {"status": "jobs_created" if create_jobs else "parsed", "totals": totals})
        await publish_event(workspace_id, {"type": "batch", "stage": "done", "batchId": batch_id, "totals": totals})

        return {
            "batchId": batch_id,
            "workspaceId": workspace_id,
            "status": "jobs_created" if create_jobs else "parsed",
            "totals": totals,
            "candidates": out_candidates,
            "invalid": invalid,
            "jobs": out_jobs,
        }
