# backend/app/core/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()


def _now_iso() -> str:
    return datetime.utcnow().isoformat()


def _slugify(s: str) -> str:
    s = (s or "").strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "workspace"


async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGO_URL)
    db.db = db.client[settings.DB_NAME]
    logger.info(f"Connected to MongoDB: {settings.DB_NAME}")

    # Create indexes
    await create_indexes()

    # DEV/DEMO seed (enterprise demo mode)
    # Controlled by env: SEED_DEMO=true
    if str(getattr(settings, "SEED_DEMO", "false")).lower() == "true":
        try:
            await seed_demo_data()
            logger.info("✅ Demo data seeded (SEED_DEMO=true)")
        except Exception as e:
            logger.exception(f"⚠️ Demo seeding failed: {e}")


async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db.client:
        db.client.close()
    logger.info("MongoDB connection closed")


async def create_indexes():
    """Create database indexes for performance"""
    # Content indexes
    await db.db.content.create_index("platform")
    await db.db.content.create_index("status")
    await db.db.content.create_index("scheduledDate")
    await db.db.content.create_index([("platform", 1), ("status", 1)])

    # User indexes (for future multi-tenancy)
    await db.db.users.create_index("email", unique=True)

    # Only enforce uniqueness when username exists (prevents "null" collisions)
    await db.db.users.create_index(
      [("username", 1)],
      unique=True,
      partialFilterExpression={"username": {"$type": "string"}},
    )

    # Auth / tenancy
    await db.db.workspaces.create_index(
        [("slug", 1)],
        unique=True,
        name="slug_1",
        partialFilterExpression={"slug": {"$type": "string"}},
    )

    await db.db.workspace_members.create_index([("workspaceId", 1), ("userId", 1)], unique=True)
    await db.db.workspace_members.create_index([("userId", 1), ("status", 1)])

    # Jobs / batches
    await db.db.jobs.create_index([("workspaceId", 1), ("status", 1), ("createdAt", -1)])
    await db.db.jobs.create_index([("workspaceId", 1), ("scheduledAt", 1)])
    await db.db.jobs.create_index([("workspaceId", 1), ("candidateId", 1)])
    await db.db.jobs.create_index([("workspaceId", 1), ("batchId", 1)])

    await db.db.batches.create_index([("workspaceId", 1), ("createdAt", -1)])
    await db.db.batches.create_index([("workspaceId", 1), ("status", 1)])

    # Assets
    await db.db.assets.create_index([("workspaceId", 1), ("batchId", 1)])
    await db.db.assets.create_index([("workspaceId", 1), ("parsed.order", 1)])
    await db.db.assets.create_index([("workspaceId", 1), ("createdAt", -1)])

    # Post candidates
    await db.db.post_candidates.create_index([("workspaceId", 1), ("batchId", 1)])
    await db.db.post_candidates.create_index([("workspaceId", 1), ("status", 1)])
    await db.db.post_candidates.create_index([("workspaceId", 1), ("scheduledAt", 1)])
    await db.db.post_candidates.create_index([("workspaceId", 1), ("order", 1)])

    # Recommended for agency model
    await db.db.clients.create_index([("workspaceId", 1), ("createdAt", -1)])
    await db.db.client_members.create_index([("workspaceId", 1), ("clientId", 1), ("userId", 1)], unique=True)
    await db.db.social_accounts.create_index([("workspaceId", 1), ("clientId", 1), ("platform", 1), ("accountId", 1)], unique=True)

    logger.info("Database indexes created")


async def seed_demo_data():
    """
    Enterprise demo mode seeding:
    - 1 Workspace (Agency)
    - 1 Owner + 2 Staff
    - 2 Clients
    - A few placeholder Social Accounts (no OAuth yet)
    Idempotent: safe on restart.
    """
    from app.core.auth import hash_password  # import here to avoid circular imports

    demo_ws_name = getattr(settings, "DEMO_WORKSPACE_NAME", "Demo Agency")
    demo_ws_slug = _slugify(demo_ws_name)

    owner_email = getattr(settings, "DEMO_OWNER_EMAIL", "owner@socialflow.dev")
    owner_password = getattr(settings, "DEMO_OWNER_PASSWORD", "Owner123!ChangeMe")

    # Fixed ids for repeatable demo
    ws_id = "ws_demo_agency"
    owner_id = "user_demo_owner"
    staff1_id = "user_demo_staff_1"
    staff2_id = "user_demo_staff_2"

    # ---- Workspace upsert
    await db.db.workspaces.update_one(
        {"_id": ws_id},
        {"$setOnInsert": {
            "_id": ws_id,
            "name": demo_ws_name,
            "slug": demo_ws_slug,
            "plan": "demo",
            "status": "active",
            "createdAt": _now_iso(),
            "updatedAt": _now_iso(),
        }},
        upsert=True,
    )

    # ---- Users upsert
    await db.db.users.update_one(
        {"_id": owner_id},
        {"$set": {
            "_id": owner_id,
            "email": owner_email.lower().strip(),
            "name": "Owner",
            "status": "active",
            "passwordHash": hash_password(owner_password),
            "updatedAt": _now_iso(),
        }, "$setOnInsert": {"createdAt": _now_iso()}},
        upsert=True,
    )

    await db.db.users.update_one(
        {"_id": staff1_id},
        {"$set": {
            "_id": staff1_id,
            "email": "staff1@socialflow.dev",
            "name": "Staff One",
            "status": "active",
            "passwordHash": hash_password("Staff123!ChangeMe"),
            "updatedAt": _now_iso(),
        }, "$setOnInsert": {"createdAt": _now_iso()}},
        upsert=True,
    )

    await db.db.users.update_one(
        {"_id": staff2_id},
        {"$set": {
            "_id": staff2_id,
            "email": "staff2@socialflow.dev",
            "name": "Staff Two",
            "status": "active",
            "passwordHash": hash_password("Staff123!ChangeMe"),
            "updatedAt": _now_iso(),
        }, "$setOnInsert": {"createdAt": _now_iso()}},
        upsert=True,
    )

    # ---- Workspace memberships
    async def upsert_membership(user_id: str, role: str):
        mem_id = f"mem_{ws_id}_{user_id}"
        await db.db.workspace_members.update_one(
            {"_id": mem_id},
            {"$set": {
                "_id": mem_id,
                "workspaceId": ws_id,
                "userId": user_id,     # keep as string for consistency with JWT sub
                "role": role,
                "status": "active",
                "updatedAt": _now_iso(),
            }, "$setOnInsert": {"createdAt": _now_iso()}},
            upsert=True,
        )

    await upsert_membership(owner_id, "owner")
    await upsert_membership(staff1_id, "manager")
    await upsert_membership(staff2_id, "publisher")

    # ---- Clients
    client_a_id = "client_demo_alpha"
    client_b_id = "client_demo_bravo"

    await db.db.clients.update_one(
        {"_id": client_a_id},
        {"$setOnInsert": {
            "_id": client_a_id,
            "workspaceId": ws_id,
            "name": "Alpha Dental",
            "status": "active",
            "createdAt": _now_iso(),
            "updatedAt": _now_iso(),
        }},
        upsert=True,
    )

    await db.db.clients.update_one(
        {"_id": client_b_id},
        {"$setOnInsert": {
            "_id": client_b_id,
            "workspaceId": ws_id,
            "name": "Bravo Fitness",
            "status": "active",
            "createdAt": _now_iso(),
            "updatedAt": _now_iso(),
        }},
        upsert=True,
    )

    # ---- Client members (who can access which client)
    async def upsert_client_member(client_id: str, user_id: str, role: str):
        cm_id = f"cm_{client_id}_{user_id}"
        await db.db.client_members.update_one(
            {"_id": cm_id},
            {"$set": {
                "_id": cm_id,
                "workspaceId": ws_id,
                "clientId": client_id,
                "userId": user_id,
                "role": role,
                "status": "active",
                "updatedAt": _now_iso(),
            }, "$setOnInsert": {"createdAt": _now_iso()}},
            upsert=True,
        )

    # Owner has access to everything
    await upsert_client_member(client_a_id, owner_id, "manager")
    await upsert_client_member(client_b_id, owner_id, "manager")

    # Staff split clients (example)
    await upsert_client_member(client_a_id, staff1_id, "manager")
    await upsert_client_member(client_b_id, staff2_id, "publisher")

    # ---- Social Accounts (placeholders for now; later OAuth)
    async def upsert_social(client_id: str, platform: str, account_id: str, account_name: str):
        sa_id = f"sa_{client_id}_{platform}_{account_id}"
        await db.db.social_accounts.update_one(
            {"_id": sa_id},
            {"$set": {
                "_id": sa_id,
                "workspaceId": ws_id,
                "clientId": client_id,
                "platform": platform,
                "accountId": account_id,
                "accountName": account_name,
                "status": "connected",  # placeholder
                "updatedAt": _now_iso(),
            }, "$setOnInsert": {"createdAt": _now_iso()}},
            upsert=True,
        )

    await upsert_social(client_a_id, "instagram", "alpha_ig", "Alpha Dental IG")
    await upsert_social(client_a_id, "facebook", "alpha_fb", "Alpha Dental FB")
    await upsert_social(client_b_id, "instagram", "bravo_ig", "Bravo Fitness IG")
    await upsert_social(client_b_id, "tiktok", "bravo_tt", "Bravo Fitness TikTok")


def get_database():
    return db.db
