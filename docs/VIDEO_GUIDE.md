# Video Demo Recording Guide: ContextOS

This guide outlines the preparation steps, browser setup, and sequential flow for recording a highly polished, professional hackathon demo video (3-5 minutes long).

---

## 1. Preparation Checklist

### A. Environment & Windows
- **Screen Resolution**: Set display resolution to `1920x1080` (1080p) for clean video rendering.
- **Browser Window**: Use a clean, non-maximized window scaled to 1080p, or go fullscreen if browser chrome is hidden.
- **Zoom Levels**:
  - Chrome Extension Popup: `100%`
  - ChatGPT Tab: `110%` (for high text legibility)
  - Dashboard Tab: `100%` (for maximum 3D graph viewing area)
- **Hide Clutter**:
  - Disable browser bookmarks bar (`Ctrl+Shift+B`).
  - Turn off custom browser themes (use standard system Dark Mode).
  - Mute all desktop notifications.
  - Close unused chat sidebar tabs.

### B. Clean Database State
Before recording, wipe previous memories to start with a fresh project workspace:
1. Open the ContextOS Dashboard (`http://localhost:3000`).
2. Create a clean project named **"Next-Gen AI Backend"**.
3. Confirm that the 3D Graph is empty (no nodes or edges).
4. Clear the local Chrome storage/extension cache:
   - Go to `chrome://extensions`.
   - Toggle **Developer Mode** off and on.
   - Reload the **ContextOS Capture** extension.

### C. Services Terminals Layout
Have these running in the background, ready to show if you do a quick technical overview:
- **Terminal 1**: Next.js frontend server (`npm run dev`)
- **Terminal 2**: Python FastAPI backend (`uvicorn main:app --port 8000`)
- **Terminal 3**: Supabase CLI or database log streams (optional)

---

## 2. Sequential Demo Flow

| Stage | Duration | Action | Visual Target | Key Talking Point |
| :--- | :--- | :--- | :--- | :--- |
| **1. Intro** | 30s | Introduce the project, problem, and elevator pitch. | Dashboard (Empty Graph) | Context is lost when switching chats. ContextOS creates a persistent memory layer. |
| **2. Extension Setup** | 30s | Open extension popup, select the active project. | Extension Popup | The extension acts as a context roamer, linking browser activity to the graph. |
| **3. Proactive Capture** | 60s | Submit a system design prompt in ChatGPT. Wait for it to finish streaming. | ChatGPT Chat Page | Observe the inline Horizontal Suggestions Toolbar slide in below the decisions paragraph. |
| **4. Save & Why** | 45s | Click "WHY?" to show inline reasoning. Click "SAVE" to store it. | ChatGPT Chat Page | Real-time AI extraction using Groq, content deduplication check, and Neo4j triplet ingestion. |
| **5. Dashboard Visual** | 45s | Switch to the Dashboard tab. Notice the 3D spatial graph has automatically loaded new nodes! | Dashboard Graph | Showing real-time database sync via SSE (no refresh required). Explain graph node representations. |
| **6. Universal Handoff** | 60s | Open a new ChatGPT tab. Click "Continue Project" in the extension popup. | New ChatGPT Tab | The extension retrieves memories from Cognee, builds a continuation prompt, and copies/injects it. |
| **7. Closing** | 30s | Summarize project impact, tech stack integration, and future roadmaps. | Dashboard Graph | Transforming AI interactions from isolated sessions to persistent, structured memory ecosystems. |
