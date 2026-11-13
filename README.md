# ConvoQ

**Your WhatsApp chats hold a lot more than just messages.** ConvoQ is a multi-agent AI platform that takes your exported WhatsApp conversations — group chats, one-on-ones, voice notes, images, the whole archive — and turns them into something you can actually explore and interact with.

Upload a chat export, and ConvoQ figures out who the main characters are, what you collectively talked about most, how the group mood shifted over time, and what actually got decided in all those "okay so Goa trip, final plan?" threads. Then it puts four specialized AI agents at your fingertips to help you dig deeper.

---

## What it does

### Four AI agents, each built for a different job

** Deep Analyzer**
Breaks down your chat's conversation dynamics — who drives discussions, who kicks things off after a long silence, how participation is distributed, and how the group's emotional tone shifted month by month. Ask it anything: *"Who dominates conversations and how did the mood change around exam season?"*

** The Roaster**
Generates personalized, witty roasts grounded in each person's actual chat habits. It reads their real quirks — the 3-minute voice notes, the "on my way" texts sent from bed, the all-caps excitement — and turns them into comedy. Three intensity levels: Mild 🍵, Savage 🔥, and Brutal 💀. Built-in safety filters keep it funny rather than mean.

** Reply Giver**
Stuck on how to reply to something? Paste the message (or describe the situation), pick a vibe — Casual, Witty, Diplomatic, or Ultra-Brief — and get four ready-to-copy suggestions. You can also clone someone's texting style so the reply sounds exactly like them.

** Memory Recall**
The group decided something about the Goa trip in June. Someone owed someone money. There was a plan for that birthday dinner. Memory Recall finds it, tells you exactly what was said, by whom, and when — and cites the original message so you can verify it yourself.

### Every answer is backed by evidence

All agent responses include clickable citation badges — `[Ref 1]`, `[Ref 2]` — that open an **Evidence Inspector Drawer** showing the exact original message, timestamp, sender, and which chat it came from. No hallucinations passed off as facts.

### It actually understands media

Voice notes get transcribed with emotional tone indicators. Images get scene descriptions and OCR text extraction. Videos get summarized. All powered by **Google Gemini 2.5 Flash**, with a graceful offline fallback if the API isn't configured.

### Participant personas, automatically

For every person in your chats, ConvoQ builds a stylometric dossier: their average message length, emoji fingerprint, capitalization habits, peak activity hours, voice-note frequency. It also assigns them a group archetype — *The Chief Planner*, *The Voice-Note Chronicler*, *The Midnight Philosopher*, *The Meme Instigator* — based on their actual behavior patterns.

### Organized by projects

You can group multiple chats into a project and query across all of them at once, or zoom into a single conversation. Group chats (3+ participants) and 1:1 chats are automatically classified and kept in separate contexts.

---

## Under the hood

The backend is FastAPI + SQLite with cascade deletion — deleting a project wipes everything cleanly. Message retrieval uses a hybrid BM25 + cosine similarity search engine built on NumPy and scikit-learn, no external vector database needed. The WhatsApp parser handles both iOS (`[DD/MM/YY, HH:MM:SS]`) and Android (`DD/MM/YYYY, HH:MM - Sender:`) export formats, including 12h/24h clocks, multi-line messages, and media attachments.

The AI layer has a three-tier failover: Gemini 2.5 Flash → Groq (Llama 3.3 70B) → OpenAI (GPT-4o-mini) → built-in deterministic offline engine. The app works without any API key at all — the offline fallback generates structured, coherent responses from the chat data itself.

The frontend is React + Vite + Tailwind, with no heavy UI framework dependencies.

```
React + Vite Frontend
        │
        │ HTTP / REST
        ▼
FastAPI Backend
  ├── SQLite (cascade deletion)
  ├── WhatsApp parser (iOS + Android)
  ├── Multimodal processor (Gemini)
  ├── Memory & timeline engine
  ├── Hybrid BM25 + vector retrieval
  └── AI failover chain
        │
        ├── Deep Analyzer Agent
        ├── The Roaster Agent
        ├── Reply Giver Agent
        └── Memory Recall Agent
```

---

## Getting started

**Requirements**
- Python 3.10+
- Node.js 18+
- A Gemini API key is optional — the app runs offline without one

**1. Clone and install backend dependencies**

```bash
pip install -r backend/requirements.txt
```

**2. Configure your API keys (optional)**

Copy `.env.example` to `.env` and fill in what you have:

```env
# Primary AI — get a free key at https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Backup failover — Groq's free tier is fast and generous
BACKUP_API_PROVIDER=groq
BACKUP_API_KEY=your_groq_api_key_here
BACKUP_MODEL=llama-3.3-70b-versatile
```

All three providers are optional. The app always falls back gracefully.

**3. Start the backend**

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

**4. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> If you've run `npm run build` in the frontend, the backend also serves the built app directly at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## Deploy to Cloud (Render + Vercel)

ConvoQ is pre-configured for a dual deployment:
- **Backend (FastAPI)** on **Render**: Pre-configured with `render.yaml` blueprint and `requirements.txt`.
- **Frontend (React + Vite)** on **Vercel**: Pre-configured with `vercel.json` for client-side SPA routing and `VITE_API_BASE_URL` support.

👉 **See the complete step-by-step instructions in [DEPLOYMENT.md](DEPLOYMENT.md).**


---

## Try it immediately — no chat export needed

Click **"Load 'Suman' Scenario"** in the sidebar. It loads two pre-built sample chats:

- **College Friends 🎓** — a 20-person group chat with voice notes, trip planning debates, and exam stress arcs
- **Shrimant** — a 1:1 chat between Suman and Shrimant covering viva prep, voice notes, and coffee meetups

Good prompts to try once loaded:

| Agent | Try asking... |
|---|---|
| Deep Analyzer | *"Who drives most conversations and how did the group mood change over the year?"* |
| The Roaster | Select Shrimant → Savage intensity → click Roast |
| Reply Giver | *"Meet at CCD in 20 mins?"* → choose Witty or Clone Shrimant |
| Memory Recall | *"What did we decide about the Goa trip in June 2023?"* |

Then click any `[Ref 1]` citation badge — the Evidence Drawer slides open with the exact original message.

---

## Running tests

```bash
python -m pytest backend/tests -v
```

Expected output:

```
backend/tests/test_agents.py::test_full_pipeline_and_agents PASSED
backend/tests/test_parser.py::test_parse_android_dash_format PASSED
backend/tests/test_parser.py::test_parse_ios_bracket_format PASSED
backend/tests/test_parser.py::test_multiline_continuation PASSED
4 passed in 0.4s
```

---

## Privacy

- Each project has its own isolated database and memory store — nothing bleeds across projects
- Deleting a project cascade-purges everything: chats, messages, media files, vectors, agent conversations
- The Roaster's safety filter strips harassment-adjacent terms before any roast is shown
- No chat data leaves your machine unless you configure an external API key

---

## Tech stack

| Layer | What's used |
|---|---|
| Backend | Python 3.10+, FastAPI, SQLite, Pydantic v2 |
| Frontend | React 18, Vite, Tailwind CSS, Lucide icons |
| AI / LLM | Google Gemini 2.5 Flash (primary), Groq Llama 3.3 70B (backup), GPT-4o-mini (backup) |
| Search | BM25 + cosine similarity (NumPy + scikit-learn, no external vector DB) |
| Media | Gemini multimodal for voice transcription, image OCR, video summarization |
