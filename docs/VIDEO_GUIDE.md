# Video Demo & Presentation Guide: ContextOS

This document serves as the recording preparation checklist, the word-for-word voiceover script, and potential Q&A questions for hackathon judges, covering the **entire ContextOS project lifecycle**.

---

## 1. Recording Preparation

### A. Resolution & Scaling
- Set monitor resolution to **1080p** (`1920x1080`).
- Zoom levels: Chrome Extension Popup at `100%`, ChatGPT Tab at `110%` (for readability), Dashboard at `100%`.
- Hide browser bookmarks (`Ctrl+Shift+B`) and mute all notifications.

### B. Clean Database Setup
- Open Dashboard on `http://localhost:3000`.
- Ensure the Python backend and Next.js are running.
- Create a clean project namespace named **"Next-Gen AI Backend"**.
- Reload the Chrome Extension under `chrome://extensions` to clear browser script caches.

---

## 2. Word-for-Word Video Script

### Part 1: Intro (0:00 - 0:30)
* **Vocal**: "Hello everyone! Today, we are excited to introduce ContextOS—a universal memory layer that permanently solves context loss in AI development. Every time you start a new chat session with a model, you lose your architecture history and engineering decisions. ContextOS fixes this by ambiently observing your workflow and building a persistent, 3D knowledge graph of your project that roams with you across any AI tool."
* **Action**: `[OPEN]` ContextOS Dashboard on `http://localhost:3000`. Hover and rotate the 3D graph (even if mostly empty at start).

### Part 2: Proactive Capture (0:30 - 1:15)
* **Vocal**: "Our Chrome Extension acts as the ambient listener. If we ask ChatGPT to brainstorm an architecture decision, the extension intelligently parses the streaming response. It filters out boilerplate and code, uses a local heuristic engine, and as soon as a key architectural insight is detected, it slides in an inline toolbar right below the paragraph. We click Save, and it instantly routes to our Python pipeline."
* **Action**: `[OPEN]` ChatGPT tab. `[TYPE]` *"Which Python web framework should I choose for an async AI backend, and why?"* `[WAIT]` Let the text stream finish. `[SHOW]` Cursor pointing to the inline suggestions toolbar. `[CLICK]` **Save**.

### Part 3: Knowledge Graph Architecture (1:15 - 1:45)
* **Vocal**: "What happens when we save? The backend checks for exact duplicates via a PostgreSQL hash check, extracts structural JSON using Groq, and pushes triplets into Cognee Cloud. Unlike basic Vector RAG which loses semantic relationships, Cognee constructs a true Knowledge Graph, mapping decisions to rationales via directional edges."
* **Action**: `[SWITCH]` to a pre-drawn Architecture diagram, or `[OPEN]` the ContextOS dashboard showing the newly populated 3D nodes and edges. `[POINT]` out the Active Knowledge Stream on the right showing the parsed Decision card.

### Part 4: Universal Recall & Handoff (1:45 - 2:30)
* **Vocal**: "Because we use a graph database, we can trace exact reasoning chains with zero context drift. If we open a completely blank chat in Claude or Cursor, we simply open the extension, select our project, and hit 'Continue Project'. ContextOS traverses the Neo4j graph, Groq synthesizes a master continuation prompt, and injects it directly into the chat box. You pick up exactly where you left off, anywhere on the web."
* **Action**: `[OPEN]` New empty ChatGPT/Claude tab. `[CLICK]` Extension popup -> **Continue Project**. `[SHOW]` Master continuation prompt injected in the textarea.

---

## 3. Possible Judge Questions & Answers

### Q1: Why Cognee instead of simple vector RAG?
- **A**: "Vector RAG retrieves disconnected float text snippets. Cognee constructs a **Knowledge Graph** (Neo4j). By mapping decisions, tasks, and concepts as connected nodes, ContextOS can traverse relationship edges to retrieve complete context histories without hallucination."

### Q2: How do you prevent the extension from saving junk data like menus or ASCII diagrams?
- **A**: "The extension features a robust DOM MutationObserver that only targets `<div data-message-author-role='assistant'>`. It then runs heuristic tests—checking for >30% structural character density, horizontal dividers, and code blocks—to actively drop diagrams and code from the analysis pipeline before ever hitting the LLM."

### Q3: How is the Active Knowledge Stream populated?
- **A**: "The frontend requests a canned summary of the project. The Python FastAPI service queries the Cognee Knowledge Graph to pull semantic chunks, which are then passed through Groq to reliably synthesize structured JSON arrays of decisions, tasks, and risks."
