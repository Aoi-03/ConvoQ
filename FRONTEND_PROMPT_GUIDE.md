# AI Frontend Generation Guide: ConvoQ

Use this document to generate an ultra-cool, modern frontend for **ConvoQ** using AI builder tools such as **v0.dev**, **Lovable.dev**, **Bolt.new**, **Cursor**, **Windsurf**, or **Claude Artifacts**.

---

## 📋 Quick Copy-Paste Master Prompt

Copy and paste the block below directly into your AI tool (e.g. v0.dev, Lovable, Bolt.new, or Cursor Composer):

```markdown
Build a futuristic, multi-agent AI chat intelligence platform named "ConvoQ".
The app analyzes exported conversations (WhatsApp group and 1-on-1 chats), generates participant personas, provides multimodal media stats, and deploys 4 specialized AI agents with grounded evidence citations.

### 🎨 Design System & Aesthetic
- **Theme**: Ultra-dark modern glassmorphism (Tailwind `bg-slate-950`, borders `border-slate-800`, cards `bg-slate-900/80` with backdrop blur).
- **Accents**: Neon Cyan (`#06b6d4`), Electric Indigo (`#6366f1`), Amber Flame (`#f59e0b`), Emerald (`#10b981`), and Rose (`#f43f5e`).
- **Typography**: Clean modern sans (Plus Jakarta Sans or Inter) with JetBrains Mono for timestamps and citation tags.
- **Icons**: Lucide React icons (`Bot`, `Flame`, `BarChart3`, `MessageSquarePlus`, `History`, `Users`, `Quote`, `Mic`, `Image`, `Video`).

### 💾 Local Storage (Zero Database Required)
- All data (projects, chats, messages, personas, memories) MUST be saved, retrieved, and deleted using browser `localStorage`.
- When deleting a project, cascade-delete all its associated chats, messages, personas, and memory.
- Provide a 1-click "Load Suman Scenario" button that populates sample data into `localStorage` so the UI is immediately interactive!

### 🧱 Core Layout & Views

1. **Header / Navbar**:
   - App Logo & title with glowing "Multi-Agent AI" badge.
   - Active Project indicator.
   - "Local Storage Enabled 💾" status pill.

2. **Left Sidebar (Project Manager)**:
   - "Load 'Suman' Scenario" button (Loads 20-member College Friends group + Shrimant 1-to-1 chat).
   - "New Project" modal (Name, Description).
   - Project List with message count, chat count, participant count, and delete button with confirmation.

3. **Workspace Navigation (3 Main Tabs)**:
   - **Tab 1: AI Agent Studio**:
     * Agent sub-tabs:
       1) **Deep Analyzer Agent**: Analyzes conversation drivers, turn velocity, and mood shifts over the year. Includes suggested query chips ("Who drives most conversations?").
       2) **The Roaster Agent**: Generates witty, hilarious roasts grounded in actual chat habits (e.g. sending 3-minute voice notes, endless trip planning). Includes:
          - Target participant dropdown selector.
          - 3-level Roast Intensity selector: "Mild 🍵" (Friendly banter), "Savage 🔥" (Sharp wit), "Brutal 💀" (High voltage).
          - Safe & Playful Guardrails indicator.
       3) **Reply Giver Agent**: Generates reply variations to incoming messages. Includes:
          - Tone buttons: "Casual", "Witty", "Diplomatic", "Ultra-Brief".
          - Participant clone selector (mimic Shrimant or other friends).
          - Click-to-copy quick chips with visual checkmark feedback.
       4) **Memory Recall Agent**: Searches historical events, agreements, trip dates, and debts with verifiable evidence.
     * Scope selector: Toggle between "All Chats in Project" or a specific conversation.
     * Clickable citation badges `[Ref 1]`, `[Ref 2]` that open the Evidence Drawer.

   - **Tab 2: Conversations**:
     * Visual cards distinguishing "Group Chat" (>2 members) vs "1:1 Personal" (2 members).
     * Displays message count, voice notes count, image count, and date ranges.
     * "View Message Log" modal: scrollable message feed highlighting voice note tags (PTT-*.opus), images, and system events.
     * "Import WhatsApp Export" modal with drag-and-drop file upload.

   - **Tab 3: Participant Personas**:
     * Grid of participant dossiers.
     * Displays: Group Role badge ("The Voice-Note Chronicler", "The Chief Planner"), Communication Style description, Emoji DNA fingerprint (e.g. 🎙️ 😂 ☕ 🔥), Signature Quirks, and activity stats (messages, voice notes, media).
     * Action buttons on each card: "Roast This Person" and "Mimic Tone".

4. **Slide-over Evidence Citations Drawer**:
   - Opens on clicking any `[Ref X]` badge in agent responses.
   - Shows the exact quotation, timestamp, sender, chat name origin, and verification status.

Include complete state handling, realistic mock responses, smooth transitions, and responsive mobile-friendly layouts.
```

---

## 🛠️ Step-by-Step Instructions for Specific Tools

### Option A: Building with v0.dev (by Vercel)
1. Go to [v0.dev](https://v0.dev).
2. Paste the **Quick Copy-Paste Master Prompt** above into the prompt box.
3. If v0 asks for refinements, prompt:
   - *"Add the slide-over Evidence Citations drawer with clickable [Ref 1] tags."*
   - *"Add the 3-level intensity buttons for the Roaster agent with emoji badges."*
4. Click **Deploy** or export the React / Next.js code.

---

### Option B: Building with Lovable.dev or Bolt.new
1. Open [Lovable.dev](https://lovable.dev) or [Bolt.new](https://bolt.new).
2. Paste the Master Prompt.
3. Lovable and Bolt will generate the complete Vite + React project with Tailwind CSS and Lucide icons automatically.
4. Verify that browser `localStorage` is used for saving and deleting projects so you can reload the page without losing data.

---

### Option C: Building with Cursor Composer / Windsurf
1. Create a new directory or use the existing `frontend/` folder.
2. In Cursor, press `Ctrl + I` (Composer) or `Cmd + I`.
3. Paste the Master Prompt and specify:
   *"Generate the React components in src/components/ with pure browser localStorage persistence in src/utils/localStorageStore.js."*

---

## 🔌 Connecting to this Backend (Optional API Mode)

If you want the newly generated frontend to talk directly to this Python FastAPI backend, all endpoints are ready:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects with chat & message counts |
| `POST` | `/api/projects` | Create a new project `{"name": "...", "description": "..."}` |
| `DELETE` | `/api/projects/{id}` | Permanently delete project and cascade-delete all chats |
| `POST` | `/api/projects/{id}/load-sample-data` | 1-click load of College Friends group & Shrimant 1-to-1 chat |
| `POST` | `/api/projects/{id}/chats/upload` | Upload WhatsApp `.txt` file export (`multipart/form-data`) |
| `GET` | `/api/projects/{id}/chats/{chat_id}/messages` | Get paginated messages for a chat |
| `GET` | `/api/projects/{id}/personas` | Get generated participant persona profiles |
| `POST` | `/api/agents/query` | Query Deep Analyzer, Roaster, Reply Giver, or Memory Recall |

### Agent Query Payload Example
```json
{
  "project_id": "your-project-id",
  "agent_type": "roaster",
  "target_participant_name": "Shrimant",
  "roast_intensity": "savage",
  "query": "Roast Shrimant based on his voice-note habits"
}
```

---

## 💾 LocalStorage Key Schema (Pure Frontend Mode)

When running without any backend or database, store data under these keys:
- `convoq_projects` (or legacy `agentic_chase_projects`): `[ { id, name, description, created_at, updated_at, chat_count, total_messages } ]`
- `convoq_chats` (or legacy `agentic_chase_chats`): `[ { id, project_id, name, chat_type ("group"|"one_to_one"), total_messages, total_media, participants } ]`
- `convoq_personas` (or legacy `agentic_chase_personas`): `[ { id, project_id, name, group_role, communication_style, emoji_fingerprint, quirks, activity_patterns } ]`
- `convoq_messages` (or legacy `agentic_chase_messages`): `[ { id, project_id, chat_id, timestamp, sender, content, media_type, media_summary } ]`
