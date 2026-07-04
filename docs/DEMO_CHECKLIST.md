# Pre-Demo Verification Checklist: ContextOS

Run this checklist immediately before recording the demo video or presenting live to judges to ensure all systems are in a healthy state.

---

## 1. Services Health Check

### A. Supabase PostgreSQL
- [ ] Connect to your Supabase dashboard or CLI.
- [ ] Run a query on `projects` and `deduplication_logs` to ensure connection is live.
- [ ] Confirm `anon` and `service_role` keys match the root `.env` configurations.

### B. Python FastAPI Backend
- [ ] Run terminal check: `http://localhost:8000/docs` resolves to the FastAPI swagger documentation.
- [ ] Verify `COGNEE_API_KEY` and `GROQ_API_KEY` are successfully loaded in python process environment variables.
- [ ] Run diagnostic endpoint check: `GET /memory/status` or equivalent endpoint to verify Cognee Cloud client init.

### C. Next.js Frontend
- [ ] Run terminal check: Web console shows no compilation errors or hot-reloading loop failures.
- [ ] Verify `http://localhost:3000` is active and loading the main dashboard.
- [ ] Open the browser developer console (`F12`) and check for any failed API gateway requests (Red 4xx/5xx).

### D. Chrome Extension
- [ ] Open `chrome://extensions`.
- [ ] Click **Reload** on the ContextOS Capture card to ensure it runs the latest `content.js` script.
- [ ] Verify the extension popup loads project list options dynamically from the Next.js API.

---

## 2. Pipeline Dry Run Tests

### A. Active Project Tracking
- [ ] Switch tabs in Chrome between Dashboard and ChatGPT.
- [ ] Open the Extension Popup and verify the Active Project updates automatically to match the Dashboard project namespace.

### B. Streaming Completion
- [ ] In a test ChatGPT window, type: *"Hello, give me a short sentence."*
- [ ] Wait for the generation to end.
- [ ] Verify `[ContextOS] Streaming finished!` is logged in the console precisely 1 second after generation ends.

### C. Ingestion and Deduplication
- [ ] Click **SAVE** on a suggestion.
- [ ] Verify the button transitions immediately to `✓ SAVED` and fades out.
- [ ] Submit the exact same prompt again in ChatGPT.
- [ ] Verify the duplicate check catches it, logging `is_duplicate: true` in the console, and *no* duplicate overlay chip is shown.

### D. Graph Sync
- [ ] Verify that saving a memory immediately adds nodes/edges to the 3D dashboard graph without refreshing the tab.

### E. Handoff Recall
- [ ] In a new chat tab, click **Continue Project** in the extension.
- [ ] Verify the clipboard payload is generated successfully and pasted automatically into the chat composer textarea.
