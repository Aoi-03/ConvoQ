from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class ChatType(str, Enum):
    GROUP = "group"
    ONE_TO_ONE = "one_to_one"

class AgentType(str, Enum):
    DEEP_ANALYZER = "deep_analyzer"
    ROASTER = "roaster"
    REPLY_GIVER = "reply_giver"
    MEMORY_RECALL = "memory_recall"

class RoastIntensity(str, Enum):
    MILD = "mild"         # Gentle, playful banter
    SAVAGE = "savage"     # Sharp, witty, roasting actual habits
    BRUTAL = "brutal"     # Uncensored roast (within safety policies)

class ReplyStyle(str, Enum):
    CASUAL = "casual"
    DIPLOMATIC = "diplomatic"
    WITTY = "witty"
    ULTRA_BRIEF = "ultra_brief"
    PARTICIPANT_CLONE = "participant_clone"

# --- Project Models ---
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = ""

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: str
    updated_at: str
    chat_count: int = 0
    total_messages: int = 0
    participant_count: int = 0

# --- Chat Models ---
class ChatResponse(BaseModel):
    id: str
    project_id: str
    name: str
    chat_type: str
    total_messages: int
    total_media: int
    date_range_start: Optional[str]
    date_range_end: Optional[str]
    participants: List[str] = []
    created_at: str

# --- Participant Models ---
class ParticipantResponse(BaseModel):
    id: str
    chat_id: str
    project_id: str
    name: str
    alias: Optional[str]
    message_count: int
    voice_note_count: int
    image_count: int
    video_count: int
    first_seen: Optional[str]
    last_seen: Optional[str]

# --- Message Models ---
class MessageResponse(BaseModel):
    id: str
    chat_id: str
    project_id: str
    timestamp: str
    sender: str
    content: str
    media_type: str
    media_file: Optional[str]
    media_summary: Optional[str]
    is_system: bool

# --- Persona Models ---
class PersonaResponse(BaseModel):
    id: str
    participant_id: Optional[str]
    project_id: str
    name: str
    communication_style: str
    interests: List[str] = []
    humor_style: str
    group_role: str
    activity_patterns: Dict[str, Any] = {}
    emoji_fingerprint: List[str] = []
    catchphrases: List[str] = []
    quirks: List[str] = []
    full_dossier: str

# --- Memory Models ---
class MemoryResponse(BaseModel):
    id: str
    project_id: str
    chat_id: Optional[str]
    timeline_events: List[Dict[str, Any]] = []
    topics: List[str] = []
    inside_jokes: List[Dict[str, Any]] = []
    relationships: List[Dict[str, Any]] = []
    mood_shifts: List[Dict[str, Any]] = []
    summary: Optional[str]
    updated_at: str

# --- Evidence Citation Models ---
class CitationItem(BaseModel):
    citation_id: str
    message_id: str
    sender: str
    timestamp: str
    chat_name: str
    quote: str
    relevance_reason: Optional[str] = None

# --- Agent Request / Response Models ---
class AgentQueryRequest(BaseModel):
    project_id: str
    agent_type: AgentType
    query: str
    chat_id: Optional[str] = None
    participant_id: Optional[str] = None
    target_participant_name: Optional[str] = None
    roast_intensity: Optional[RoastIntensity] = RoastIntensity.SAVAGE
    reply_style: Optional[ReplyStyle] = ReplyStyle.CASUAL
    conversation_id: Optional[str] = None

class AgentQueryResponse(BaseModel):
    answer: str
    agent_type: AgentType
    citations: List[CitationItem] = []
    reply_suggestions: Optional[List[str]] = None
    conversation_id: str
    metadata: Dict[str, Any] = {}

class SettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
