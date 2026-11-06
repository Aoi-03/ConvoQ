import os
import uuid
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import (
    DB_PATH, UPLOAD_DIR, GEMINI_API_KEY, GEMINI_MODEL, CORS_ORIGINS, BASE_DIR
)
from backend.models.database import init_db, get_db_connection
from backend.models.schemas import (
    ProjectCreate, ProjectResponse, ChatResponse, ParticipantResponse,
    MessageResponse, PersonaResponse, MemoryResponse,
    AgentQueryRequest, AgentQueryResponse, AgentType,
    RoastIntensity, ReplyStyle, SettingsUpdate
)
from backend.services.parser import WhatsAppParser
from backend.services.multimodal import MultimodalProcessor
from backend.services.memory import MemoryEngine
from backend.services.persona import PersonaGenerator
from backend.services.local_storage import local_storage
from backend.services.gemini_client import gemini_client
from backend.agents.analyzer import DeepAnalyzerAgent
from backend.agents.roaster import RoasterAgent
from backend.agents.reply_giver import ReplyGiverAgent
from backend.agents.memory_recall import MemoryRecallAgent

# Initialize Database Schema
init_db()

app = FastAPI(
    title="ConvoQ: Multi-Agent Chat Intelligence Platform",
    description="Processes exported conversations, understands participant personas, and deploys specialized AI agents.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate Agents
analyzer_agent = DeepAnalyzerAgent()
roaster_agent = RoasterAgent()
reply_agent = ReplyGiverAgent()
recall_agent = MemoryRecallAgent()


# --- System & Settings Endpoints ---

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_api_configured": gemini_client.is_available,
        "model": gemini_client.model_name,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/settings")
def update_settings(settings: SettingsUpdate):
    if settings.gemini_api_key is not None:
        gemini_client.set_api_key(settings.gemini_api_key)
    if settings.gemini_model is not None:
        gemini_client.model_name = settings.gemini_model
    return {
        "success": True,
        "gemini_api_configured": gemini_client.is_available,
        "model": gemini_client.model_name
    }


# --- Project Management Endpoints ---

@app.get("/api/projects", response_model=List[ProjectResponse])
def list_projects():
    conn = get_db_connection()
    projects = conn.execute("SELECT * FROM projects ORDER BY updated_at DESC").fetchall()
    result = []
    for p in projects:
        p_id = p["id"]
        c_count = conn.execute("SELECT COUNT(*) as count FROM chats WHERE project_id = ?", (p_id,)).fetchone()["count"]
        m_count = conn.execute("SELECT COUNT(*) as count FROM messages WHERE project_id = ?", (p_id,)).fetchone()["count"]
        part_count = conn.execute("SELECT COUNT(DISTINCT name) as count FROM participants WHERE project_id = ?", (p_id,)).fetchone()["count"]

        result.append(ProjectResponse(
            id=p_id,
            name=p["name"],
            description=p["description"] or "",
            created_at=p["created_at"],
            updated_at=p["updated_at"],
            chat_count=c_count,
            total_messages=m_count,
            participant_count=part_count
        ))
    conn.close()
    return result

@app.post("/api/projects", response_model=ProjectResponse)
def create_project(data: ProjectCreate):
    conn = get_db_connection()
    p_id = str(uuid.uuid4())
    now_iso = datetime.now().isoformat()

    conn.execute(
        "INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (p_id, data.name, data.description or "", now_iso, now_iso)
    )
    conn.commit()
    conn.close()

    # Mirror in local file storage
    local_storage.save_project(data.name, data.description or "")

    return ProjectResponse(
        id=p_id,
        name=data.name,
        description=data.description or "",
        created_at=now_iso,
        updated_at=now_iso,
        chat_count=0,
        total_messages=0,
        participant_count=0
    )

@app.get("/api/projects/{project_id}")
def get_project_detail(project_id: str):
    conn = get_db_connection()
    project = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    if not project:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    chats = conn.execute("SELECT * FROM chats WHERE project_id = ? ORDER BY created_at DESC", (project_id,)).fetchall()
    participants = conn.execute("SELECT * FROM participants WHERE project_id = ? ORDER BY message_count DESC", (project_id,)).fetchall()
    personas = conn.execute("SELECT * FROM personas WHERE project_id = ?", (project_id,)).fetchall()
    memory = conn.execute("SELECT * FROM memories WHERE project_id = ?", (project_id,)).fetchone()
    conn.close()

    return {
        "project": dict(project),
        "chats": [dict(c) for c in chats],
        "participants": [dict(p) for p in participants],
        "personas": [
            {
                **dict(pr),
                "interests": json.loads(pr["interests"]) if pr["interests"] else [],
                "activity_patterns": json.loads(pr["activity_patterns"]) if pr["activity_patterns"] else {},
                "emoji_fingerprint": json.loads(pr["emoji_fingerprint"]) if pr["emoji_fingerprint"] else [],
                "catchphrases": json.loads(pr["catchphrases"]) if pr["catchphrases"] else [],
                "quirks": json.loads(pr["quirks"]) if pr["quirks"] else [],
            }
            for pr in personas
        ],
        "memory": {
            **dict(memory),
            "timeline_events": json.loads(memory["timeline_events"]) if memory and memory["timeline_events"] else [],
            "topics": json.loads(memory["topics"]) if memory and memory["topics"] else [],
            "inside_jokes": json.loads(memory["inside_jokes"]) if memory and memory["inside_jokes"] else [],
            "relationships": json.loads(memory["relationships"]) if memory and memory["relationships"] else [],
            "mood_shifts": json.loads(memory["mood_shifts"]) if memory and memory["mood_shifts"] else [],
        } if memory else None
    }

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    # 1. Delete from local JSON file storage
    local_storage.delete_project(project_id)

    # 2. Delete from database if initialized
    try:
        conn = get_db_connection()
        conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        conn.commit()
        conn.close()
    except Exception:
        pass

    return {"success": True, "message": f"Project {project_id} deleted with all associated chats, personas, and memory."}


# --- Chat Upload & Ingestion Endpoints ---

def _ingest_parsed_chat(project_id: str, chat_name: str, parsed, file_path_str: str = "") -> str:
    conn = get_db_connection()
    chat_id = str(uuid.uuid4())
    now_iso = datetime.now().isoformat()

    conn.execute(
        """INSERT INTO chats (id, project_id, name, chat_type, file_path, total_messages, total_media, date_range_start, date_range_end, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            chat_id,
            project_id,
            chat_name,
            parsed.chat_type,
            file_path_str,
            parsed.total_messages,
            parsed.total_media,
            parsed.date_range_start,
            parsed.date_range_end,
            now_iso
        )
    )

    # Insert participants
    for p_name in parsed.participants:
        p_id = str(uuid.uuid4())
        stats = parsed.participant_stats.get(p_name, {})
        conn.execute(
            """INSERT INTO participants (id, chat_id, project_id, name, message_count, voice_note_count, image_count, video_count, first_seen, last_seen)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                p_id,
                chat_id,
                project_id,
                p_name,
                stats.get("messages", 0),
                stats.get("audio", 0),
                stats.get("images", 0),
                stats.get("videos", 0),
                parsed.date_range_start,
                parsed.date_range_end
            )
        )

    # Insert messages
    for msg in parsed.messages:
        # Check if media needs summary
        media_summary = ""
        if msg.media_type != "none":
            media_summary = f"[{msg.media_type.capitalize()}: {msg.content}]"

        conn.execute(
            """INSERT INTO messages (id, chat_id, project_id, timestamp, sender, content, media_type, media_file, media_summary, is_system, raw_text)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                msg.id,
                chat_id,
                project_id,
                msg.timestamp_iso,
                msg.sender,
                msg.content,
                msg.media_type,
                msg.media_filename,
                media_summary,
                1 if msg.is_system else 0,
                msg.raw_text
            )
        )

    conn.commit()
    conn.close()

    # Trigger multimodal batch processing
    MultimodalProcessor.batch_process_chat_media(chat_id)

    # Build persistent conversational memory
    MemoryEngine.analyze_chat_memory(project_id, chat_id)
    MemoryEngine.analyze_chat_memory(project_id, None) # Project-level

    # Generate or update participant personas
    PersonaGenerator.generate_personas_for_project(project_id)

    return chat_id

@app.post("/api/projects/{project_id}/chats/upload")
async def upload_chat(
    project_id: str,
    file: UploadFile = File(...),
    chat_name: Optional[str] = Form(None)
):
    # Read file content
    content_bytes = await file.read()
    try:
        text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text = content_bytes.decode("utf-8-sig", errors="ignore")

    name = chat_name or Path(file.filename).stem or "Uploaded Chat"

    # Save raw file
    project_upload_dir = UPLOAD_DIR / project_id
    project_upload_dir.mkdir(parents=True, exist_ok=True)
    saved_path = project_upload_dir / file.filename
    with open(saved_path, "wb") as f:
        f.write(content_bytes)

    # Parse chat
    parsed = WhatsAppParser.parse_chat_text(text, fallback_chat_name=name)
    chat_id = _ingest_parsed_chat(project_id, name, parsed, str(saved_path))

    return {
        "success": True,
        "chat_id": chat_id,
        "name": name,
        "chat_type": parsed.chat_type,
        "participants": parsed.participants,
        "total_messages": parsed.total_messages,
        "total_media": parsed.total_media,
    }

@app.post("/api/projects/{project_id}/load-sample-data")
def load_sample_data(project_id: str):
    """
    Loads the official specification sample scenario:
    - Group Chat: 'College Friends' (20 members, voice notes, trips, exam stress)
    - One-to-One: 'Shrimant' (Suman and Shrimant)
    """
    sample_dir = BASE_DIR / "sample_data"
    group_file = sample_dir / "college_friends_group.txt"
    direct_file = sample_dir / "shrimant_1to1.txt"

    created_chats = []

    if group_file.exists():
        with open(group_file, "r", encoding="utf-8") as f:
            text = f.read()
        parsed = WhatsAppParser.parse_chat_text(text, "College Friends 🎓")
        c_id = _ingest_parsed_chat(project_id, "College Friends 🎓", parsed, str(group_file))
        created_chats.append({"id": c_id, "name": "College Friends 🎓", "type": parsed.chat_type, "participants": len(parsed.participants)})

    if direct_file.exists():
        with open(direct_file, "r", encoding="utf-8") as f:
            text = f.read()
        parsed = WhatsAppParser.parse_chat_text(text, "Shrimant")
        c_id = _ingest_parsed_chat(project_id, "Shrimant", parsed, str(direct_file))
        created_chats.append({"id": c_id, "name": "Shrimant", "type": parsed.chat_type, "participants": len(parsed.participants)})

    return {
        "success": True,
        "message": "Sample datasets loaded successfully.",
        "chats": created_chats
    }

@app.get("/api/projects/{project_id}/chats/{chat_id}/messages")
def get_chat_messages(project_id: str, chat_id: str, limit: int = 100, offset: int = 0):
    conn = get_db_connection()
    messages = conn.execute(
        "SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC LIMIT ? OFFSET ?",
        (chat_id, limit, offset)
    ).fetchall()
    total = conn.execute("SELECT COUNT(*) as c FROM messages WHERE chat_id = ?", (chat_id,)).fetchone()["c"]
    conn.close()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "messages": [dict(m) for m in messages]
    }


# --- Personas & Memory Endpoints ---

@app.get("/api/projects/{project_id}/personas")
def get_project_personas(project_id: str):
    conn = get_db_connection()
    personas = conn.execute("SELECT * FROM personas WHERE project_id = ? ORDER BY name ASC", (project_id,)).fetchall()
    conn.close()

    return [
        {
            **dict(p),
            "interests": json.loads(p["interests"]) if p["interests"] else [],
            "activity_patterns": json.loads(p["activity_patterns"]) if p["activity_patterns"] else {},
            "emoji_fingerprint": json.loads(p["emoji_fingerprint"]) if p["emoji_fingerprint"] else [],
            "catchphrases": json.loads(p["catchphrases"]) if p["catchphrases"] else [],
            "quirks": json.loads(p["quirks"]) if p["quirks"] else [],
        }
        for p in personas
    ]

@app.get("/api/projects/{project_id}/memory")
def get_project_memory(project_id: str, chat_id: Optional[str] = None):
    conn = get_db_connection()
    if chat_id:
        row = conn.execute("SELECT * FROM memories WHERE project_id = ? AND chat_id = ?", (project_id, chat_id)).fetchone()
    else:
        row = conn.execute("SELECT * FROM memories WHERE project_id = ? AND chat_id IS NULL", (project_id,)).fetchone()
        if not row:
            row = conn.execute("SELECT * FROM memories WHERE project_id = ? LIMIT 1", (project_id,)).fetchone()
    conn.close()

    if not row:
        return {"timeline_events": [], "topics": [], "inside_jokes": [], "relationships": [], "mood_shifts": []}

    return {
        "id": row["id"],
        "project_id": row["project_id"],
        "chat_id": row["chat_id"],
        "timeline_events": json.loads(row["timeline_events"]) if row["timeline_events"] else [],
        "topics": json.loads(row["topics"]) if row["topics"] else [],
        "inside_jokes": json.loads(row["inside_jokes"]) if row["inside_jokes"] else [],
        "relationships": json.loads(row["relationships"]) if row["relationships"] else [],
        "mood_shifts": json.loads(row["mood_shifts"]) if row["mood_shifts"] else [],
        "summary": row["summary"],
        "updated_at": row["updated_at"]
    }


# --- Multi-Agent Studio Interaction Endpoint ---

@app.post("/api/agents/query", response_model=AgentQueryResponse)
def query_agent(req: AgentQueryRequest):
    """
    Route query to the specified specialized agent:
    - Deep Analyzer
    - Roaster (with tone intensity controls)
    - Reply Giver (with style cloning & quick chips)
    - Memory Recall
    """
    if req.agent_type == AgentType.DEEP_ANALYZER:
        return analyzer_agent.analyze(
            query=req.query,
            project_id=req.project_id,
            chat_id=req.chat_id,
            participant_name=req.target_participant_name,
            conversation_id=req.conversation_id
        )
    elif req.agent_type == AgentType.ROASTER:
        return roaster_agent.roast(
            query=req.query,
            project_id=req.project_id,
            target_name=req.target_participant_name,
            intensity=req.roast_intensity or RoastIntensity.SAVAGE,
            chat_id=req.chat_id,
            conversation_id=req.conversation_id
        )
    elif req.agent_type == AgentType.REPLY_GIVER:
        return reply_agent.suggest_replies(
            query=req.query,
            project_id=req.project_id,
            chat_id=req.chat_id,
            style=req.reply_style or ReplyStyle.CASUAL,
            clone_participant_name=req.target_participant_name,
            conversation_id=req.conversation_id
        )
    elif req.agent_type == AgentType.MEMORY_RECALL:
        return recall_agent.recall(
            query=req.query,
            project_id=req.project_id,
            chat_id=req.chat_id,
            conversation_id=req.conversation_id
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported agent type: {req.agent_type}")


# --- Conversation History Endpoint ---

@app.get("/api/agents/conversations/{conv_id}")
def get_conversation_history(conv_id: str):
    conn = get_db_connection()
    conv = conn.execute("SELECT * FROM agent_conversations WHERE id = ?", (conv_id,)).fetchone()
    if not conv:
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = conn.execute(
        "SELECT * FROM agent_messages WHERE conversation_id = ? ORDER BY timestamp ASC",
        (conv_id,)
    ).fetchall()
    conn.close()

    return {
        "conversation": dict(conv),
        "messages": [
            {
                **dict(m),
                "evidence_citations": json.loads(m["evidence_citations"]) if m["evidence_citations"] else [],
                "metadata": json.loads(m["metadata"]) if m["metadata"] else {},
            }
            for m in messages
        ]
    }


# --- Static Frontend Serving ---

from fastapi.responses import FileResponse
from backend.config import PROJECT_ROOT

FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"
if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")

