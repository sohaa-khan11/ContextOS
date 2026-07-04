# Memory Pipeline Specification: ContextOS

ContextOS uses a hybrid RAG + Knowledge Graph strategy powered by Cognee Cloud, Supabase, and Groq to manage the lifecycle of project context.

---

## 1. The Core Lifecycle Stages

```
[ Ambient Capture ] 
       │ (DOM finish event, filter diagrams/code)
       ▼
[ Groq Analysis ] 
       │ (Evaluate should_save, memory_type, summary)
       ▼
[ Deduplication Check ]
       │ (MD5 hash match in Supabase)
       ▼
[ Ingestion & Vectorization ]
       │ (Cognee Cloud ingestion: Neo4j Triplets & Qdrant Vector)
       ▼
[ Real-Time Sync ]
       │ (Next.js SSE -> Three.js 3D graph updates)
       ▼
[ Recall / Handoff ]
       │ (Graph traversal -> Prompt synthesis -> Inject)
```

---

## 2. Phase Breakdown

### A. Capture (DOM Ingress)
- The Chrome Extension `content.js` monitors ChatGPT's DOM structure.
- When ChatGPT finishes generating a response (detected by the submit button transitioning from `generating` to `idle`), the script extracts the latest assistant text block.
- **Filters**: It removes code blocks (`<pre>`, `<code>`) and ASCII diagrams (using a character density heuristic checker for symbols like `│`, `↓`, `┌`, `└`, etc.) to prevent cluttering.
- The top 3 paragraphs of the response are sliced and analyzed in parallel.

### B. Analysis (Groq LLM)
- Text blocks are sent to Groq (`llama3-8b-8192`) with a strict JSON formatting schema.
- **Response properties**:
  - `importance_score` (0-100 rating)
  - `should_save` (boolean flag)
  - `memory_type` (Fact, Decision, Risk, TODO)
  - `summary` (concise one-sentence synthesis)
  - `reason` (why this memory was selected)
- If `should_save` is true, the UI renders the suggested toolbar directly below the paragraph.

### C. Deduplication (MD5 Hash Table)
- When the user clicks **SAVE**, the FastAPI backend generates an MD5 hash of the paragraph content.
- It queries the `deduplication_logs` table in Supabase.
- If a hash match is found, the save request is marked as a duplicate and ignored to prevent duplicate nodes and cluttering of the Neo4j graph database.

### D. Ingestion (Cognee Cloud)
- Cognee Cloud parses the memory summary.
- **Vector Indexing (Qdrant)**: Embeds the text block to enable semantic context retrieval.
- **Graph Indexing (Neo4j)**: Identifies entities and builds semantic triplets (e.g. `[FastAPI] -> (CHOOSES) -> [Async]`).

### E. Graph Recall (Semantic Context Synthesis)
- When performing a handoff (Continue Project), ContextOS triggers a recall query.
- It runs a hybrid search:
  1. **Semantic search** across Qdrant vectors to find related memories.
  2. **Graph search** across Neo4j to pull structural dependencies (e.g., related tasks, architectural choices, and potential risks).
- Groq merges the retrieved graph data and builds a clean Markdown prompt that user can paste directly into any target AI tool.

### F. Deletion (Forget Pipeline)
- When a user deletes a memory or an entire project, a cascade wipe is triggered:
  - Cognee deletes the namespace and all associated vector and graph nodes.
  - Supabase purges duplicate hashes and metadata records, refreshing the 3D dashboard immediately.
