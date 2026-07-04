# Project Structure Guide: ContextOS

ContextOS is split into three main modules: the Next.js web dashboard, the Chrome extension capture client, and the Python FastAPI orchestration engine.

---

## 1. Directory Tree Overview

```
ContextOS Root
├── app/                      # Next.js 16 App Router Pages & API Gateway
│   ├── (dashboard)/          # Dashboard project view layout & state management
│   └── api/                  # API routes proxying requests to python service
├── extension/                # Chrome Extension (Manifest V3)
│   ├── background.js         # Service worker handling network requests & projects
│   ├── content.js            # DOM Observer & inline horizontal toolbar injections
│   ├── popup/                # Chrome Extension popup toolbar UI
│   └── manifest.json         # Extension permissions & page inject declarations
├── frontend/                 # React UI Components & Styling
│   ├── components/
│   │   ├── spatial/          # Three.js (React Three Fiber) 3D Graph visualization
│   │   └── ui/               # DataStreamPanel, Forms, Layout panels
│   └── styles/               # Glassmorphic CSS variables & Tailwind config
├── python-cognee-service/    # FastAPI Backend Service (Python 3.11)
│   ├── main.py               # API endpoints, JSON request validations, routes
│   ├── groq_client.py        # LLM parsing schema prompts & prompt synthesis
│   ├── cognee_client.py      # Neo4j and Qdrant integration via Cognee SDK
│   ├── dedup.py              # MD5 content hash database logic
│   └── requirements.txt      # Python library dependency definitions
├── supabase/                 # Database Schema & SQL Scripts
└── shared/                   # Shared TypeScript models & configurations
```

---

## 2. Directory Responsibilities

### A. `/app` (API Gateway & Pages)
- **Routes**: Coordinates layout pages and handles client-side state.
- **Gateway**: `app/api/extension/analyze` and `/capture` endpoints receive requests from the Chrome Extension background worker, validate headers, and proxy them to the Python FastAPI backend.
- **SSE Channels**: Manages SSE streams that trigger the 3D visualizer to reload graph nodes when a new memory is captured.

### B. `/extension` (Capture Roamer)
- **`content.js`**: Runs inside target pages (ChatGPT). Detects when response generation ends, cleans text (removes markdown tables, code, and ASCII flowcharts), sends it to background, and inserts absolute toolbars below target paragraphs.
- **`background.js`**: Tracks the currently active project tab in Chrome and matches the capture destination project ID dynamically. Manages auth tokens and background storage states.

### C. `/frontend/components/spatial` (3D Spatial Graph)
- **`SpatialEngine.tsx`**: Renders node objects using React Three Fiber.
- **Visual Mapping**: Decisions are rendered as red octahedrons, Risks as yellow icosahedrons, and Facts as spherical nodes. Relationships are connected via white lines.
- **Real-Time Update**: Dispatches `memory-updated` events to force re-fetches when Supabase signals additions.

### D. `/python-cognee-service` (Memory Processor)
- **`main.py`**: Validates request parameters and schedules tasks.
- **`groq_client.py`**: Interacts with Groq (using Llama 3) to convert raw paragraphs into structured JSON schemas (summary, memory_type, importance, entities).
- **`cognee_client.py`**: Interfaces with Neo4j and Qdrant to construct node/edge relationships and vector search indexes.
- **`dedup.py`**: Runs an MD5 hash calculation on the paragraph text and validates it against stored hashes to ensure duplicate information is rejected at the entry point.
