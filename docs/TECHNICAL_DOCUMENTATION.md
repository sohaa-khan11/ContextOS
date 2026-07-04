# Technical Documentation: ContextOS

This document details the workspace project structure, the API reference specification, and the complete memory lifecycle pipeline for ContextOS.

---

## 1. Project Directory Structure

```
ContextOS Root
├── app/                      # Next.js 16 App Router & API Gateway Proxy
│   ├── (dashboard)/          # Dashboard project layout & spatial views
│   └── api/                  # API routes routing to the python microservice
├── extension/                # Chrome Extension (Manifest V3)
│   ├── background.js         # Service worker tracking active projects
│   ├── content.js            # DOM Observer & inline horizontal toolbar injections
│   ├── popup/                # Chrome Extension popup toolbar UI
│   └── manifest.json         # Extension permissions & page inject declarations
├── frontend/                 # React UI Components & R3F Spatial graph
│   ├── components/
│   │   ├── spatial/          # Three.js (React Three Fiber) graph engine
│   │   └── ui/               # Layout panels, data streams, and forms
│   └── styles/               # CSS variables and styling overrides
├── python-cognee-service/    # FastAPI Backend Service (Python 3.11)
│   ├── main.py               # API endpoints, request validators, and routes
│   ├── groq_client.py        # Groq Llama 3 structured JSON schema extractor
│   ├── cognee_client.py      # Neo4j and Qdrant integration via Cognee SDK
│   ├── dedup.py              # MD5 content hash database logic
│   └── requirements.txt      # Backend Python dependencies
```

### Module Responsibilities & Communication
- **Client to Gateway**: The Chrome Extension captures assistant completion events in `content.js` and sends them via service worker `background.js` to Next.js proxy route `/api/extension/capture`.
- **Gateway to Orchestrator**: Next.js parses request metadata, checks JWT tokens, and proxies queries to the Python FastAPI backend on `http://localhost:8000`.
- **Database Coordination**: FastAPI validates content deduplication in Supabase, and builds the Neo4j Knowledge Graph and Qdrant vector index via the Cognee Python SDK.
- **SSE Sync**: The Next.js dashboard receives database triggers and broadcasts updates over Server-Sent Events (SSE) to the spatial 3D graph panel, which immediately re-renders the nodes without page reload.

---

## 2. API Reference Specification

### A. Proactive Analysis
* **Endpoint**: `POST /api/extension/analyze`
* **Request Body**: `{ "project_id": "string", "text": "string" }`
* **Response**: Returns JSON containing `should_save` (boolean), `memory_type` (Decision, Task, Risk, Fact), `summary` (string), and `reason` (string).

### B. Persist Capture
* **Endpoint**: `POST /api/extension/capture`
* **Request Body**:
  ```json
  {
    "project_id": "string",
    "text": "string",
    "source": "string",
    "metadata": {
      "analysis": {
        "should_save": true,
        "memory_type": "Decision",
        "importance_score": 80,
        "reason": "string",
        "summary": "string"
      },
      "captured_from": "string",
      "raw_text": "string"
    }
  }
  ```
* **Response**: `{ "status": "success", "message": "Memory ingested into Cognee", "hash": "string" }`

### C. 3D Spatial Graph Data
* **Endpoint**: `GET /api/projects/[id]/graph`
* **Response**:
  ```json
  {
    "nodes": [{ "id": "string", "label": "string", "type": "concept/decision/risk/task" }],
    "edges": [{ "source": "string", "target": "string", "relation": "string" }]
  }
  ```

### D. Recall Project Context (Handoff)
* **Endpoint**: `POST /api/projects/[id]/recall`
* **Request Body**: `{ "query": "string" }`
* **Response**: `{ "success": true, "prompt": "Synthesized continuation prompt markdown" }`

### E. Graph Optimization
* **Endpoint**: `POST /api/projects/[id]/improve`
* **Response**: `{ "success": true, "message": "Cognee graph optimized successfully" }`

### F. Wipe Project namespace
* **Endpoint**: `POST /api/projects/[id]/forget`
* **Response**: `{ "success": true, "message": "All project data completely forgotten" }`

---

## 3. The Memory Pipeline Lifecycle

### Phase 1: Capture & Clean
- `content.js` monitors ChatGPT streaming completion. 
- It cleans code blocks and ASCII diagrams, and dispatches the top 3 paragraphs of the assistant message in parallel to `analyze`.

### Phase 2: Groq JSON Analysis
- Groq evaluates the paragraphs and extracts key properties (importance, summary, memory type). If `should_save` is `true`, the suggestion toolbar is rendered.

### Phase 3: Hash Deduplication
- Upon saving, the FastAPI backend generates an MD5 hash of the raw text and checks Supabase. If the hash exists, it skips ingestion to avoid duplicate nodes.

### Phase 4: Ingestion (Cognee)
- The memory is vectorized in Qdrant and mapped as a semantic relationship node in the Neo4j Graph database.

### Phase 5: Handoff Synthesis
- The user clicks **Continue Project**. ContextOS queries Cognee for the graph namespace, fetches connected node relationships, and uses Groq to synthesize them into a clean Markdown continuation prompt.
