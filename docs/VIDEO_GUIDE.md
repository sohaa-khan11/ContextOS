# Video Demo & Presentation Guide: ContextOS

This document combines the recording preparation checklist, the word-for-word voiceover script, and potential Q&A questions for hackathon judges.

---

## 1. Recording Preparation

### A. Resolution & Scaling
- Set monitor resolution to **1080p** (`1920x1080`).
- Zoom levels: Chrome Extension Popup at `100%`, ChatGPT Tab at `110%` (for readability), Dashboard at `100%`.
- Hide browser bookmarks (`Ctrl+Shift+B`) and mute all notifications.

### B. Clean Database Setup
- Open Dashboard on `http://localhost:3000`.
- Create a clean project namespace named **"Next-Gen AI Backend"**.
- Reload the Chrome Extension under `chrome://extensions` to clear browser script caches.

---

## 2. Word-for-Word Video Script

### Part 1: Intro (0:00 - 0:30)
* **Vocal**: "Hello everyone! Today, we are excited to introduce ContextOS—a proactive, ambient memory layer that fixes context loss in AI development. Every time you start a new chat with an assistant, you lose your architecture history, engineering decisions, and task lists. ContextOS fixes this by establishing a persistent, cross-platform knowledge graph of your project, roaming with you across any AI tool."
* **Action**: `[OPEN]` ContextOS Dashboard on `http://localhost:3000`. Hover and rotate the empty 3D graph.

### Part 2: Setup (0:30 - 1:00)
* **Vocal**: "It starts with our Chrome Extension. If we open the popup in the top right, we can select our project: 'Next-Gen AI Backend'. Now, as we navigate across chat interfaces, the extension acts as our ambient capture listener."
* **Action**: `[CLICK]` Extension icon in the Chrome toolbar. Select project from dropdown. Close popup.

### Part 3: Ambient Suggestions (1:00 - 2:00)
* **Vocal**: "Let’s ask ChatGPT which framework to choose for our async backend. As the text streams, the extension ignores code and diagrams. As soon as the generation finishes, the backend parses the context in the background. Look at this: right here, below the paragraph, an inline horizontal suggestion toolbar slides in!"
* **Action**: `[OPEN]` ChatGPT tab. `[TYPE]` *"Which Python web framework should I choose for an async AI backend, and why?"* `[WAIT]` Let the text stream finish. `[SHOW]` Cursor pointing to the inline suggestions toolbar below the paragraph.

### Part 4: Save & Why (2:00 - 2:45)
* **Vocal**: "We can click 'WHY?' to inspect the AI's extraction reasoning inline. Let's click 'SAVE'. Behind the scenes, the text block is checked for duplication, analyzed via Groq, and ingested as relationships in Cognee Cloud. The button transitions to 'SAVED' and slides out."
* **Action**: `[CLICK]` **WHY?** to show reason dropdown. `[CLICK]` **SAVE** button. Let it change to `✓ SAVED` and fade out.

### Part 5: Graph Visual & Handoff (2:45 - 4:00)
* **Vocal**: "Let's check our dashboard. Without refreshing the page, our 3D graph has immediately populated! We can see our decisions rendered as red octahedrons. Finally, if we open a brand-new chat tab, we can click 'Continue Project' in our popup. The extension queries Cognee, builds a continuation prompt, and automatically injects it right into our text box!"
* **Action**: `[OPEN]` Dashboard tab. Rotate 3D graph. `[OPEN]` New empty ChatGPT tab. `[CLICK]` Extension popup -> **Continue Project**. `[SHOW]` Prompt injected in textarea.

---

## 3. Possible Judge Questions & Answers

### Q1: Why Cognee instead of simple vector RAG?
- **A**: "Vector RAG retrieves disconnected float text snippets. Cognee constructs a **Knowledge Graph** (Neo4j). By mapping decisions, tasks, and concepts as connected nodes, ContextOS can traverse relationship edges to retrieve complete context histories, producing high-fidelity prompts."

### Q2: Why FastAPI for the backend?
- **A**: "Cognee's SDK is native to Python. FastAPI provides high-throughput async processing, meaning concurrent database and LLM calls run in parallel, keeping extension save operations under 1 second."

### Q3: Why a Chrome Extension instead of a standalone web chat app?
- **A**: "To prevent developer friction. Instead of forcing developers to use a custom chat app, the extension meets them exactly where they already work (ChatGPT), capturing context ambiently."
