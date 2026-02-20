# backend/app/services/storage_service.py
import os
from typing import Tuple

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
STORAGE_ROOT = os.path.join(BASE_DIR, "storage")

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def safe_join(root: str, *parts: str) -> str:
    p = os.path.abspath(os.path.join(root, *parts))
    if not p.startswith(os.path.abspath(root) + os.sep):
        raise ValueError("Unsafe path traversal detected")
    return p

class StorageService:
    """
    Local storage:
      backend/storage/workspaces/<workspaceId>/batches/<batchId>/...
    """
    def __init__(self):
        ensure_dir(STORAGE_ROOT)

    def workspace_root(self, workspace_id: str) -> str:
        path = safe_join(STORAGE_ROOT, "workspaces", workspace_id)
        ensure_dir(path)
        return path

    def batch_root(self, workspace_id: str, batch_id: str) -> str:
        path = safe_join(self.workspace_root(workspace_id), "batches", batch_id)
        ensure_dir(path)
        return path

    def save_zip(self, workspace_id: str, batch_id: str, filename: str, data: bytes) -> str:
        root = self.batch_root(workspace_id, batch_id)
        zdir = safe_join(root, "zip")
        ensure_dir(zdir)
        path = safe_join(zdir, filename)
        with open(path, "wb") as f:
            f.write(data)
        return path

    def save_asset_bytes(self, workspace_id: str, batch_id: str, rel_name: str, data: bytes) -> str:
        root = self.batch_root(workspace_id, batch_id)
        adir = safe_join(root, "assets")
        ensure_dir(adir)

        # flatten rel_name safely (keep subfolders but safe-join)
        rel = rel_name.replace("\\", "/").lstrip("/")
        path = safe_join(adir, rel)
        ensure_dir(os.path.dirname(path))

        with open(path, "wb") as f:
            f.write(data)

        # storedKey is a portable key
        stored_key = f"workspaces/{workspace_id}/batches/{batch_id}/assets/{rel}"
        return stored_key
