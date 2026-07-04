# API Reference Specification: ContextOS

ContextOS uses a Next.js API router as a gateway proxying requests to a Python FastAPI backend that interfaces with Cognee, Supabase, and Groq.

---

## 1. Extension Integration Endpoints

### A. Analyze Paragraph Context
* **Endpoint**: `POST /api/extension/analyze` (Proxies to Python `/memory/analyze`)
* **Purpose**: Evaluates a single paragraph captured by the content script to determine if it contains high-value memories (Decisions, Facts, Todo, Architecture) and whether it should be saved.
* **Request Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <Token>`
* **Request Body**:
  ```json
  {
    "project_id": "411e3257-0b86-47a6-8c75-02fbd92ac538",
    "text": "For this reason, FastAPI is generally preferred over Flask because async support is native."
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "is_duplicate": false,
      "duplicate_time": null,
      "analysis": {
        "importance_score": 80,
        "importance_level": "High",
        "memory_type": "Decision",
        "reason": "This details the engineering choice of FastAPI over Flask due to async support.",
        "summary": "FastAPI was chosen over Flask for native async programming support.",
        "entities": ["FastAPI", "Flask"],
        "should_save": true
      },
      "related_memories": []
    }
  }
  ```
* **Error Response (400 Bad Request / 500 Server Error)**:
  ```json
  {
    "success": false,
    "error": "Analysis failed"
  }
  ```

---

### B. Capture Stored Memory
* **Endpoint**: `POST /api/extension/capture` (Proxies to Python `/memory/remember`)
* **Purpose**: Persists a confirmed memory block (summary and metadata) to Cognee Cloud and updates the local deduplication hash index.
* **Request Body**:
  ```json
  {
    "project_id": "411e3257-0b86-47a6-8c75-02fbd92ac538",
    "text": "FastAPI was chosen over Flask for native async programming support.",
    "source": "chatgpt.com",
    "metadata": {
      "memory_type": "Decision",
      "importance_score": 80,
      "reason": "This details the engineering choice of FastAPI over Flask due to async support.",
      "captured_from": "https://chatgpt.com/c/chat-id-123",
      "raw_text": "For this reason, FastAPI is generally preferred over Flask because async support is native."
    }
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "success",
      "message": "Memory ingested into Cognee",
      "hash": "8f830e2f5db0964177264883afb918a2"
    }
  }
  ```

---

## 2. Project Management Endpoints

### A. List Projects
* **Endpoint**: `GET /api/projects`
* **Purpose**: Retrieves all projects registered in Supabase.
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "411e3257-0b86-47a6-8c75-02fbd92ac538",
      "name": "ContextOS Development",
      "description": "Building the ambient memory capture pipeline.",
      "created_at": "2026-07-03T10:00:00Z"
    }
  ]
  ```

### B. Create Project
* **Endpoint**: `POST /api/projects`
* **Purpose**: Registers a new isolated project namespace in Supabase.
* **Request Body**:
  ```json
  {
    "name": "CareerForge Pulse",
    "description": "Deploying the backend closest to users."
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "id": "7a26fcd9-e2b2-4d2c-96b6-d54e4c9f1311",
    "name": "CareerForge Pulse",
    "description": "Deploying the backend closest to users."
  }
  ```

---

## 3. Memory Pipeline Action Endpoints

### A. Get 3D Spatial Graph Data
* **Endpoint**: `GET /api/projects/[id]/graph`
* **Purpose**: Retrieves nodes and edges of the project's knowledge graph to render in the Three.js spatial visualizer.
* **Success Response (200 OK)**:
  ```json
  {
    "nodes": [
      { "id": "fastapi", "label": "FastAPI", "type": "concept" },
      { "id": "flask", "label": "Flask", "type": "concept" },
      { "id": "decision-1", "label": "Use FastAPI over Flask", "type": "decision" }
    ],
    "edges": [
      { "source": "decision-1", "target": "fastapi", "relation": "CHOOSES" },
      { "source": "decision-1", "target": "flask", "relation": "REPLACES" }
    ]
  }
  ```

---

### B. Recall Project Context (Handoff)
* **Endpoint**: `POST /api/projects/[id]/recall` (Proxies to Python `/memory/recall`)
* **Purpose**: Queries Cognee Cloud for the project graph state, synthesizes facts with Groq, and generates a formatted continuation prompt markdown payload.
* **Request Body**:
  ```json
  {
    "query": "What was our decision regarding backend deployment?"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "prompt": "# Project State: ContextOS\n\n## Decisions\n- We deployed on Render to enable automated CD from GitHub and managed Docker deployments.\n\n## Tasks\n- Configure multi-region failover."
  }
  ```

---

### C. Improve Graph (Background Pass)
* **Endpoint**: `POST /api/projects/[id]/improve` (Proxies to Python `/memory/improve`)
* **Purpose**: Triggers a Cognee optimization loop (vector-graph clustering and node deduplication) to normalize the dataset and clear redundant relations.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Cognee graph relationships optimized successfully."
  }
  ```

---

### D. Forget Project (Wipe Graph)
* **Endpoint**: `POST /api/projects/[id]/forget` (Proxies to Python `/memory/forget`)
* **Purpose**: Instructs Cognee to completely erase the project's dataset/graph index, and purges all relational files in Supabase.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "All project data completely forgotten."
  }
  ```
