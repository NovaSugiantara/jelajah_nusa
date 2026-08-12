import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

import content as C

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
SESSION_COOKIE_NAME = os.environ.get("SESSION_COOKIE_NAME", "jelajah_nusa_session")
SESSION_TTL_DAYS = int(os.environ.get("SESSION_TTL_DAYS", "30"))
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() == "true"
ENABLED_SLUGS = [s for s in os.environ.get("ENABLED_SLUGS", "aceh,bali").split(",") if s]
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]
APP_ENV = os.environ.get("APP_ENV", "demo")  # "demo" serves drafts; "production" serves approved only

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Jelajah Nusa API")
api = APIRouter(prefix="/api")


# ----------------------------- Sessions -----------------------------


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _expires() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)


def _set_cookie(response: Response, token: str, expires: datetime) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_TTL_DAYS * 86400,
        expires=expires,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/",
    )


async def ensure_session(request: Request, response: Response) -> str:
    """Return the internal session id derived only from the HttpOnly cookie.

    Creates a session when the cookie is missing or invalid. Never trusts a
    session id supplied by the client.
    """
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if token:
        sess = await db.sessions.find_one({"token_hash": hash_token(token)})
        if sess and _is_active(sess):
            await db.sessions.update_one(
                {"_id": sess["_id"]},
                {"$set": {"last_seen_at": datetime.now(timezone.utc), "expires_at": _expires()}},
            )
            return str(sess["_id"])

    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires = _expires()
    res = await db.sessions.insert_one(
        {
            "token_hash": hash_token(token),
            "role": "anon",
            "created_at": now,
            "last_seen_at": now,
            "expires_at": expires,
        }
    )
    _set_cookie(response, token, expires)
    return str(res.inserted_id)


def _is_active(sess: dict) -> bool:
    expires = sess.get("expires_at")
    if isinstance(expires, str):
        try:
            expires = datetime.fromisoformat(expires)
        except ValueError:
            return False
    if isinstance(expires, datetime) and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    return expires is None or expires > datetime.now(timezone.utc)


def _verify_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin and origin not in ALLOWED_ORIGINS:
        raise HTTPException(status_code=403, detail="Origin tidak diizinkan")


# ----------------------------- Content -----------------------------


async def _region_doc(slug: str) -> Optional[dict]:
    if slug not in ENABLED_SLUGS:
        return None
    raw = await db.content.find_one({"slug": slug})
    if not raw:
        return None
    raw.pop("_id", None)
    reg = C.normalize_region(raw)
    if APP_ENV == "production" and not C.is_approved(reg):
        return None
    return reg


async def _region_or_404(slug: str) -> dict:
    reg = await _region_doc(slug)
    if not reg:
        raise HTTPException(status_code=404, detail="Provinsi tidak ditemukan")
    return reg


def _region_summary(r: dict) -> dict:
    return {
        "slug": r["slug"],
        "name": r["name"],
        "island": r["island"],
        "category": r["category"],
        "accent": r["accent"],
        "tagline": r["tagline"],
        "blurb": r["blurb"],
        "thumbnail": r["thumbnail"],
        "map": r["map"],
        "storyTitle": r["story"]["title"],
        "collectible": r["collectible"],
        "draft": not C.is_approved(r),
    }


# ----------------------------- Progress -----------------------------


def _fresh_progress(sid: str) -> dict:
    return {
        "version": 1,
        "session_id": sid,
        "provinces": {},
        "expires_at": _expires(),
        "updated_at": datetime.now(timezone.utc),
    }


def _province_status(prov: Optional[dict]) -> str:
    if not prov:
        return "not_started"
    if prov.get("completedAt"):
        return "completed"
    return "in_progress"


def _public_progress(doc: Optional[dict], sid: str) -> dict:
    if not doc:
        doc = _fresh_progress(sid)
    provinces = {}
    for slug in ENABLED_SLUGS:
        p = doc.get("provinces", {}).get(slug)
        provinces[slug] = {
            "status": _province_status(p),
            "activeRun": (p or {}).get("activeRun"),
            "completedAt": (p or {}).get("completedAt"),
            "lastDiscoveryId": (p or {}).get("lastDiscoveryId"),
            "seenDiscoveryIds": (p or {}).get("seenDiscoveryIds", []),
            "collectibleOwned": bool((p or {}).get("collectibleOwned")),
        }
    return {
        "session_id": sid,
        "version": 1,
        "provinces": provinces,
    }


async def _load_progress(sid: str) -> dict:
    doc = await db.progress.find_one({"session_id": sid})
    return doc or _fresh_progress(sid)


async def _save_progress(doc: dict) -> None:
    doc["expires_at"] = _expires()
    doc["updated_at"] = datetime.now(timezone.utc)
    await db.progress.replace_one({"session_id": doc["session_id"]}, doc, upsert=True)


def _require_run(prov: Optional[dict], slug: str) -> dict:
    if not prov or not prov.get("activeRun"):
        raise HTTPException(status_code=409, detail="Belum ada cerita yang berjalan")
    return prov


def _node_or_404(reg: dict, node_id: str) -> dict:
    node = reg["story"]["nodes"].get(node_id)
    if not node:
        raise HTTPException(status_code=409, detail="Node cerita tidak ditemukan")
    return node


# ----------------------------- Models -----------------------------


class RegionAction(BaseModel):
    region_slug: str


class ForwardAction(BaseModel):
    region_slug: str
    expected_node: str
    choice_id: Optional[str] = None


# ----------------------------- Routes -----------------------------


@api.get("/")
async def root():
    return {"app": "Jelajah Nusa", "tagline": "Kenali Indonesia. Satu cerita, satu perjalanan."}


@api.get("/regions")
async def list_regions():
    regions = []
    for slug in ENABLED_SLUGS:
        reg = await _region_doc(slug)
        if reg:
            regions.append(_region_summary(reg))
    return {"regions": regions, "total": len(regions)}


@api.get("/regions/{slug}")
async def get_region(slug: str):
    return await _region_or_404(slug)


@api.get("/progress")
async def get_progress(request: Request, response: Response):
    sid = await ensure_session(request, response)
    doc = await _load_progress(sid)
    return _public_progress(doc, sid)


@api.post("/progress/start")
async def start_run(body: RegionAction, request: Request, response: Response):
    _verify_origin(request)
    sid = await ensure_session(request, response)
    reg = await _region_or_404(body.region_slug)
    doc = await _load_progress(sid)
    prov = doc.get("provinces", {}).get(body.region_slug)
    if prov and prov.get("activeRun"):
        raise HTTPException(status_code=409, detail="Cerita sudah berjalan")
    doc.setdefault("provinces", {})[body.region_slug] = {
        "activeRun": {
            "currentNodeId": reg["story"]["start"],
            "nodeHistory": [],
            "latestChoiceId": None,
        },
        "seenDiscoveryIds": prov.get("seenDiscoveryIds", []) if prov else [],
        "collectibleOwned": bool(prov.get("collectibleOwned")) if prov else False,
        "updatedAt": datetime.now(timezone.utc),
    }
    await _save_progress(doc)
    return {"progress": _public_progress(doc, sid), "node_id": reg["story"]["start"]}


@api.post("/progress/restart")
async def restart_run(body: RegionAction, request: Request, response: Response):
    """Mulai dari awal (unfinished) or replay (completed). Preserves completion."""
    _verify_origin(request)
    sid = await ensure_session(request, response)
    reg = await _region_or_404(body.region_slug)
    doc = await _load_progress(sid)
    prov = doc.get("provinces", {}).get(body.region_slug) or {}
    doc.setdefault("provinces", {})[body.region_slug] = {
        "activeRun": {
            "currentNodeId": reg["story"]["start"],
            "nodeHistory": [],
            "latestChoiceId": None,
        },
        "completedAt": prov.get("completedAt"),
        "lastDiscoveryId": prov.get("lastDiscoveryId"),
        "seenDiscoveryIds": prov.get("seenDiscoveryIds", []),
        "collectibleOwned": bool(prov.get("collectibleOwned")),
        "updatedAt": datetime.now(timezone.utc),
    }
    await _save_progress(doc)
    return {"progress": _public_progress(doc, sid), "node_id": reg["story"]["start"]}


@api.post("/progress/back")
async def back_run(body: RegionAction, request: Request, response: Response):
    _verify_origin(request)
    sid = await ensure_session(request, response)
    reg = await _region_or_404(body.region_slug)
    doc = await _load_progress(sid)
    prov = _require_run(doc.get("provinces", {}).get(body.region_slug), body.region_slug)
    run = prov["activeRun"]
    history = run.get("nodeHistory", [])
    if not history:
        raise HTTPException(status_code=409, detail="Tidak ada node sebelumnya")
    run["currentNodeId"] = history.pop()
    prov["activeRun"] = run
    prov["updatedAt"] = datetime.now(timezone.utc)
    doc.setdefault("provinces", {})[body.region_slug] = prov
    await _save_progress(doc)
    return {"progress": _public_progress(doc, sid), "node_id": run["currentNodeId"]}


@api.post("/progress/forward")
async def forward_run(body: ForwardAction, request: Request, response: Response):
    _verify_origin(request)
    sid = await ensure_session(request, response)
    reg = await _region_or_404(body.region_slug)
    doc = await _load_progress(sid)
    prov = doc.get("provinces", {}).get(body.region_slug)

    if not prov or not prov.get("activeRun"):
        # Idempotent retry after a committed completion whose response was lost.
        if prov and prov.get("completedAt"):
            return {
                "progress": _public_progress(doc, sid),
                "node_id": prov.get("lastDiscoveryId"),
                "newly_collected": None,
            }
        raise HTTPException(status_code=409, detail="Belum ada cerita yang berjalan")

    run = prov["activeRun"]

    if run.get("currentNodeId") != body.expected_node:
        raise HTTPException(status_code=409, detail="Node tidak sinkron, coba muat ulang")

    node = _node_or_404(reg, body.expected_node)

    # Already sitting on a Discovery (e.g. after refresh): idempotent no-op.
    if node["type"] == "discovery":
        return {"progress": _public_progress(doc, sid), "node_id": body.expected_node, "newly_collected": None}

    if node["type"] == "choice":
        choice = next((c for c in node.get("choices", []) if c["id"] == body.choice_id), None)
        if not choice:
            raise HTTPException(status_code=409, detail="Pilihan tidak valid")
        run["latestChoiceId"] = choice["id"]
        next_id = choice["next"]
    else:
        next_id = node.get("next")

    if not next_id or next_id not in reg["story"]["nodes"]:
        raise HTTPException(status_code=409, detail="Cerita belum bisa dilanjutkan")

    run["nodeHistory"] = run.get("nodeHistory", []) + [body.expected_node]
    next_node = reg["story"]["nodes"][next_id]

    # Transitioning INTO a Discovery commits completion atomically and clears
    # the finished run before the client renders Discovery.
    if next_node["type"] == "discovery":
        newly = not bool(prov.get("collectibleOwned"))
        prov["completedAt"] = prov.get("completedAt") or datetime.now(timezone.utc)
        prov["lastDiscoveryId"] = next_id
        if next_id not in prov.get("seenDiscoveryIds", []):
            prov["seenDiscoveryIds"] = prov.get("seenDiscoveryIds", []) + [next_id]
        prov["collectibleOwned"] = True
        prov["activeRun"] = None
        prov["updatedAt"] = datetime.now(timezone.utc)
        doc.setdefault("provinces", {})[body.region_slug] = prov
        await _save_progress(doc)
        return {
            "progress": _public_progress(doc, sid),
            "node_id": next_id,
            "newly_collected": reg["collectible"] if newly else None,
        }

    # Regular scene/branch advance, committed before the client moves on.
    run["currentNodeId"] = next_id
    prov["activeRun"] = run
    prov["updatedAt"] = datetime.now(timezone.utc)
    doc.setdefault("provinces", {})[body.region_slug] = prov
    await _save_progress(doc)
    return {"progress": _public_progress(doc, sid), "node_id": next_id, "newly_collected": None}


# ----------------------------- Startup -----------------------------


@app.on_event("startup")
async def startup():
    await db.content.create_index("slug", unique=True)
    await db.sessions.create_index("token_hash", unique=True)
    await db.sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.progress.create_index("session_id", unique=True)
    await db.progress.create_index("expires_at", expireAfterSeconds=0)
    for slug, raw in C.REGION_BY_SLUG.items():
        await db.content.replace_one({"slug": slug}, raw, upsert=True)


origins = ALLOWED_ORIGINS
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
