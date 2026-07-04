# Project Decisions & Justifications: ContextOS

This document details the architectural trade-offs, engineering decisions, and design choices made during the development of ContextOS. It serves as a reference for hackathon judges and technical reviews.

---

## 1. AI Memory Layer: Cognee vs. Vector RAG

### The Dilemma
Traditional retrieval-augmented generation (RAG) stores documents as independent chunks of text vectorized in databases like Pinecone. However, project contexts are deeply relational (e.g. an architectural decision is connected to a specific task, which has an associated risk). Simple semantic search fails to reconstruct these conceptual chains.

### The Decision
We chose **Cognee Cloud** to build a structured **Knowledge Graph** (using Neo4j and Qdrant).
- **Relational Context**: By linking entities (e.g. `[FastAPI] -> (REPLACES) -> [Flask]`), ContextOS traverses graph edges to pull the complete contextual chain of project decisions rather than simple float snippets.
- **Node Classification**: Cognee allows us to query specific node types (Decisions, Tasks, Risks) and structure them neatly inside continuation prompts.

---

## 2. API Orchestrator: FastAPI vs. Flask

### The Dilemma
We needed a backend service to parse text, compute MD5 deduplication hashes in Supabase, and interface with the Cognee Python SDK and Groq API. 

### The Decision
We chose **FastAPI** (Python 3.11) over Flask or a pure Next.js Node backend.
- **Asynchronous Execution**: Ingestion operations are highly network-bound (making simultaneous API calls to Groq, Supabase, and Cognee). FastAPI's native async event loop handles concurrent routing with extremely low latency, keeping the Chrome Extension save operations under 1 second.
- **Pydantic Validation**: Automatically parses JSON payloads and enforces strict data types, preventing corrupted data from entering the Neo4j graph.
- **Python Integration**: Cognee's ingestion engine is written natively in Python, making a Python microservice the most natural integration point.

---

## 3. Client Interface: Chrome Extension vs. Standalone Web App

### The Dilemma
If we built a standalone web chat app, we would force developers to abandon their preferred interfaces (ChatGPT, Claude, Cursor) and type prompts in our custom UI. This creates a high user friction barrier.

### The Decision
We chose to build a **Chrome Extension (Manifest V3)**.
- **Ambient Capture**: The extension works in the background, listening to ChatGPT response completion events and capturing context without developer intervention.
- **Direct DOM Injection**: By mounting our overlays directly below target paragraphs and injecting prompt contents directly into chat textareas, we minimize clicks and keep developers in their active flow.

---

## 4. Visual Dashboard: 3D Spatial Graph vs. Tabular Views

### The Dilemma
A tabular data list does not convey the complexity or density of a project's history. Developers cannot visually identify connected decisions or isolated tasks in a simple table.

### The Decision
We built a **Three.js (React Three Fiber) 3D Spatial Visualizer**.
- **Cluster Recognition**: Nodes cluster dynamically based on their edges, allowing developers to visually spot highly dense areas of decisions or tasks.
- **Immersive Conceptual Mapping**: Different shapes (octahedrons for decisions, icosahedrons for risks) give immediate visual cues to project components, which synced via Server-Sent Events (SSE) from database triggers.
