import os
from typing import Optional, Dict, Any, List
from pathlib import Path
from backend.services.gemini_client import gemini_client
from backend.models.database import get_db_connection

class MultimodalProcessor:
    """
    Processes media attachments: images, voice notes, and videos, linking them to message records.
    """

    @classmethod
    def process_media_for_message(
        cls,
        message_id: str,
        media_type: str,
        file_path: Optional[str] = None,
        context_hint: str = ""
    ) -> str:
        summary = ""
        if media_type == "audio":
            if file_path and os.path.exists(file_path):
                summary = gemini_client.transcribe_audio(file_path, context_hint)
            else:
                summary = f"[Voice Note: {context_hint or 'Audio message / voice note shared in chat'}]"
        elif media_type == "image":
            if file_path and os.path.exists(file_path):
                summary = gemini_client.analyze_image(file_path, context_hint)
            else:
                summary = f"[Image: {context_hint or 'Photo / screenshot shared in chat'}]"
        elif media_type == "video":
            if file_path and os.path.exists(file_path):
                summary = gemini_client.summarize_video(file_path, context_hint)
            else:
                summary = f"[Video: {context_hint or 'Video clip shared in chat'}]"
        else:
            summary = "[Document / Attachment]"

        # Update in database if message_id provided
        if message_id:
            try:
                conn = get_db_connection()
                conn.execute(
                    "UPDATE messages SET media_summary = ? WHERE id = ?",
                    (summary, message_id)
                )
                conn.commit()
                conn.close()
            except Exception as e:
                print(f"[MultimodalProcessor] Failed to update message {message_id}: {e}")

        return summary

    @classmethod
    def batch_process_chat_media(cls, chat_id: str):
        """
        Process any unsummarized media in a chat.
        """
        conn = get_db_connection()
        rows = conn.execute(
            "SELECT id, media_type, media_file, content FROM messages WHERE chat_id = ? AND media_type != 'none' AND (media_summary IS NULL OR media_summary = '')",
            (chat_id,)
        ).fetchall()

        for row in rows:
            m_id = row["id"]
            m_type = row["media_type"]
            m_file = row["media_file"]
            content = row["content"]
            cls.process_media_for_message(m_id, m_type, m_file, context_hint=content)

        conn.close()
