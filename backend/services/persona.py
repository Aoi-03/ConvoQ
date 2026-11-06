import re
import json
import uuid
from typing import List, Dict, Any, Optional
from collections import Counter
from backend.models.database import get_db_connection
from backend.services.gemini_client import gemini_client

class PersonaGenerator:
    """
    Generates rich participant personas covering communication style, interests, humor, and group roles.
    """

    ROLE_ARCHETYPES = [
        ("The Chief Planner", lambda stats: stats.get("planning_keywords", 0) > 3),
        ("The Voice-Note Chronicler", lambda stats: stats.get("audio_count", 0) >= 2),
        ("The Midnight Philosopher", lambda stats: stats.get("night_ratio", 0) > 0.4),
        ("The Meme Instigator", lambda stats: stats.get("image_count", 0) >= 3 or stats.get("humor_keywords", 0) > 4),
        ("The Ghost / Lurker", lambda stats: stats.get("total_messages", 0) < 5),
        ("The Quick Responder", lambda stats: stats.get("total_messages", 0) >= 15),
        ("The Casual Banterer", lambda stats: True), # Fallback
    ]

    EMOJI_PATTERN = re.compile(
        r"[\U00010000-\U0010ffff\U00002600-\U000027ff\U00002300-\U000023ff]",
        flags=re.UNICODE
    )

    @classmethod
    def generate_personas_for_project(cls, project_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        participants = conn.execute(
            "SELECT id, chat_id, name, alias, message_count, voice_note_count, image_count, video_count FROM participants WHERE project_id = ?",
            (project_id,)
        ).fetchall()

        if not participants:
            conn.close()
            return []

        personas = []
        for p in participants:
            p_name = p["name"]
            # Fetch all messages sent by this participant
            msgs = conn.execute(
                "SELECT id, timestamp, content, media_type, media_summary FROM messages WHERE project_id = ? AND LOWER(sender) = ? AND is_system = 0",
                (project_id, p_name.lower())
            ).fetchall()

            if not msgs:
                continue

            persona = cls._build_single_persona(project_id, p["id"], p_name, msgs, p)
            personas.append(persona)

            # Upsert into personas table
            existing = conn.execute(
                "SELECT id FROM personas WHERE project_id = ? AND LOWER(name) = ?",
                (project_id, p_name.lower())
            ).fetchone()

            if existing:
                conn.execute(
                    """UPDATE personas SET
                        participant_id = ?, communication_style = ?, interests = ?,
                        humor_style = ?, group_role = ?, activity_patterns = ?,
                        emoji_fingerprint = ?, catchphrases = ?, quirks = ?, full_dossier = ?
                       WHERE id = ?""",
                    (
                        p["id"],
                        persona["communication_style"],
                        json.dumps(persona["interests"]),
                        persona["humor_style"],
                        persona["group_role"],
                        json.dumps(persona["activity_patterns"]),
                        json.dumps(persona["emoji_fingerprint"]),
                        json.dumps(persona["catchphrases"]),
                        json.dumps(persona["quirks"]),
                        persona["full_dossier"],
                        existing["id"]
                    )
                )
            else:
                conn.execute(
                    """INSERT INTO personas (id, participant_id, project_id, name, communication_style,
                                             interests, humor_style, group_role, activity_patterns,
                                             emoji_fingerprint, catchphrases, quirks, full_dossier)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        str(uuid.uuid4()),
                        p["id"],
                        project_id,
                        p_name,
                        persona["communication_style"],
                        json.dumps(persona["interests"]),
                        persona["humor_style"],
                        persona["group_role"],
                        json.dumps(persona["activity_patterns"]),
                        json.dumps(persona["emoji_fingerprint"]),
                        json.dumps(persona["catchphrases"]),
                        json.dumps(persona["quirks"]),
                        persona["full_dossier"]
                    )
                )

        conn.commit()
        conn.close()
        return personas

    @classmethod
    def _build_single_persona(
        cls,
        project_id: str,
        participant_id: str,
        name: str,
        messages: List[Any],
        participant_row: Any
    ) -> Dict[str, Any]:
        total_msgs = len(messages)
        all_text = " ".join(m["content"] for m in messages)

        # 1. Stylometric analysis
        emojis = cls.EMOJI_PATTERN.findall(all_text)
        top_emojis = [e for e, _ in Counter(emojis).most_common(5)]

        words = [w for w in re.findall(r"\w+", all_text) if len(w) > 1]
        avg_word_length = round(sum(len(w) for w in words) / max(1, len(words)), 1)
        avg_msg_length = round(len(words) / max(1, total_msgs), 1)

        # Check all caps ratio
        caps_msgs = sum(1 for m in messages if m["content"].isupper() and len(m["content"]) > 3)
        caps_pct = round((caps_msgs / max(1, total_msgs)) * 100, 1)

        # 2. Activity patterns (Hours)
        hours = []
        for m in messages:
            ts = m["timestamp"]
            # Extract hour
            match = re.search(r"(\d{1,2}):\d{2}", ts)
            if match:
                hours.append(int(match.group(1)))

        night_msgs = sum(1 for h in hours if h >= 22 or h <= 4)
        night_ratio = night_msgs / max(1, len(hours)) if hours else 0.0

        audio_count = participant_row["voice_note_count"] or sum(1 for m in messages if m["media_type"] == "audio")
        image_count = participant_row["image_count"] or sum(1 for m in messages if m["media_type"] == "image")

        # 3. Humor & Interests
        humor_keywords = sum(1 for w in ["haha", "lol", "lmao", "rofl", "ded", "joke", "meme"] if w in all_text.lower())
        planning_keywords = sum(1 for w in ["meet", "plan", "time", "reach", "venue", "schedule", "tomorrow", "book"] if w in all_text.lower())

        stats = {
            "total_messages": total_msgs,
            "audio_count": audio_count,
            "image_count": image_count,
            "night_ratio": night_ratio,
            "humor_keywords": humor_keywords,
            "planning_keywords": planning_keywords,
        }

        # Determine Role
        group_role = "The Casual Banterer"
        for role_name, condition in cls.ROLE_ARCHETYPES:
            if condition(stats):
                group_role = role_name
                break

        # Determine Humor Style
        if humor_keywords > 5:
            humor_style = "Sarcastic & Rapid-Fire Meme Banter"
        elif caps_pct > 20:
            humor_style = "Dramatic High-Energy Exaggeration"
        elif audio_count >= 2:
            humor_style = "Conversational Voice-Note Storytelling"
        else:
            humor_style = "Subtle, Deadpan & Situational"

        # Communication Style Summary
        style_traits = []
        if avg_msg_length < 5:
            style_traits.append("Hyper-concise punchy texts")
        elif avg_msg_length > 15:
            style_traits.append("Detailed, explanatory multi-sentence messages")
        else:
            style_traits.append("Balanced conversational phrasing")

        if top_emojis:
            style_traits.append(f"Heavy emoji user ({''.join(top_emojis)})")
        if audio_count > 0:
            style_traits.append(f"Prefers sending voice notes ({audio_count} recorded)")
        if night_ratio > 0.3:
            style_traits.append("Peak activity during late night hours")

        comm_style = " • ".join(style_traits)

        # Catchphrases & Quirks
        catchphrases = []
        for word, count in Counter(w.lower() for w in words if len(w) > 3).most_common(5):
            if count >= 2 and word not in {"this", "that", "with", "have", "from", "will"}:
                catchphrases.append(word)

        if not catchphrases:
            catchphrases = ["haha", "sure", "done"]

        quirks = []
        if audio_count >= 2:
            quirks.append("Replaces 5-word text replies with 2-minute voice notes.")
        if caps_pct > 15:
            quirks.append("Frequently types in ALL-CAPS when excited.")
        if avg_msg_length < 4:
            quirks.append("Sends three single-word messages in a row rather than one sentence.")
        if not quirks:
            quirks.append("Consistent, steady presence in the chat flow.")

        # Interests
        interests = []
        if "exam" in all_text.lower() or "study" in all_text.lower() or "project" in all_text.lower():
            interests.append("Academics & Project Deadlines")
        if "trip" in all_text.lower() or "goa" in all_text.lower() or "travel" in all_text.lower():
            interests.append("Travel & Weekend Trips")
        if "food" in all_text.lower() or "treat" in all_text.lower() or "party" in all_text.lower():
            interests.append("Food Outings & Celebrations")
        if not interests:
            interests = ["Friendship Banter", "Social Hangouts"]

        full_dossier = (
            f"{name} is '{group_role}'. Their texting cadence is characterized by {comm_style.lower()}. "
            f"Frequently leads or reacts to topics like {', '.join(interests)}. "
            f"Signature quirk: {quirks[0]}."
        )

        return {
            "participant_id": participant_id,
            "project_id": project_id,
            "name": name,
            "communication_style": comm_style,
            "interests": interests,
            "humor_style": humor_style,
            "group_role": group_role,
            "activity_patterns": {
                "total_messages": total_msgs,
                "avg_words_per_message": avg_msg_length,
                "late_night_percentage": round(night_ratio * 100, 1),
                "voice_notes_sent": audio_count,
                "images_shared": image_count,
            },
            "emoji_fingerprint": top_emojis,
            "catchphrases": catchphrases,
            "quirks": quirks,
            "full_dossier": full_dossier,
        }
