import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
DB_PATH = DATA_DIR / "convoq.db"

# Create required directories
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# -----------------------------------------------------------------------------
# PRIMARY AI MODEL CONFIGURATION (GOOGLE GEMINI)
# -----------------------------------------------------------------------------
# Add your Gemini API key in .env or right here.
# Best Model for this task: 'gemini-3-flash-preview'
# Why: Ultra-fast latency, native multimodal (voice note .opus transcription,
# image OCR, video summary), 1M token context window for huge chat exports.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")

# -----------------------------------------------------------------------------
# FAILOVER / BACKUP API CONFIGURATION
# -----------------------------------------------------------------------------
# If Gemini API quota/network fails, the system automatically falls back to:
# 1. Groq API ('llama-3.3-70b-versatile' - 500+ tok/sec ultra-fast chat reasoning)
# 2. OpenAI API ('gpt-4o-mini')
# 3. Built-in Deterministic Stylometric Fallback (works offline without any API)
BACKUP_API_KEY = os.getenv("BACKUP_API_KEY", os.getenv("GROQ_API_KEY", os.getenv("OPENAI_API_KEY", "")))
BACKUP_API_PROVIDER = os.getenv("BACKUP_API_PROVIDER", "groq") # 'groq' or 'openai'
BACKUP_MODEL = os.getenv("BACKUP_MODEL", "llama-3.3-70b-versatile" if BACKUP_API_PROVIDER == "groq" else "gpt-4o-mini")

# -----------------------------------------------------------------------------
# STORAGE ENGINE CONFIGURATION
# -----------------------------------------------------------------------------
# True = Pure local file-based JSON storage (Zero database setup needed)
USE_LOCAL_STORAGE = os.getenv("USE_LOCAL_STORAGE", "true").lower() in ("true", "1", "yes")

# Server settings
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8001"))
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]
