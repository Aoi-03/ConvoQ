# 🚀 ConvoQ Deployment Guide: Render (Backend) + Vercel (Frontend)

This guide walks you through deploying **ConvoQ** into production with:
- **Backend (FastAPI)** hosted on **[Render](https://render.com/)**
- **Frontend (React + Vite)** hosted on **[Vercel](https://vercel.com/)**

```
 ┌─────────────────────────┐               ┌─────────────────────────┐
 │   Vercel (Frontend)     │  REST / JSON  │    Render (Backend)     │
 │  React + Vite SPA       │ ────────────> │  FastAPI + SQLite       │
 │  convoq.vercel.app      │               │  convoq.onrender.com    │
 └─────────────────────────┘               └─────────────────────────┘
                                                       │
                                                       ▼
                                            Google Gemini 2.5 Flash
```

---

## Prerequisites

1. Your code pushed to a **GitHub repository** (e.g. `https://github.com/Aoi-03/ConvoQ`).
2. A free account on **[Render](https://render.com/)**.
3. A free account on **[Vercel](https://vercel.com/)**.
4. A Google Gemini API key from **[Google AI Studio](https://aistudio.google.com/)** *(optional, but needed for multimodal audio/image processing and online AI agents)*.

---

## Step 1: Deploy Backend to Render

Render will host the FastAPI server and hybrid search engine.

### Option A: One-Click Blueprint (Recommended)

The repository includes a ready-to-use `render.yaml` blueprint:

1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** (top right) and select **Blueprint**.
3. Connect your GitHub repository (`ConvoQ`).
4. Render will automatically detect `render.yaml` and configure the web service.
5. In the configuration prompt, enter your `GEMINI_API_KEY`.
6. Click **Apply**.
7. Wait 2–3 minutes for the build to finish. Once live, Render will give you a URL like:
   `https://convoq-backend.onrender.com`

---

### Option B: Manual Web Service Setup

If you prefer manual configuration:

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and pick your `ConvoQ` repo.
4. Fill in the service details:
   - **Name**: `convoq-backend`
   - **Region**: Choose the closest region to you (e.g., *Singapore*, *Frankfurt*, *Oregon*)
   - **Branch**: `main`
   - **Root Directory**: *(Leave blank / empty)*
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: **Free**
5. Expand **Advanced** → **Add Environment Variables**:
   | Key | Value | Description |
   |---|---|---|
   | `PYTHON_VERSION` | `3.11.9` | Ensures fast wheel installation |
   | `GEMINI_API_KEY` | `your_actual_gemini_api_key` | From Google AI Studio |
   | `GEMINI_MODEL` | `gemini-2.5-flash` | Best multimodal latency & context |
   | `CORS_ORIGINS` | `*` | Allows cross-origin calls from Vercel |
   | `USE_LOCAL_STORAGE` | `true` | Enables zero-config JSON storage mode |
   | `BACKUP_API_KEY` | *(optional)* | Groq or OpenAI fallback key |
   | `BACKUP_API_PROVIDER` | `groq` *(optional)* | Groq (Llama 3.3 70B) failover |
6. Click **Create Web Service**.
7. Once deployed, test your backend by visiting:
   ```
   https://<your-render-service-name>.onrender.com/api/health
   ```
   You should see:
   ```json
   {
     "status": "healthy",
     "gemini_api_configured": true,
     "model": "gemini-2.5-flash",
     "timestamp": "..."
   }
   ```
   > 📌 **Copy this Render URL** (e.g. `https://convoq-backend.onrender.com`). You will need it in Step 2.

---

## Step 2: Deploy Frontend to Vercel

Vercel will host the ultra-fast React + Vite SPA.

1. Log into your [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your `ConvoQ` GitHub repository.
4. In the **Configure Project** screen:
   - **Project Name**: `convoq` (or any name you prefer)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend` *(the included `frontend/vercel.json` and root `vercel.json` ensure SPA client routing works out of the box)*
   - **Build and Output Settings**:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
5. Expand **Environment Variables**:
   Add the following variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://<your-render-service-name>.onrender.com`
     *(Paste your exact Render backend URL from Step 1, without trailing slash)*
6. Click **Deploy**.
7. In ~30 seconds, Vercel will give you a live production URL:
   `https://convoq.vercel.app` (or similar).

---

## Step 3: Verify the Live Deployment

1. Open your live Vercel URL in your browser.
2. In the top-right header, verify that the status badge indicates the backend is active.
3. Click **"Load 'Suman' Scenario"** in the sidebar:
   - Two pre-built chats will load (`College Friends 🎓` and `Shrimant`).
4. Click **Deep Analyzer** or **Roaster** and send a prompt:
   - Verify that citations like `[Ref 1]` appear.
   - Click `[Ref 1]` to inspect evidence in the drawer.
5. Test chat upload:
   - Upload any `.txt` or `.zip` WhatsApp chat export.

---

## Troubleshooting & FAQ

### 1. Render Free Tier Cold Starts
On Render's Free tier, services spin down after 15 minutes of inactivity. The first request after a period of idle time can take ~30–50 seconds to warm up. 
- ConvoQ has built-in graceful local fallbacks in the frontend, so the UI will never crash or freeze while waiting.

### 2. CORS Errors in Browser Console
If you see `Access-Control-Allow-Origin` errors:
- Ensure `CORS_ORIGINS` on Render is set to `*` or includes your exact Vercel domain:
  `CORS_ORIGINS=https://your-convoq.vercel.app`
- If you change environment variables on Render, click **Manual Deploy** → **Deploy latest commit** to apply changes.

### 3. File Downloads / Media Attachments
Audio notes (`.opus`) and media files referenced in citations automatically resolve to your Render backend via `resolveApiUrl()`. Clicking download in the Evidence Drawer will fetch files directly from Render.

### 4. Updating Code
Both Render and Vercel are connected to your GitHub repository. Whenever you run:
```bash
git add .
git commit -m "update feature"
git push origin main
```
Both platforms will automatically rebuild and deploy your changes with zero downtime!
