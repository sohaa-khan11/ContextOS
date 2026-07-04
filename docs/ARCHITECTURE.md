# Architecture Specification: ContextOS

ContextOS is designed as a hybrid, multi-layered ambient intelligence platform that captures user decisions during AI-assisted programming and structures them into a queryable, persistent Knowledge Graph.

---

## 1. High-Level System Architecture

ContextOS operates with a client-server-orchestrator layout split across three primary physical runtimes:

1. **Client Space (Roamer)**: The Chrome extension running on user browser sessions (ChatGPT, Claude, etc.) captures text blocks and handles state injections.
2. **Dashboard Space (Visualizer)**: A Next.js 16 Web Application providing 3D spatial visualization and project settings.
3. **Orchestrator Backend (Synthesizer)**: A Python FastAPI microservice that processes raw text, deduplicates content, performs entity extraction using Groq LLM, and manages the graph logic inside Cognee.

```mermaid
graph TD
    %% Clients
    Ext[ContextOS Extension] -->|1. Capture & Handoff| API[Next.js API Layer]
    Dash[Next.js Dashboard] -->|2. Graph Queries & CRUD| API
    
    %% API Layer
    API -->|3. Route Proxy| FastAPI{FastAPI Microservice}
    API -->|4. Project Relational Metadata| DB[(Supabase PostgreSQL)]
    
    %% FastAPI Microservice Orchestration
    FastAPI -->|5. Structured Extraction| Groq[Groq LLM Service]
    FastAPI -->|6. Content Deduplication Check| DB
    FastAPI -->|7. Graph Ingestion & Retrieval| Cognee[Cognee Cloud Service]
    
    %% Cognee Infrastructure
    Cognee -->|8. Vector Embeddings| VDB[(Qdrant Vector DB)]
    Cognee -->|9. Graph Database| GDB[(Neo4j Graph DB)]
```

---

## 2. Component Directory & Responsibilities

### A. Chrome Extension (Capture Engine)
- **Role**: Ambient DOM listener.
- **Implementation**: Vanilla JS Content Script, Event-Driven Message passing.
- **Key Flow**: 
  - Tracks ChatGPT's submit button state.
  - Detects the transition from `generating` to `idle` (stream completion).
  - Isolates the latest assistant message, filters code blocks and diagrams, and dispatches the text block for parallel analysis.
  - Renders absolute-positioned overlay toolbars aligned with target paragraphs using parent relative positioning.

### B. Next.js API Gateway & Dashboard
- **Role**: API router, database manager, and 3D Visualizer.
- **Implementation**: Next.js App Router (TypeScript), Tailwind CSS, Three.js (React Three Fiber).
- **Key Flow**: 
  - Stores project settings, tokens, and active session configurations in Supabase.
  - Proxies analytical and capture queries to the Python FastAPI microservice.
  - Subscribes to database changes to broadcast real-time events to the 3D Graph panel.

### C. Python FastAPI Service (Orchestration Engine)
- **Role**: High-performance semantic handler.
- **Implementation**: Python 3.11, FastAPI, Pydantic v2.
- **Key Flow**:
  - Receives capture requests.
  - Generates MD5 content hashes of text blocks and validates them against the Supabase deduplication table.
  - Routes raw text to Groq LLM for entity and relationship extraction.
  - Feeds structured nodes and relationships into Cognee Cloud to form graph triplets.

---

## 3. Data Pipelines

### A. Memory Capture Pipeline
This pipeline describes the lifecycle of an ambient text capture when the AI assistant finishes generating a response.

```mermaid
sequenceDiagram
    participant Browser as Chrome Extension
    participant Next as Next.js API
    participant Py as FastAPI Backend
    participant Supa as Supabase DB
    participant Groq as Groq LLM
    participant Cog as Cognee Cloud

    Browser->>Browser: Detect streaming complete (Button idle)
    Browser->>Browser: Filter out code blocks & diagrams
    Browser->>Next: POST /api/extension/analyze (Text block)
    Next->>Py: POST /memory/analyze
    Py->Supa: Generate MD5 & check for duplicates
    Supa-->>Py: Returns duplicate status (False)
    Py->>Groq: Request Structured Memory Extraction
    Groq-->>Py: Returns memory_type, summary, reason
    Py-->>Next: Returns Analysis JSON
    Next-->>Browser: Display "Save to ContextOS" chip next to paragraph
    
    Note over Browser, Cog: User clicks SAVE
    
    Browser->>Next: POST /api/extension/capture
    Next->>Py: POST /memory/remember
    Py->Supa: Record MD5 hash (deduplication table)
    Py->>Cog: Ingest Memory (summary & type)
    Cog->>Cog: Generate Vector Embeddings & Graph Triplets
    Py-->>Next: Success Response
    Next-->>Browser: Update UI to "✓ SAVED" and fade out
    Next->Supa: Update memory counts in project metadata
    Next->>Browser: Send SSE update to reload Dashboard Graph
```

---

## 4. Recall and Handoff Pipeline
This pipeline describes how ContextOS retrieves project history from the Graph and structures it into a Continuation Prompt.

```mermaid
sequenceDiagram
    participant Browser as Chrome Extension
    participant Next as Next.js API
    participant Py as FastAPI Backend
    participant Cog as Cognee Cloud
    participant Groq as Groq LLM

    User->>Browser: Click "Continue Project" in popup
    Browser->>Next: GET /api/projects/[id]/recall
    Next->>Py: POST /memory/recall
    Py->>Cog: Perform Vector Search + Graph Traversal
    Cog-->>Py: Returns related Nodes, Edges, & Triplets
    Py->>Groq: Synthesize Context into Continuation Prompt
    Groq-->>Py: Returns structured Markdown Prompt
    Py-->>Next: Returns prompt content
    Next-->>Browser: Copy to clipboard & Inject into Target Prompt TextArea
    Browser-->>User: Visual feedback "Context Injected!"
```
