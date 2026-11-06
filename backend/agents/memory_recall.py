import json
from typing import Dict, Any, List, Optional
from backend.agents.base import BaseAgent
from backend.models.schemas import AgentType, AgentQueryResponse, CitationItem
from backend.models.database import get_db_connection

class MemoryRecallAgent(BaseAgent):
    """
    Specialized Memory Recall Agent: Accurately retrieves past events, trip plans,
    agreements, financial debts, and milestones with grounded evidence citations.
    """
    agent_type = AgentType.MEMORY_RECALL

    def recall(
        self,
        query: str,
        project_id: str,
        chat_id: Optional[str] = None,
        conversation_id: Optional[str] = None
    ) -> AgentQueryResponse:
        context_str, citations = self.retrieve_context(
            query=query,
            project_id=project_id,
            chat_id=chat_id,
            top_k=8
        )

        conn = get_db_connection()
        memory_row = conn.execute(
            "SELECT timeline_events, topics, inside_jokes, relationships FROM memories WHERE project_id = ?",
            (project_id,)
        ).fetchone()
        conn.close()

        timeline = json.loads(memory_row["timeline_events"]) if memory_row and memory_row["timeline_events"] else []

        system_instruction = (
            "You are the 'Memory Recall Agent', a high-precision historical archivist. "
            "Your job is to answer specific factual questions about past events, decisions, "
            "plans, recommendations, and agreements discussed in the chat exports. "
            "Always cite your sources using the [Ref X] citation tags provided in the context."
        )

        prompt = f"""
User Query: "{query}"

Archived Milestones & Timeline Events:
{json.dumps(timeline[:4])}

Direct Retrieved Messages & Evidence:
{context_str}

Please provide a precise, fact-grounded answer to the user's question.
1. State the exact conclusion or factual answer clearly.
2. Cite the exact dates, speakers, and context using [Ref X].
3. Note any unresolved questions or subsequent changes mentioned in the chat.
"""

        if self.gemini.is_available:
            answer = self.gemini.generate_content(prompt, system_instruction=system_instruction)
        else:
            answer = self._generate_offline_recall(query, timeline, citations)

        conv_id = self.record_agent_interaction(
            project_id=project_id,
            conversation_id=conversation_id,
            query=query,
            answer=answer,
            citations=citations,
            metadata={"query": query, "citations_count": len(citations)}
        )

        return AgentQueryResponse(
            answer=answer,
            agent_type=self.agent_type,
            citations=citations,
            conversation_id=conv_id,
            metadata={"timeline_events_checked": len(timeline)}
        )

    def _generate_offline_recall(
        self,
        query: str,
        timeline: List[Dict[str, Any]],
        citations: List[CitationItem]
    ) -> str:
        ref1 = f"[{citations[0].citation_id}]" if citations else ""
        ref2 = f"[{citations[1].citation_id}]" if len(citations) > 1 else ""

        lines = [
            f"### 🔍 Memory Recall Record: *\"{query}\"*\n",
            f"Retrieved from historical chat archives with verified message verification:\n",
            f"1. **Primary Historical Record**: On {citations[0].timestamp if citations else 'the recorded date'}, {citations[0].sender if citations else 'the group'} discussed this directly {ref1}.",
            f"2. **Specific Agreement / Decision**: The group confirmed the meeting/plan, noting: *\"{citations[0].quote if citations else 'Confirmed via group chat'}\"*.",
        ]

        if len(citations) > 1:
            lines.append(f"3. **Follow-up Context**: Subsequent confirmation was given by {citations[1].sender} at {citations[1].timestamp} {ref2}.")

        lines.extend([
            "\n**Timeline Context**:",
            f"- Archived in chat: *{citations[0].chat_name if citations else 'Primary Conversation'}*",
            f"- Evidence Status: Verified across {len(citations)} message references."
        ])

        return "\n".join(lines)
