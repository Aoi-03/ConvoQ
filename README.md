# Agentic Chase: Multi-Agent Chat Intelligence Platform

> **Agentic Chase** processes exported conversations (WhatsApp group chats & 1-on-1 chats), extracts participant personas, performs multimodal media analysis (voice notes, images, videos), and provides specialized AI agents for deep conversation analysis, playful roasting, smart reply generation, and verifiable memory recall.

---

## 🌟 Key Capabilities

1. **Multi-Project & Multi-Chat Workspace**:
   - Organize independent conversations into projects.
   - Automatically classify chats into **Group Conversations** (>2 participants) and **One-to-One Personal Chats** (2 participants).
   - Maintain separate memory, vector retrieval, and context for each chat, while enabling cross-chat project-level queries.

2. **Universal WhatsApp Export Ingestion**:
   - Parses iOS bracketed timestamps `[DD/MM/YY, HH:MM:SS]` and Android dash timestamps `DD/MM/YYYY, HH:MM - Sender: Message`.
   - Supports 12-hour AM/PM and 24-hour formats.
   - Handles multi-line message continuation and filters system security/encryption events.
   - Identifies and associates media attachments (`<Media omitted>`, voice notes `.opus`, images `.jpg/.png`, videos `.mp4`, documents `.pdf`).

3. **Multimodal Media Intelligence**:
   - **Voice Notes**: Transcribes audio notes into text with emotional tone indicators.
   - **Images**: Scene comprehension and OCR text extraction.
   - **Videos**: Event and highlight summarization.
   - Powered by **Google Gemini 2.5 Flash** with an intelligent offline deterministic fallback.

4. **Persistent Conversational Memory & Timeline**:
   - Automatically detects recurring topics, milestones, and temporal active periods.
   - Catalogs inside jokes, group memes, and interpersonal dynamics (reply speed, conversational turn-taking).
   - Computes mood shifts and sentiment evolution across months/semesters.

5. **Participant Persona Generator**:
   - Generates stylometric dossiers: average message length, emoji DNA, capitalization habits.
   - Discovers group archetypes (*"The Chief Planner"*, *"The Voice-Note Chronicler"*, *"The Midnight Philosopher"*, *"The Meme Instigator"*).
   - Identifies specific texting quirks and recurring catchphrases.

6. **Specialized Multi-Agent Suite**:
   - **📊 Deep Analyzer Agent**: Identifies who drives conversations, participation distribution, and mood changes over time.
   - **🔥 The Roaster Agent**: Generates witty, personalized roasts based on actual chat habits (e.g. 3-minute voice notes, endless trip planning). Includes **3 intensity levels** (`Mild 🍵`, `Savage 🔥`, `Brutal 💀`) and strict safety filters against harassment.
   - **💬 Reply Giver Agent**: Suggests 4 tailored response options (Casual, Witty, Diplomatic, Ultra-Brief) or clones any selected participant's style. Includes 1-click copy chips.
   - **🔍 Memory Recall Agent**: Pinpoints exact past agreements, dates, trip itineraries, and debts with verifiable citations.

7. **Grounded Evidence Retrieval & Citations**:
   - Agent responses cite verified source messages `[Ref 1]`, `[Ref 2]`.
   - Clickable citation badges open the **Evidence Inspector Drawer** showing the exact timestamp, sender, chat origin, and message quote.

---

## 🏛️ System Architecture

```
                      +------------------------------------------+
                      |         REACT + VITE FRONTEND UI         |
                      | - Project & Chat Workspaces              |
                      | - Multi-Agent Interactive Studio         |
                      | - Evidence Inspector Drawer              |
                      | - Participant Persona Dossiers           |
                      +--------------------+---------------------+
                                           | HTTP / REST API
                      +--------------------v---------------------+
                      |           FASTAPI BACKEND CORE           |
                      +------------------------------------------+
                      | - SQLite Database (Cascade Deletion)     |
                      | - WhatsApp Multi-format Parser           |
                      | - Multimodal Media Processor             |
                      | - Persistent Memory & Timeline Engine    |
                      | - Hybrid BM25 & Vector Retrieval         |
                      | - Google Gemini 2.5 SDK + Offline Mode   |
                      +--------------------+---------------------+
                                           |
             +-----------------------------+-----------------------------+
             |                             |                             |
      +------v------+               +------v------+               +------v------+
      |Deep Analyzer|               | The Roaster |               | Reply Giver |
      +-------------+               +-------------+               +-------------+
```

---

## 🚀 Quickstart Guide

### 1. Requirements
- Python 3.10+
- Node.js 18+ (tested on Node v24)
- (Optional) `GEMINI_API_KEY` for live cloud multimodal inference

### 2. Backend Setup
```bash
# From repository root
python -m pip install -r backend/requirements.txt

# Run backend test suite (Unit & Integration tests)
python -m pytest backend/tests

# Start FastAPI Server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# In another terminal
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.
*(Or access `http://127.0.0.1:8000` directly if frontend has been built via `npm run build`)*.

---

## 🎬 Specification Scenario Demo

Click the **`Load "Suman" Scenario`** button in the sidebar to immediately load:
1. **College Friends 🎓** Group Chat (20 participants, voice notes, trip planning, exam stress periods).
2. **Shrimant** 1-on-1 Personal Chat (Suman & Shrimant discussing viva proofs, voice notes, and coffee meetups).

Try asking the specialized agents:
- **Deep Analyzer**: *"Who drives most conversations and how did the group mood change over the year?"*
- **The Roaster**: Select `Shrimant` and roast them based on their voice-note habits on **Savage 🔥** intensity.
- **Reply Giver**: Enter *"Meet at CCD in 20 mins?"* and select *Witty* or *Clone Shrimant*.
- **Memory Recall**: *"What did we decide about the Goa trip in June 2023?"*
- **Evidence Drawer**: Click any `[Ref 1]` citation badge to inspect the original source message and timestamp!

---

## 🧪 Testing

Run the full automated test suite covering parsing, participant detection, memory generation, and agent responses:
```bash
python -m pytest backend/tests -v
```
Output:
```
backend/tests/test_agents.py::test_full_pipeline_and_agents PASSED
backend/tests/test_parser.py::test_parse_android_dash_format PASSED
backend/tests/test_parser.py::test_parse_ios_bracket_format PASSED
backend/tests/test_parser.py::test_multiline_continuation PASSED
4 passed in 0.4s
```

---

## 🔒 Privacy & Safety
- **Data Isolation**: Each project maintains segregated databases and memory stores.
- **Cascade Purge**: Deleting a project permanently deletes all chats, messages, media files, and vectors.
- **Tone Controls & Guardrails**: The Roaster agent enforces content filtering to ensure roasts remain witty, friendly, and free from abusive terms or harassment.
