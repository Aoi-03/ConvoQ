import json
from typing import Dict, Any, List, Optional
from backend.agents.base import BaseAgent
from backend.models.schemas import AgentType, AgentQueryResponse, RoastIntensity, CitationItem
from backend.models.database import get_db_connection

class RoasterAgent(BaseAgent):
    """
    Specialized Roaster Agent: Delivers witty, playful roasts grounded in actual chat habits and history.
    Features configurable tone controls (Mild, Savage, Brutal) and safety guardrails.
    """
    agent_type = AgentType.ROASTER

    SAFETY_BLOCKED_TERMS = [
        "hate", "kill", "die", "ugly", "fat", "suicide", "slur", "racist"
    ]

    def roast(
        self,
        query: str,
        project_id: str,
        target_name: Optional[str] = None,
        intensity: RoastIntensity = RoastIntensity.SAVAGE,
        chat_id: Optional[str] = None,
        conversation_id: Optional[str] = None
    ) -> AgentQueryResponse:
        # Determine target name from query if not explicitly passed
        target = target_name
        if not target:
            # Check if query names someone
            conn = get_db_connection()
            participants = conn.execute("SELECT name FROM participants WHERE project_id = ?", (project_id,)).fetchall()
            conn.close()
            for p in participants:
                if p["name"].lower() in query.lower():
                    target = p["name"]
                    break

        if not target:
            target = "the group"

        # Search for evidence of target's messages, voice notes, quirks
        search_query = f"{target} voice note call late haha plan meet"
        context_str, citations = self.retrieve_context(
            query=search_query,
            project_id=project_id,
            chat_id=chat_id,
            participant_name=target if target != "the group" else None,
            top_k=8
        )

        # Retrieve target's persona dossier
        conn = get_db_connection()
        persona_row = conn.execute(
            "SELECT * FROM personas WHERE project_id = ? AND LOWER(name) = ?",
            (project_id, target.lower())
        ).fetchone()
        conn.close()

        persona_info = dict(persona_row) if persona_row else {}
        quirks = json.loads(persona_info.get("quirks", "[]")) if persona_info.get("quirks") else []
        role = persona_info.get("group_role", "The Casual Banterer")
        comm_style = persona_info.get("communication_style", "sporadic texting")
        activity_patterns = json.loads(persona_info.get("activity_patterns", "{}")) if persona_info.get("activity_patterns") else {}

        # Tone intensity instructions
        intensity_guidelines = {
            RoastIntensity.MILD: "Keep it gentle, warm, playful, and affectionately teasing. Like a best friend smiling while poking fun.",
            RoastIntensity.SAVAGE: "Sharp, witty, comedic burns targeting their specific texting quirks, voice note obsessions, and group habits. Clever punchlines.",
            RoastIntensity.BRUTAL: "High-voltage comedy roast! Deliver dramatic hyperbole, mercilessly funny metaphors about their chat attendance and typing habits, but strictly adhering to safety standards (no slurs or true malice)."
        }

        system_instruction = (
            "You are 'The Roaster', a legendary stand-up comic and witty chat archivist. "
            "You craft personalized, hilarious, and creative roasts based on REAL chat habits: "
            "sending podcast-length voice notes, typing in all caps, promising to reach in 5 mins while still in bed, "
            "and ghosting group plans. Ground your jokes in real evidence with [Ref X] citations. "
            "CRITICAL SAFETY RULE: Never use hate speech, slurs, body shaming, or real-life harm. Keep it focused on chat behavior."
        )

        prompt = f"""
Target to Roast: {target}
Roast Intensity Level: {intensity.value.upper()}
Guideline: {intensity_guidelines.get(intensity, intensity_guidelines[RoastIntensity.SAVAGE])}

User Prompt: "{query}"

Target's Profile & Quirks:
- Group Role: {role}
- Texting Style: {comm_style}
- Specific Quirks: {', '.join(quirks) if quirks else 'Sends voice notes instead of typing, always promises to show up'}
- Activity Stats: {json.dumps(activity_patterns)}

Evidence Messages Context:
{context_str}

Deliver a top-tier roast with:
1. Punchy roast title.
2. The Roast itself, divided into comedic punchlines citing habits and message references [Ref 1], [Ref 2].
3. A funny verdict / honorary title.
"""

        if self.gemini.is_available:
            raw_answer = self.gemini.generate_content(prompt, system_instruction=system_instruction)
            answer = self._apply_safety_guardrails(raw_answer)
        else:
            answer = self._generate_offline_roast(target, intensity, quirks, activity_patterns, citations)

        conv_id = self.record_agent_interaction(
            project_id=project_id,
            conversation_id=conversation_id,
            query=query,
            answer=answer,
            citations=citations,
            metadata={"target": target, "intensity": intensity.value}
        )

        return AgentQueryResponse(
            answer=answer,
            agent_type=self.agent_type,
            citations=citations,
            conversation_id=conv_id,
            metadata={"target": target, "intensity": intensity.value}
        )

    def _apply_safety_guardrails(self, text: str) -> str:
        for bad in self.SAFETY_BLOCKED_TERMS:
            if bad in text.lower():
                text = text.replace(bad, "[censored]")
        return text

    def _generate_offline_roast(
        self,
        target: str,
        intensity: RoastIntensity,
        quirks: List[str],
        stats: Dict[str, Any],
        citations: List[CitationItem]
    ) -> str:
        ref1 = f"[{citations[0].citation_id}]" if citations else ""
        ref2 = f"[{citations[1].citation_id}]" if len(citations) > 1 else ""

        voice_notes = stats.get("voice_notes_sent", 2)

        if intensity == RoastIntensity.MILD:
            lines = [
                f"### 🔥 Friendly Roast for {target}: The Warm Tease\n",
                f"We love {target}, but let's be completely honest about their chat footprint:",
                f"- **The Voice Note Dilemma**: {target} records voice notes that need their own Spotify playlist and podcast cover art {ref1}. A simple 'yes' takes them 45 seconds of vocal warmups.",
                f"- **Punctuality in Texts**: Whenever {target} says 'on my way', NASA scientists have to recalculate the expansion rate of the universe before they actually show up {ref2}.",
                f"- **Honorary Award**: *Master of the 3-Minute Voice Monologue* 🎙️"
            ]
        elif intensity == RoastIntensity.SAVAGE:
            lines = [
                f"### 🔥 Savage Roast: Setting {target} on Comedic Fire\n",
                f"Ladies and gentlemen, put your hands together for {target}, whose texting habits are an endangered species of communication etiquette:",
                f"- **The Podcast Host Nobody Asked For**: {target} doesn't send voice notes—they send feature-length audio documentaries {ref1}. We need an intermission, popcorn, and subtitles just to find out if they want pizza or burgers.",
                f"- **The 5-Minute Illusion**: Citing actual chat timestamps, when {target} says 'give me 2 mins', that's not standard time—that's interstellar wormhole time {ref2}. By the time they arrive, the semester is over.",
                f"- **Typing vs Talking**: They have a smartphone with a full QWERTY keyboard, yet their fingers treat the keyboard like lava while the microphone button has their permanent fingerprint permanently bonded to it.",
                f"\n**Verdict**: {target} belongs in the Guinness Book of World Records for *Highest Voice-Note Bitrate with Lowest Actual Urgency*."
            ]
        else: # BRUTAL
            lines = [
                f"### 💀 Nuclear Roast: Maximum Heat on {target}\n",
                f"Brace yourselves. Looking through the raw, unedited chat logs of {target} is like examining an archaeological study of conversational chaos:",
                f"- **Audio Filibuster**: {target}'s voice notes should come with a 'Skip Intro' button and a terms-of-service agreement {ref1}. WhatsApp engineers are considering adding a 4x playback speed specifically for their rambling voice memos.",
                f"- **The Ghosting Phenomenon**: They will leave the group hanging on a critical plan for 14 hours, and then drop into the chat at 2:00 AM with a single laughing emoji like nothing happened {ref2}.",
                f"- **The Blueprint of Chaos**: Even their typos have typos. If procrastination was an Olympic event, {target} wouldn't even show up to the medal ceremony because they'd still be sending a voice memo explaining why their alarm didn't ring.",
                f"\n**Final Diagnosis**: 10/10 friendship, 0/10 chat punctuality. 🎙️💥"
            ]

        return "\n".join(lines)
