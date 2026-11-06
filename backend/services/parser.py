import re
import uuid
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass, field

@dataclass
class ParsedMessage:
    id: str
    timestamp_raw: str
    timestamp_iso: str
    sender: str
    content: str
    media_type: str  # 'none', 'image', 'video', 'audio', 'document'
    media_filename: Optional[str] = None
    media_summary: Optional[str] = None
    is_system: bool = False
    raw_text: str = ""

@dataclass
class ParsedChat:
    name: str
    chat_type: str  # 'group' or 'one_to_one'
    participants: List[str]
    messages: List[ParsedMessage]
    date_range_start: Optional[str] = None
    date_range_end: Optional[str] = None
    total_messages: int = 0
    total_media: int = 0
    participant_stats: Dict[str, Dict[str, int]] = field(default_factory=dict)

class WhatsAppParser:
    """
    Robust WhatsApp Chat Export Parser for iOS, Android, 12h/24h, and bracketed formats.
    """

    # Android / Web: "12/05/2023, 14:30 - Sender: message" or "12/5/23, 2:30 pm - Sender: message"
    DASH_PATTERN = re.compile(
        r"^(?P<datetime>[\d\/\.\-]+,?\s+[\d:]+(?:\s*[AaPp][Mm])?)\s*-\s*(?:(?P<sender>[^:]+?):\s*)?(?P<content>.*)$"
    )

    # iOS: "[12/05/2023, 14:30:15] Sender: message" or "[12/05/23, 2:30:15 PM] Sender: message"
    BRACKET_PATTERN = re.compile(
        r"^\[(?P<datetime>[\d\/\.\-]+,?\s+[\d:]+(?::\d+)?(?:\s*[AaPp][Mm])?)\]\s*(?:(?P<sender>[^:]+?):\s*)?(?P<content>.*)$"
    )

    # System messages patterns
    SYSTEM_PATTERNS = [
        re.compile(r"messages and calls are end-to-end encrypted", re.IGNORECASE),
        re.compile(r"created group", re.IGNORECASE),
        re.compile(r"added you", re.IGNORECASE),
        re.compile(r"added\s+.*", re.IGNORECASE),
        re.compile(r"left\s+.*", re.IGNORECASE),
        re.compile(r"removed\s+.*", re.IGNORECASE),
        re.compile(r"changed the group", re.IGNORECASE),
        re.compile(r"security code changed", re.IGNORECASE),
        re.compile(r"disappearing messages", re.IGNORECASE),
    ]

    # Media indicators
    IMAGE_PATTERNS = [
        re.compile(r"<media omitted>", re.IGNORECASE),
        re.compile(r"image omitted", re.IGNORECASE),
        re.compile(r"\bIMG-\d+-\w+\.jpg\b", re.IGNORECASE),
        re.compile(r"\b.+\.(?:jpg|jpeg|png|webp|heic)\s+\(file attached\)", re.IGNORECASE),
    ]

    AUDIO_PATTERNS = [
        re.compile(r"audio omitted", re.IGNORECASE),
        re.compile(r"voice note omitted", re.IGNORECASE),
        re.compile(r"\bPTT-\d+-\w+\.opus\b", re.IGNORECASE),
        re.compile(r"\b.+\.(?:opus|m4a|mp3|aac|wav|ogg)\s+\(file attached\)", re.IGNORECASE),
    ]

    VIDEO_PATTERNS = [
        re.compile(r"video omitted", re.IGNORECASE),
        re.compile(r"\bVID-\d+-\w+\.mp4\b", re.IGNORECASE),
        re.compile(r"\b.+\.(?:mp4|mov|mkv|3gp)\s+\(file attached\)", re.IGNORECASE),
    ]

    DOCUMENT_PATTERNS = [
        re.compile(r"document omitted", re.IGNORECASE),
        re.compile(r"\b.+\.(?:pdf|docx|xlsx|pptx|zip|txt)\s+\(file attached\)", re.IGNORECASE),
    ]

    @classmethod
    def parse_datetime(cls, dt_str: str) -> Tuple[str, str]:
        """Convert varied WhatsApp date strings to uniform ISO timestamp and raw string."""
        cleaned = dt_str.strip().replace("\u202f", " ").replace("\xa0", " ")
        cleaned = re.sub(r"\s+", " ", cleaned)

        # Try various standard formats
        date_formats = [
            "%d/%m/%Y, %H:%M:%S",
            "%d/%m/%Y, %H:%M",
            "%d/%m/%y, %H:%M:%S",
            "%d/%m/%y, %H:%M",
            "%d/%m/%Y, %I:%M:%S %p",
            "%d/%m/%Y, %I:%M %p",
            "%d/%m/%y, %I:%M:%S %p",
            "%d/%m/%y, %I:%M %p",
            "%m/%d/%Y, %I:%M:%S %p",
            "%m/%d/%Y, %I:%M %p",
            "%m/%d/%y, %I:%M:%S %p",
            "%m/%d/%y, %I:%M %p",
            "%Y-%m-%d, %H:%M:%S",
            "%Y-%m-%d, %H:%M",
        ]

        for fmt in date_formats:
            try:
                dt = datetime.strptime(cleaned, fmt)
                return dt_str, dt.isoformat()
            except ValueError:
                continue

        # Fallback to current or raw
        return dt_str, datetime.now().isoformat()

    @classmethod
    def detect_media(cls, text: str) -> Tuple[str, Optional[str]]:
        """Identify media type and possible filename."""
        text_lower = text.strip().lower()

        # Audio / Voice note
        for pat in cls.AUDIO_PATTERNS:
            match = pat.search(text)
            if match:
                return "audio", match.group(0) if "." in match.group(0) else None

        # Video
        for pat in cls.VIDEO_PATTERNS:
            match = pat.search(text)
            if match:
                return "video", match.group(0) if "." in match.group(0) else None

        # Image
        for pat in cls.IMAGE_PATTERNS:
            match = pat.search(text)
            if match:
                return "image", match.group(0) if "." in match.group(0) else None

        # Document
        for pat in cls.DOCUMENT_PATTERNS:
            match = pat.search(text)
            if match:
                return "document", match.group(0) if "." in match.group(0) else None

        return "none", None

    @classmethod
    def parse_chat_text(cls, text: str, fallback_chat_name: str = "Imported Chat") -> ParsedChat:
        """
        Parse raw WhatsApp chat text into structured messages, participants, and metadata.
        """
        lines = text.splitlines()
        messages: List[ParsedMessage] = []
        participants_set = set()
        participant_stats: Dict[str, Dict[str, int]] = {}

        current_message: Optional[ParsedMessage] = None

        for line in lines:
            # Strip zero-width unicode characters
            clean_line = line.replace("\u200e", "").replace("\u200f", "").replace("\ufeff", "")
            if not clean_line.strip():
                continue

            match = cls.BRACKET_PATTERN.match(clean_line)
            if not match:
                match = cls.DASH_PATTERN.match(clean_line)

            if match:
                # Save previous message
                if current_message:
                    messages.append(current_message)

                dt_raw = match.group("datetime")
                sender_raw = match.group("sender")
                content = match.group("content") or ""

                _, dt_iso = cls.parse_datetime(dt_raw)

                # Check if it is a system message (no sender or matches system patterns)
                is_system = False
                if not sender_raw:
                    is_system = True
                    sender = "System"
                else:
                    sender = sender_raw.strip()
                    for sys_pat in cls.SYSTEM_PATTERNS:
                        if sys_pat.search(content) or sys_pat.search(sender):
                            is_system = True
                            break

                media_type, media_filename = cls.detect_media(content)

                if not is_system and sender != "System":
                    participants_set.add(sender)
                    if sender not in participant_stats:
                        participant_stats[sender] = {
                            "messages": 0,
                            "audio": 0,
                            "images": 0,
                            "videos": 0,
                            "documents": 0,
                        }
                    participant_stats[sender]["messages"] += 1
                    if media_type == "audio":
                        participant_stats[sender]["audio"] += 1
                    elif media_type == "image":
                        participant_stats[sender]["images"] += 1
                    elif media_type == "video":
                        participant_stats[sender]["videos"] += 1
                    elif media_type == "document":
                        participant_stats[sender]["documents"] += 1

                current_message = ParsedMessage(
                    id=str(uuid.uuid4()),
                    timestamp_raw=dt_raw,
                    timestamp_iso=dt_iso,
                    sender=sender,
                    content=content.strip(),
                    media_type=media_type,
                    media_filename=media_filename,
                    is_system=is_system,
                    raw_text=clean_line,
                )
            else:
                # Multi-line continuation of current message
                if current_message:
                    current_message.content += "\n" + clean_line
                    current_message.raw_text += "\n" + clean_line
                else:
                    # Header or preliminary text
                    pass

        if current_message:
            messages.append(current_message)

        participants = sorted(list(participants_set))
        # Determine chat type: if > 2 participants, it's a group; exactly 2 or 1 is one_to_one
        chat_type = "group" if len(participants) > 2 else "one_to_one"

        total_messages = len(messages)
        total_media = sum(1 for m in messages if m.media_type != "none")

        start_date = messages[0].timestamp_iso if messages else None
        end_date = messages[-1].timestamp_iso if messages else None

        return ParsedChat(
            name=fallback_chat_name,
            chat_type=chat_type,
            participants=participants,
            messages=messages,
            date_range_start=start_date,
            date_range_end=end_date,
            total_messages=total_messages,
            total_media=total_media,
            participant_stats=participant_stats,
        )
