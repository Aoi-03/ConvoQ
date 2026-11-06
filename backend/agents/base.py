import re
import uuid
import json
from typing import List, Dict, Any, Optional, Tuple
from backend.services.gemini_client import gemini_client
from backend.services.vector_store import HybridVectorStore
from backend.models.database import get_db_connection
from backend.models.schemas import CitationItem, AgentQueryResponse, AgentType

class BaseAgent:
    """
    Base Agent providing context retrieval, evidence grounding, and citation binding.
    """
    agent_type: AgentType = AgentType.DEEP_ANALYZER

    def __init__(self):
        self.gemini = gemini_client

    def retrieve_context(
        self,
        query: str,
        project_id: str,
        chat_id: Optional[str] = None,
        participant_name: Optional[str] = None,
        top_k: int = 8
    ) -> Tuple[str, List[CitationItem]]:
        """
        Retrieves relevant conversation context and returns formatted context string + citation items.
        """
        citations = HybridVectorStore.search(
            query=query,
            project_id=project_id,
            chat_id=chat_id,
            participant_name=participant_name,
            top_k=top_k
        )

        formatted_lines = []
        for c in citations:
            line = f"[{c.citation_id}] ({c.chat_name} | {c.timestamp} | {c.sender}): \"{c.quote}\""
            formatted_lines.append(line)

        context_str = "\n".join(formatted_lines)
        return context_str, citations

    def get_project_metadata(self, project_id: str) -> Dict[str, Any]:
        conn = get_db_connection()
        project = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        chats = conn.execute("SELECT * FROM chats WHERE project_id = ?", (project_id,)).fetchall()
        participants = conn.execute("SELECT * FROM participants WHERE project_id = ?", (project_id,)).fetchall()
        memories = conn.execute("SELECT * FROM memories WHERE project_id = ?", (project_id,)).fetchall()
        conn.close()

        return {
            "project": dict(project) if project else {},
            "chats": [dict(c) for c in chats],
            "participants": [dict(p) for p in participants],
            "memories": [dict(m) for m in memories],
        }

    def record_agent_interaction(
        self,
        project_id: str,
        conversation_id: Optional[str],
        query: str,
        answer: str,
        citations: List[CitationItem],
        metadata: Dict[str, Any]
    ) -> str:
        """
        Store agent interaction and conversation history in the database.
        """
        conn = get_db_connection()
        now_iso = ""
        from datetime import datetime
        now_iso = datetime.now().isoformat()

        conv_id = conversation_id or str(uuid.uuid4())

        # Check if project exists, or insert stub so foreign key constraint never fails
        proj_exists = conn.execute("SELECT id FROM projects WHERE id = ?", (project_id,)).fetchone()
        if not proj_exists:
            conn.execute(
                "INSERT OR IGNORE INTO projects (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                (project_id, "Project", "Local Workspace Project", now_iso, now_iso)
            )

        # Check if conversation exists
        existing = conn.execute("SELECT id FROM agent_conversations WHERE id = ?", (conv_id,)).fetchone()
        if not existing:
            conn.execute(
                "INSERT INTO agent_conversations (id, project_id, agent_type, title, created_at) VALUES (?, ?, ?, ?, ?)",
                (conv_id, project_id, self.agent_type.value, query[:40], now_iso)
            )

        # Insert user message
        conn.execute(
            "INSERT INTO agent_messages (id, conversation_id, role, content, evidence_citations, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), conv_id, "user", query, json.dumps([]), json.dumps({}), now_iso)
        )

        # Insert assistant message
        conn.execute(
            "INSERT INTO agent_messages (id, conversation_id, role, content, evidence_citations, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                str(uuid.uuid4()),
                conv_id,
                "assistant",
                answer,
                json.dumps([c.model_dump() for c in citations]),
                json.dumps(metadata),
                now_iso
            )
        )

        conn.commit()
        conn.close()
        return conv_id
