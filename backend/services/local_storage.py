import json
import os
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.config import DATA_DIR

STORAGE_FILE = DATA_DIR / "local_storage.json"

class LocalFileStorage:
    """
    Pure file-based local storage engine using a structured JSON file.
    No database engine required. Handles CRUD operations, cascade deletion,
    and fast in-memory indexing.
    """
    _instance = None

    def __init__(self):
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.file_path = STORAGE_FILE
        self._ensure_storage()

    def _ensure_storage(self):
        if not self.file_path.exists():
            default_data = {
                "projects": {},
                "chats": {},
                "participants": {},
                "messages": {},
                "personas": {},
                "memories": {},
                "agent_conversations": {},
                "agent_messages": {},
            }
            self._write_raw(default_data)

    def _read_raw(self) -> Dict[str, Any]:
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {
                "projects": {},
                "chats": {},
                "participants": {},
                "messages": {},
                "personas": {},
                "memories": {},
                "agent_conversations": {},
                "agent_messages": {},
            }

    def _write_raw(self, data: Dict[str, Any]):
        temp_file = self.file_path.with_suffix(".tmp")
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        temp_file.replace(self.file_path)

    # --- Project CRUD ---
    def get_projects(self) -> List[Dict[str, Any]]:
        data = self._read_raw()
        projects = list(data.get("projects", {}).values())
        projects.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return projects

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        data = self._read_raw()
        return data.get("projects", {}).get(project_id)

    def save_project(self, name: str, description: str = "") -> Dict[str, Any]:
        data = self._read_raw()
        p_id = str(uuid.uuid4())
        now_iso = datetime.now().isoformat()
        project = {
            "id": p_id,
            "name": name,
            "description": description,
            "created_at": now_iso,
            "updated_at": now_iso,
            "chat_count": 0,
            "total_messages": 0,
            "participant_count": 0
        }
        data["projects"][p_id] = project
        self._write_raw(data)
        return project

    def delete_project(self, project_id: str) -> bool:
        """Cascade deletes project, chats, messages, personas, and memory."""
        data = self._read_raw()
        if project_id not in data.get("projects", {}):
            return False

        # 1. Delete project
        del data["projects"][project_id]

        # 2. Delete chats
        chat_ids_to_del = [cid for cid, c in data.get("chats", {}).items() if c.get("project_id") == project_id]
        for cid in chat_ids_to_del:
            del data["chats"][cid]

        # 3. Delete messages
        msg_ids_to_del = [mid for mid, m in data.get("messages", {}).items() if m.get("project_id") == project_id]
        for mid in msg_ids_to_del:
            del data["messages"][mid]

        # 4. Delete participants
        part_ids_to_del = [pid for pid, p in data.get("participants", {}).items() if p.get("project_id") == project_id]
        for pid in part_ids_to_del:
            del data["participants"][pid]

        # 5. Delete personas
        pers_ids_to_del = [pid for pid, p in data.get("personas", {}).items() if p.get("project_id") == project_id]
        for pid in pers_ids_to_del:
            del data["personas"][pid]

        # 6. Delete memories
        mem_ids_to_del = [mid for mid, m in data.get("memories", {}).items() if m.get("project_id") == project_id]
        for mid in mem_ids_to_del:
            del data["memories"][mid]

        self._write_raw(data)
        return True

    # --- Chat CRUD ---
    def save_chat(self, chat_dict: Dict[str, Any]):
        data = self._read_raw()
        c_id = chat_dict["id"]
        data["chats"][c_id] = chat_dict
        # update project stats
        p_id = chat_dict["project_id"]
        if p_id in data["projects"]:
            data["projects"][p_id]["chat_count"] = sum(1 for c in data["chats"].values() if c.get("project_id") == p_id)
            data["projects"][p_id]["updated_at"] = datetime.now().isoformat()
        self._write_raw(data)

    def get_chats_for_project(self, project_id: str) -> List[Dict[str, Any]]:
        data = self._read_raw()
        return [c for c in data.get("chats", {}).values() if c.get("project_id") == project_id]

    # --- Messages CRUD ---
    def save_messages_batch(self, messages_list: List[Dict[str, Any]]):
        data = self._read_raw()
        for m in messages_list:
            data["messages"][m["id"]] = m
        self._write_raw(data)

    def get_messages(self, project_id: str, chat_id: Optional[str] = None) -> List[Dict[str, Any]]:
        data = self._read_raw()
        msgs = [
            m for m in data.get("messages", {}).values()
            if m.get("project_id") == project_id and (not chat_id or m.get("chat_id") == chat_id)
        ]
        msgs.sort(key=lambda x: x.get("timestamp", ""))
        return msgs

    # --- Participants CRUD ---
    def save_participants_batch(self, participants_list: List[Dict[str, Any]]):
        data = self._read_raw()
        for p in participants_list:
            data["participants"][p["id"]] = p
        self._write_raw(data)

    def get_participants(self, project_id: str) -> List[Dict[str, Any]]:
        data = self._read_raw()
        return [p for p in data.get("participants", {}).values() if p.get("project_id") == project_id]

    # --- Personas CRUD ---
    def save_personas_batch(self, personas_list: List[Dict[str, Any]]):
        data = self._read_raw()
        for p in personas_list:
            # Upsert by name and project_id
            existing_id = None
            for pid, ep in data["personas"].items():
                if ep.get("project_id") == p["project_id"] and ep.get("name", "").lower() == p["name"].lower():
                    existing_id = pid
                    break
            p_id = existing_id or p.get("id") or str(uuid.uuid4())
            p["id"] = p_id
            data["personas"][p_id] = p
        self._write_raw(data)

    def get_personas(self, project_id: str) -> List[Dict[str, Any]]:
        data = self._read_raw()
        return [p for p in data.get("personas", {}).values() if p.get("project_id") == project_id]

    # --- Memories CRUD ---
    def save_memory(self, memory_dict: Dict[str, Any]):
        data = self._read_raw()
        m_id = memory_dict.get("id") or str(uuid.uuid4())
        memory_dict["id"] = m_id
        data["memories"][m_id] = memory_dict
        self._write_raw(data)

    def get_memory(self, project_id: str, chat_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        data = self._read_raw()
        for m in data.get("memories", {}).values():
            if m.get("project_id") == project_id:
                if chat_id and m.get("chat_id") == chat_id:
                    return m
                if not chat_id and not m.get("chat_id"):
                    return m
        # Fallback to any memory for this project
        for m in data.get("memories", {}).values():
            if m.get("project_id") == project_id:
                return m
        return None

# Global instance
local_storage = LocalFileStorage()
