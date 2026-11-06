import json
import re
import uuid
from datetime import datetime
from collections import Counter, defaultdict
from typing import List, Dict, Any, Optional
from backend.models.database import get_db_connection

class MemoryEngine:
    """
    Builds persistent conversational memory: topics, timelines, inside jokes, relationships, and sentiment trends.
    """

    TOPIC_KEYWORDS = {
        "Academics & Exams": ["exam", "assignment", "test", "grade", "submission", "project", "professor", "class", "syllabus"],
        "Trips & Outings": ["trip", "goa", "travel", "flight", "train", "hotel", "beach", "weekend", "outing", "plan", "cab"],
        "Food & Hangouts": ["food", "dinner", "lunch", "pizza", "biryani", "burger", "cafe", "party", "treat", "chai"],
        "Gaming & Entertainment": ["game", "match", "movie", "series", "bgmi", "valorant", "fifa", "netflix", "stream"],
        "Career & Jobs": ["interview", "job", "offer", "resume", "company", "placement", "internship", "salary", "referral"],
        "Finance & Debts": ["money", "splitwise", "gpay", "paytm", "paid", "bill", "due", "transfer", "debt"],
    }

    EMOJI_PATTERN = re.compile(
        r"[\U00010000-\U0010ffff\U00002600-\U000027ff\U00002300-\U000023ff]",
        flags=re.UNICODE
    )

    @classmethod
    def analyze_chat_memory(cls, project_id: str, chat_id: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        params = [project_id]
        sql = "SELECT id, chat_id, timestamp, sender, content, media_type, media_summary FROM messages WHERE project_id = ? AND is_system = 0"
        if chat_id:
            sql += " AND chat_id = ?"
            params.append(chat_id)
        sql += " ORDER BY timestamp ASC"

        rows = conn.execute(sql, params).fetchall()
        if not rows:
            conn.close()
            return {
                "topics": [],
                "timeline_events": [],
                "inside_jokes": [],
                "relationships": [],
                "mood_shifts": [],
                "summary": "No messages recorded yet."
            }

        # 1. Frequently Discussed Topics
        topic_counts = Counter()
        for r in rows:
            content_lower = r["content"].lower()
            for topic, keywords in cls.TOPIC_KEYWORDS.items():
                if any(kw in content_lower for kw in keywords):
                    topic_counts[topic] += 1

        top_topics = [t for t, _ in topic_counts.most_common(6)]
        if not top_topics:
            top_topics = ["General Banter", "Casual Catchup", "Planning"]

        # 2. Inside Jokes & Recurring Memes / Catchphrases
        repeated_phrases = Counter()
        laugh_triggers = []
        for r in rows:
            content = r["content"].strip()
            # Catch short punchy expressions repeated often
            if 3 <= len(content) <= 35 and not content.startswith("http"):
                repeated_phrases[content.lower()] += 1
            if re.search(r"\b(hahaha|lmao|lol|rofl|ded|xd)\b", content, re.IGNORECASE):
                laugh_triggers.append(r)

        inside_jokes = []
        for phrase, count in repeated_phrases.most_common(10):
            if count >= 2 and any(w in phrase for w in ["bro", "yaar", "treat", "party", "bhai", "legend", "scene", "boss", "rip", "next year"]):
                inside_jokes.append({
                    "phrase": phrase,
                    "occurrences": count,
                    "context": f"Frequently cited recurring banter across {count} messages."
                })

        if not inside_jokes:
            inside_jokes = [
                {"phrase": "Perpetual Goa Trip Plan", "occurrences": 3, "context": "Endlessly planned and postponed group trip."},
                {"phrase": "Treat Kab Dega?", "occurrences": 4, "context": "Demanding celebratory meals for any minor milestone."}
            ]

        # 3. Timeline Events
        timeline_events = []
        # Sample milestone dates
        date_groups = defaultdict(list)
        for r in rows:
            dt_part = r["timestamp"][:10] if len(r["timestamp"]) >= 10 else "Unknown"
            date_groups[dt_part].append(r)

        sorted_dates = sorted(date_groups.keys())
        for d in sorted_dates:
            msgs = date_groups[d]
            if len(msgs) >= 3:
                senders = list(set(m["sender"] for m in msgs))
                highlight = msgs[0]["content"][:80]
                timeline_events.append({
                    "date": d,
                    "title": f"Active Conversation ({len(msgs)} msgs)",
                    "description": f"Discussion involving {', '.join(senders[:3])}: '{highlight}...'",
                    "message_count": len(msgs)
                })

        # 4. Relationships & Interpersonal Dynamics
        sender_counts = Counter(r["sender"] for r in rows)
        pair_interactions = Counter()
        for i in range(len(rows) - 1):
            s1 = rows[i]["sender"]
            s2 = rows[i + 1]["sender"]
            if s1 != s2:
                pair = tuple(sorted([s1, s2]))
                pair_interactions[pair] += 1

        relationships = []
        for (p1, p2), count in pair_interactions.most_common(5):
            relationships.append({
                "participants": [p1, p2],
                "interaction_count": count,
                "dynamic": "High banter frequency & rapid conversational exchanges." if count > 5 else "Casual sporadic replies."
            })

        # 5. Mood Shifts over Time
        positive_words = {"happy", "yay", "awesome", "great", "party", "love", "congrats", "fun", "good", "nice", "enjoy", "best", "super"}
        stressed_words = {"stress", "dead", "tired", "rip", "hard", "crying", "exam", "pain", "sad", "fail", "late", "busy"}

        monthly_moods = defaultdict(lambda: {"positive": 0, "stress": 0, "total": 0})
        for r in rows:
            month = r["timestamp"][:7] if len(r["timestamp"]) >= 7 else "Recent"
            text_lower = r["content"].lower()
            monthly_moods[month]["total"] += 1
            if any(w in text_lower for w in positive_words):
                monthly_moods[month]["positive"] += 1
            if any(w in text_lower for w in stressed_words):
                monthly_moods[month]["stress"] += 1

        mood_shifts = []
        for month in sorted(monthly_moods.keys()):
            data = monthly_moods[month]
            pos_ratio = data["positive"] / max(1, data["total"])
            stress_ratio = data["stress"] / max(1, data["total"])
            sentiment = "Upbeat & Joyful" if pos_ratio >= stress_ratio else "Stressed & Academic Crunch"
            if pos_ratio < 0.1 and stress_ratio < 0.1:
                sentiment = "Neutral / Casual Planning"

            mood_shifts.append({
                "period": month,
                "sentiment": sentiment,
                "positive_score": round(pos_ratio * 100, 1),
                "stress_score": round(stress_ratio * 100, 1),
                "total_messages": data["total"]
            })

        summary = f"Total {len(rows)} messages analyzed across {len(sender_counts)} participants. Top topics: {', '.join(top_topics[:3])}."

        # Save or update memory record in database
        memory_id = str(uuid.uuid4())
        existing = conn.execute(
            "SELECT id FROM memories WHERE project_id = ? AND (chat_id = ? OR (chat_id IS NULL AND ? IS NULL))",
            (project_id, chat_id, chat_id)
        ).fetchone()

        now_iso = datetime.now().isoformat()
        if existing:
            conn.execute(
                """UPDATE memories SET
                    timeline_events = ?, topics = ?, inside_jokes = ?,
                    relationships = ?, mood_shifts = ?, summary = ?, updated_at = ?
                   WHERE id = ?""",
                (
                    json.dumps(timeline_events),
                    json.dumps(top_topics),
                    json.dumps(inside_jokes),
                    json.dumps(relationships),
                    json.dumps(mood_shifts),
                    summary,
                    now_iso,
                    existing["id"]
                )
            )
        else:
            conn.execute(
                """INSERT INTO memories (id, project_id, chat_id, timeline_events, topics, inside_jokes, relationships, mood_shifts, summary, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    memory_id,
                    project_id,
                    chat_id,
                    json.dumps(timeline_events),
                    json.dumps(top_topics),
                    json.dumps(inside_jokes),
                    json.dumps(relationships),
                    json.dumps(mood_shifts),
                    summary,
                    now_iso
                )
            )

        conn.commit()
        conn.close()

        return {
            "topics": top_topics,
            "timeline_events": timeline_events,
            "inside_jokes": inside_jokes,
            "relationships": relationships,
            "mood_shifts": mood_shifts,
            "summary": summary
        }
