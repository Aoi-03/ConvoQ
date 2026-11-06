import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.config import DB_PATH

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA busy_timeout = 30000")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        chat_type TEXT NOT NULL, -- 'group' or 'one_to_one'
        file_path TEXT,
        total_messages INTEGER DEFAULT 0,
        total_media INTEGER DEFAULT 0,
        date_range_start TEXT,
        date_range_end TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        alias TEXT,
        message_count INTEGER DEFAULT 0,
        voice_note_count INTEGER DEFAULT 0,
        image_count INTEGER DEFAULT 0,
        video_count INTEGER DEFAULT 0,
        first_seen TEXT,
        last_seen TEXT,
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        media_type TEXT DEFAULT 'none', -- 'none', 'image', 'video', 'audio', 'document'
        media_file TEXT,
        media_summary TEXT,
        is_system INTEGER DEFAULT 0,
        raw_text TEXT,
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS personas (
        id TEXT PRIMARY KEY,
        participant_id TEXT,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        communication_style TEXT,
        interests TEXT, -- JSON array
        humor_style TEXT,
        group_role TEXT,
        activity_patterns TEXT, -- JSON dict
        emoji_fingerprint TEXT, -- JSON array
        catchphrases TEXT, -- JSON array
        quirks TEXT, -- JSON array
        full_dossier TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        chat_id TEXT,
        timeline_events TEXT, -- JSON array
        topics TEXT, -- JSON array
        inside_jokes TEXT, -- JSON array
        relationships TEXT, -- JSON array
        mood_shifts TEXT, -- JSON array
        summary TEXT,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS agent_conversations (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        chat_id TEXT,
        participant_id TEXT,
        agent_type TEXT NOT NULL, -- 'deep_analyzer', 'roaster', 'reply_giver', 'memory_recall'
        title TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS agent_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL, -- 'user' or 'assistant'
        content TEXT NOT NULL,
        evidence_citations TEXT, -- JSON array
        metadata TEXT, -- JSON dict
        timestamp TEXT NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES agent_conversations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
    CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);
    CREATE INDEX IF NOT EXISTS idx_participants_chat ON participants(chat_id);
    CREATE INDEX IF NOT EXISTS idx_participants_project ON participants(project_id);
    CREATE INDEX IF NOT EXISTS idx_personas_project ON personas(project_id);
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
