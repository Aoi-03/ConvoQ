import json
from typing import Dict, Any, List, Optional
from backend.agents.base import BaseAgent
from backend.models.schemas import AgentType, AgentQueryResponse, ReplyStyle, CitationItem
from backend.models.database import get_db_connection

class ReplyGiverAgent(BaseAgent):
    """
    Specialized Reply Giver Agent: Suggests context-grounded replies in the user's style
    or clones a specific participant's communication tone.
    """
    agent_type = AgentType.REPLY_GIVER

    def suggest_replies(
        self,
        query: str,
        project_id: str,
        chat_id: Optional[str] = None,
        style: ReplyStyle = ReplyStyle.CASUAL,
        clone_participant_name: Optional[str] = None,
        conversation_id: Optional[str] = None
    ) -> AgentQueryResponse:
        context_str, citations = self.retrieve_context(
            query=query,
            project_id=project_id,
            chat_id=chat_id,
            participant_name=clone_participant_name,
            top_k=6
        )

        # Retrieve target style persona if cloning
        clone_persona = {}
        if clone_participant_name:
            conn = get_db_connection()
            p_row = conn.execute(
                "SELECT * FROM personas WHERE project_id = ? AND LOWER(name) = ?",
                (project_id, clone_participant_name.lower())
            ).fetchone()
            conn.close()
            if p_row:
                clone_persona = dict(p_row)

        system_instruction = (
            "You are the 'Reply Giver', an expert AI ghostwriter. Your job is to generate multiple "
            "intelligent, natural reply suggestions to an incoming message or conversation situation. "
            "Match the requested tone or mimic the communication quirks of the specified participant. "
            "Format your reply as 3-4 distinct numbered options with short style labels."
        )

        prompt = f"""
Incoming Conversation Context or Message to Reply to:
"{query}"

Requested Reply Style: {style.value.upper()}
Participant Tone to Clone: {clone_participant_name or 'Default user'}
Clone Persona Details: {json.dumps(clone_persona)}

Recent Chat History & Context:
{context_str}

Please generate 4 distinct reply suggestions:
1. Casual & Friendly
2. Witty & Playful
3. Diplomatic & Polite
4. Ultra-Brief / Quick Chip
"""

        suggestions = []
        if self.gemini.is_available:
            answer = self.gemini.generate_content(prompt, system_instruction=system_instruction)
            # Extract suggested lines
            for line in answer.splitlines():
                if line.strip().startswith(("1.", "2.", "3.", "4.", "-")):
                    cleaned = line.strip().lstrip("1234.- *").strip()
                    if len(cleaned) > 2:
                        suggestions.append(cleaned)
        else:
            answer, suggestions = self._generate_offline_replies(query, style, clone_participant_name, citations)

        conv_id = self.record_agent_interaction(
            project_id=project_id,
            conversation_id=conversation_id,
            query=query,
            answer=answer,
            citations=citations,
            metadata={"style": style.value, "suggestions": suggestions}
        )

        return AgentQueryResponse(
            answer=answer,
            agent_type=self.agent_type,
            citations=citations,
            reply_suggestions=suggestions[:4],
            conversation_id=conv_id,
            metadata={"clone_target": clone_participant_name, "style": style.value}
        )

    def _generate_offline_replies(
        self,
        query: str,
        style: ReplyStyle,
        clone_name: Optional[str],
        citations: List[CitationItem]
    ) -> tuple[str, List[str]]:
        ref1 = f"[{citations[0].citation_id}]" if citations else ""

        suggestions = [
            f"Haha totally down! Let's lock in the time and meet up.",
            f"Sounds like a plan, but only if someone else is driving this time 😂 {ref1}",
            f"Running slightly behind schedule, start without me and I'll join in 15 mins.",
            f"Done deal. Count me in! 👍"
        ]

        if clone_name:
            suggestions[1] = f"(Mimicking {clone_name}): Bro, I'll send a 3-minute voice note explaining everything in 5 mins!"

        lines = [
            f"### 💬 Smart Reply Suggestions (Style: {style.value.capitalize()})\n",
            f"Here are tailored reply options crafted for the situation *\"{query}\"*:\n",
            f"1. **Casual & Upbeat**: \"{suggestions[0]}\"",
            f"2. **Witty & Banter**: \"{suggestions[1]}\"",
            f"3. **Diplomatic / Practical**: \"{suggestions[2]}\"",
            f"4. **Ultra-Brief**: \"{suggestions[3]}\"",
            f"\n*Click any quick chip in the UI to copy or send immediately.*"
        ]

        return "\n".join(lines), suggestions
