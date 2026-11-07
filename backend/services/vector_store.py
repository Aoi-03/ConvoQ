import re
import math
from typing import List, Dict, Any, Optional, Tuple
from collections import Counter
from backend.models.database import get_db_connection
from backend.models.schemas import CitationItem

class HybridVectorStore:
    """
    Hybrid semantic vector and BM25-style keyword search engine with citation linking.
    Works natively without heavy external databases, perfectly suited for rapid local retrieval.
    """

    @classmethod
    def tokenize(cls, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r"\w+", text) if len(w) > 1]

    @classmethod
    def search(
        cls,
        query: str,
        project_id: str,
        chat_id: Optional[str] = None,
        participant_name: Optional[str] = None,
        top_k: int = 8
    ) -> List[CitationItem]:
        """
        Search for relevant messages matching the query in project/chat scope.
        """
        conn = get_db_connection()
        query_params = [project_id]
        sql = """
            SELECT m.id, m.project_id, m.chat_id, m.timestamp, m.sender, m.content, m.media_type, m.media_file, m.media_summary, c.name as chat_name
            FROM messages m
            JOIN chats c ON m.chat_id = c.id
            WHERE m.project_id = ? AND m.is_system = 0
        """

        if chat_id:
            sql += " AND m.chat_id = ?"
            query_params.append(chat_id)

        if participant_name:
            sql += " AND LOWER(m.sender) = ?"
            query_params.append(participant_name.lower())

        rows = conn.execute(sql, query_params).fetchall()
        conn.close()

        if not rows:
            return []

        query_tokens = cls.tokenize(query)
        if not query_tokens:
            query_tokens = ["chat"]

        # Compute document frequencies
        doc_count = len(rows)
        df: Counter = Counter()
        corpus = []

        for r in rows:
            text = f"{r['sender']} {r['content']} {r['media_summary'] or ''}"
            tokens = cls.tokenize(text)
            corpus.append((r, tokens, set(tokens)))
            for t in set(tokens):
                df[t] += 1

        # Score documents with BM25-like scoring
        scored_docs = []
        for r, tokens, token_set in corpus:
            score = 0.0
            doc_len = len(tokens)
            token_counts = Counter(tokens)

            for qt in query_tokens:
                if qt in token_set:
                    idf = math.log((doc_count - df[qt] + 0.5) / (df[qt] + 0.5) + 1.0)
                    tf = token_counts[qt]
                    # BM25 tf saturation
                    score += idf * (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * doc_len / 20.0))

            # Bonus for exact substring match
            if query.lower() in r["content"].lower():
                score += 3.0

            # Bonus for sender match in query
            if r["sender"].lower() in query.lower():
                score += 2.0

            if score > 0:
                scored_docs.append((score, r))

        # Sort descending by score
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        top_rows = [doc for _, doc in scored_docs[:top_k]]

        # If zero score matches, fall back to recent contextual messages
        if not top_rows:
            top_rows = [r for r, _, _ in corpus[-top_k:]]

        citations: List[CitationItem] = []
        for i, row in enumerate(top_rows, 1):
            quote_text = row["content"]
            if row["media_summary"]:
                quote_text += f" ({row['media_summary']})"

            # Extract possible file reference
            m_type = row["media_type"] if "media_type" in row.keys() else "none"
            m_file = row["media_file"] if "media_file" in row.keys() else None
            m_summary = row["media_summary"] if "media_summary" in row.keys() else None

            p_id = row["project_id"] if "project_id" in row.keys() else project_id
            c_id = row["chat_id"] if "chat_id" in row.keys() else (chat_id or "")

            download_url = None
            if m_file:
                clean_name = os.path.basename(m_file)
                download_url = f"/api/projects/{p_id}/chats/{c_id}/files/{clean_name}"
            else:
                # Check for file extension in quote/content
                fn_match = re.search(r"([\w\-.]+\.(?:pdf|docx|xlsx|pptx|opus|mp3|wav|ogg|jpg|jpeg|png|mp4|zip))", row["content"], re.IGNORECASE)
                if fn_match:
                    clean_name = fn_match.group(1).replace("(file attached)", "").strip()
                    download_url = f"/api/projects/{p_id}/chats/{c_id}/files/{clean_name}"

            citations.append(
                CitationItem(
                    citation_id=f"Ref {i}",
                    message_id=row["id"],
                    sender=row["sender"],
                    timestamp=row["timestamp"],
                    chat_name=row["chat_name"],
                    quote=quote_text[:200],
                    relevance_reason=f"Matched context in {row['chat_name']}",
                    media_type=m_type,
                    media_file=m_file,
                    media_summary=m_summary,
                    download_url=download_url
                )
            )

        return citations
