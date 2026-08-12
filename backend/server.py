import os
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

import content as C

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Jelajah Nusa API")
api = APIRouter(prefix="/api")


# ----------------------------- Helpers -----------------------------

def region_summary(r: dict) -> dict:
    return {
        "slug": r["slug"],
        "name": r["name"],
        "island": r["island"],
        "category": r["category"],
        "accent": r["accent"],
        "tagline": r["tagline"],
        "blurb": r["blurb"],
        "image": r["image"],
        "map": r["map"],
        "storyTitle": r["story"]["title"],
        "collectible": r["collectible"],
    }


def region_by_slug(slug: str) -> Optional[dict]:
    return next((r for r in C.REGIONS if r["slug"] == slug), None)


def compute_level(completed: List[str]) -> dict:
    n = len(set(completed))
    lvl = C.explorer_level(n)
    next_milestone = next((m for m in C.MILESTONES if m > n), None)
    return {
        "completedCount": n,
        "total": len(C.REGIONS),
        "level": lvl,
        "milestones": C.MILESTONES,
        "nextMilestone": next_milestone,
    }


# ----------------------------- Models -----------------------------

class ProgressUpsert(BaseModel):
    session_id: str
    region_slug: str
    story_completed: bool = False
    choice_id: Optional[str] = None
    discovery_id: Optional[str] = None


class VoiceSubmit(BaseModel):
    session_id: str
    answer: str = Field(min_length=1, max_length=280)


# ----------------------------- Routes -----------------------------

@api.get("/")
async def root():
    return {"app": "Jelajah Nusa", "tagline": "Kenali Indonesia. Satu cerita, satu perjalanan."}


@api.get("/regions")
async def list_regions():
    return {"regions": [region_summary(r) for r in C.REGIONS], "total": len(C.REGIONS)}


@api.get("/regions/{slug}")
async def get_region(slug: str):
    r = region_by_slug(slug)
    if not r:
        raise HTTPException(status_code=404, detail="Wilayah tidak ditemukan")
    return r


@api.get("/progress/{session_id}")
async def get_progress(session_id: str):
    doc = await db.progress.find_one({"session_id": session_id})
    if not doc:
        base = {
            "session_id": session_id,
            "regions_explored": [],
            "regions_completed": [],
            "stories": {},
            "collectibles": [],
        }
        return {**base, "stats": compute_level([])}
    explored = doc.get("regions_explored", [])
    completed = doc.get("regions_completed", [])
    return {
        "session_id": session_id,
        "regions_explored": explored,
        "regions_completed": completed,
        "stories": doc.get("stories", {}),
        "collectibles": doc.get("collectibles", []),
        "stats": compute_level(completed),
    }


@api.post("/progress")
async def upsert_progress(body: ProgressUpsert):
    r = region_by_slug(body.region_slug)
    if not r:
        raise HTTPException(status_code=404, detail="Wilayah tidak ditemukan")

    doc = await db.progress.find_one({"session_id": body.session_id})
    if not doc:
        doc = {
            "session_id": body.session_id,
            "regions_explored": [],
            "regions_completed": [],
            "stories": {},
            "collectibles": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    explored = set(doc.get("regions_explored", []))
    completed = set(doc.get("regions_completed", []))
    stories = doc.get("stories", {})
    collectibles = doc.get("collectibles", [])

    explored.add(body.region_slug)

    newly_collected = None
    if body.story_completed:
        completed.add(body.region_slug)
        stories[body.region_slug] = {
            "choice_id": body.choice_id,
            "discovery_id": body.discovery_id,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }
        col = r["collectible"]
        if not any(c["id"] == col["id"] for c in collectibles):
            entry = {**col, "region_slug": body.region_slug, "region_name": r["name"]}
            collectibles.append(entry)
            newly_collected = entry

    update = {
        "session_id": body.session_id,
        "regions_explored": sorted(explored),
        "regions_completed": sorted(completed),
        "stories": stories,
        "collectibles": collectibles,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.progress.update_one(
        {"session_id": body.session_id}, {"$set": update}, upsert=True
    )

    return {
        "regions_explored": update["regions_explored"],
        "regions_completed": update["regions_completed"],
        "stories": stories,
        "collectibles": collectibles,
        "newly_collected": newly_collected,
        "stats": compute_level(list(completed)),
    }


@api.get("/voice/prompt")
async def voice_prompt():
    return {"prompt": C.VOICE_PROMPT}


@api.post("/voice")
async def submit_voice(body: VoiceSubmit):
    text = body.answer.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Jawaban tidak boleh kosong")
    entry = {
        "answer_text": text,
        "session_id": body.session_id,
        "moderation_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reviewed_by": None,
        "reviewed_at": None,
    }
    await db.voice.insert_one(entry)
    return {
        "status": "pending",
        "message": "Terima kasih. Suaramu akan tampil di dinding setelah ditinjau moderator.",
    }


@api.get("/voice/wall")
async def voice_wall():
    docs = await db.voice.find(
        {"moderation_status": "approved"}
    ).sort("created_at", -1).to_list(50)
    approved = [{"answer_text": d["answer_text"], "created_at": d.get("created_at")} for d in docs]
    seeded = [{"answer_text": t, "created_at": None, "seed": True} for t in C.SEED_WALL]
    return {"prompt": C.VOICE_PROMPT, "entries": approved + seeded}


@app.on_event("startup")
async def startup():
    await db.progress.create_index("session_id", unique=True)


origins = os.environ.get("CORS_ORIGINS", "*").split(",")
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
