# ContextOS — Cognee Backend Architecture
**Complete Integration Design, grounded in verified Cognee 1.0 documentation**
Prepared: July 2026 | Role: Senior AI Infrastructure Engineer, Cognee

> **Document purpose:** this supersedes Cognee-specific assumptions in the PRD wherever official documentation says otherwise. Every recommendation below is traceable to `docs.cognee.ai`, the GitHub source, or the official blog. Nothing is assumed. Everything is verified.

---

## The one thing this document corrects before anything else

The PRD says: *"a separate FastAPI service [is] not needed unless Day-1 verification proves it's strictly necessary."*

Day-1 verification says: **it is strictly necessary.**

The Cognee Python SDK is the correct integration path for ContextOS. The connection to Cognee Cloud goes through `cognee.serve(url, api_key)`, and the critical feature that makes the flagship demo moment work — the `graph_model` parameter that constrains Cognee's entity extraction to the ContextOS schema — is available in the Python SDK and is not guaranteed to be exposable through a generic REST call to Cognee Cloud's HTTP API. Every other feature in the PRD also maps cleanly to the Python SDK.

The practical consequence: add a minimal Python FastAPI service alongside Next.js. It does not replace Next.js; it sits behind Next.js Route Handlers as a thin Python layer that speaks to Cognee. It is small — four route groups, one file of Cognee wrapper code. The deployment cost is one additional process on a cheap VM or Railway/Render free-tier Python slot. This is a one-hour addition that buys correct, documented behavior on every Cognee call.

---

## 1. Platform Recommendation

**Use Cognee Cloud. Do not use self-hosted OSS.**

Reasons, in order of weight:

1. **This project is entered in the Cognee Cloud track.** The judging rubric explicitly rewards "Best Use of Cognee" and the Cloud track has its own prize. Using OSS while claiming the Cloud prize is a disqualification risk.

2. **Zero devops.** The graph database, vector store, relational store, and pipeline infrastructure are fully managed. You get none of the Day-1 SQLite/LanceDB/Kuzu configuration overhead.

3. **The connection model is trivial.** One line in Python: `await cognee.serve(url="https://your-tenant.aws.cognee.ai", api_key="...")`. After that, every `remember/recall/improve/forget` call routes to the cloud tenant with no other change to the code.

4. **The same Python SDK API surface applies.** There is no Cloud-specific API to learn. The Python SDK documentation is the documentation for the Cloud integration too — only `cognee.serve()` is added.

**Hybrid (Cloud + OSS fallback):** not recommended for a 7-day solo build. Adds configuration branching with no demo benefit.

---

## 2. Complete Architecture

### System topology

```
Chrome Extension (Manifest V3)
        │
        │  POST /api/extension/capture
        │  Authorization: Bearer <ext_token>
        ▼
Next.js App (Vercel)
  Route Handlers (/api/**)
        │
        ├── GET/POST (metadata ops) ──────────────► Postgres (Supabase/Neon)
        │                                            projects, users, ext_tokens
        │
        └── POST (memory ops) ────────────────────► Python Cognee Service
                                                      (Railway/Render, FastAPI)
                                                            │
                                        ┌───────────────────┼───────────────┐
                                        ▼                   ▼               ▼
                                   Gemini API          Cognee Cloud     Cognee Cloud
                               (extraction,          remember()         recall()
                             continuation           improve()           forget()
                               prompts)
                                                            │
                                                      Knowledge Graph
                                                  (per-project dataset,
                                                   fully managed in Cloud)
```

### Request path for a capture

```
User selects text in ChatGPT tab
          │
          ▼
Extension popup → POST /api/extension/capture {text, project_id, source}
          │
          ▼
Next.js Route Handler
  → validates extension token against Postgres
  → POST http://python-service/memory/remember {text, project_id, source}
          │
          ▼
Python Cognee Service
  1. Gemini extraction: raw text → typed memory units JSON
  2. Deduplicate by content hash (skip if already stored)
  3. Convert each unit to a templated natural-language statement
  4. cognee.remember(
       data=statement,
       dataset_name=f"ctxos_{project_id}",
       graph_model=ContextOSGraph,   ← custom schema, see §8
       self_improvement=True
     )
  5. Returns {remembered: n, summary: "2 decisions, 1 risk"}
          │
          ▼
Next.js → response to extension → lifecycle toast fires
```

---

## 3. Feature → Cognee Operation Mapping

### 3.1 Project creation
- **Cognee operation:** no direct Cognee call at creation time. The dataset is created implicitly on the first `remember()` call for that project. Do not pre-create datasets.
- **Why:** Cognee creates a dataset the first time data is written to a `dataset_name`. Pre-creating datasets that may never receive data wastes quota and creates orphaned state.
- **Postgres:** write the project row with `cognee_dataset_id = f"ctxos_{project_uuid}"`. This is the naming contract — use it consistently on every subsequent Cognee call for this project.

### 3.2 Capture (Chrome Extension or Dashboard paste) → `remember()`
```python
await cognee.remember(
    data=templated_statement,       # the natural-language memory unit
    dataset_name=f"ctxos_{project_id}",
    graph_model=ContextOSGraph,     # custom Pydantic schema (§8)
    self_improvement=True,          # run improve() in background automatically
    run_in_background=True,         # return immediately; don't block the HTTP response
)
```
- `self_improvement=True` means every `remember()` call triggers `improve()` automatically in the background. This is the default and is documented behavior in Cognee 1.0. You do NOT need a separate "Refresh Memory" button for the graph to enrich itself — it happens on every ingest.
- **Important implication for the demo:** the manual "Refresh Memory" button should call `improve()` explicitly AND visibly. The fact that `self_improvement=True` already does this in the background doesn't matter — the button exists to make the operation visible and auditable for the judges. Call `improve()` explicitly, name it in the toast.
- `run_in_background=True` returns a `RememberResult` immediately with `status='running'`. Poll `GET /api/v1/datasets/status?dataset=<dataset_id>` or the Python SDK `cognee.datasets.get_status()` until status is `DATASET_PROCESSING_COMPLETED` before claiming the memory is available to query. This resolves the async-`cognify()` question flagged in the master doc.

### 3.3 Dashboard summary, decisions, tasks, risks → `recall()`
```python
results = await cognee.recall(
    query_text="List all decisions with their rationale for this project",
    datasets=[f"ctxos_{project_id}"],
)
```
- `recall()` auto-routes to the best search strategy by default. For canned dashboard queries, auto-routing is fine.
- For the flagship **reasoning-chain query** ("Why did we choose FastAPI?"), override the search type explicitly:
```python
results = await cognee.recall(
    query_text="Why did we choose FastAPI?",
    datasets=[f"ctxos_{project_id}"],
    query_type="GRAPH_COMPLETION",
)
```
- `GRAPH_COMPLETION` is documented as: uses vector search as a hint to find relevant graph triplets, then traverses the graph to build structured context before LLM completion. This is precisely the multi-hop traversal that the demo narrates.

### 3.4 "Show graph path" visualization → `INSIGHTS` search type
This is a documented search type that **returns raw graph triples** in the form `(source_node, relationship, target_node)`. Use it specifically to render the visual path in the Ask tab:
```python
from cognee import SearchType
path_results = await cognee.recall(
    query_text="FastAPI decision rationale alternatives",
    datasets=[f"ctxos_{project_id}"],
    query_type="INSIGHTS",   # returns (Decision) -[HAS_RATIONALE]-> (Fact) triples
)
# path_results: list of [source_dict, edge_dict, target_dict]
# render these as the highlighted node chain in the UI
```
Run both in sequence: `GRAPH_COMPLETION` for the answer text, `INSIGHTS` for the path visualization. Two calls, one user action.

### 3.5 "Refresh Memory" → `improve()`
```python
await cognee.improve(
    dataset_name=f"ctxos_{project_id}",
)
```
- Documented behavior: re-enriches the graph with feedback-based weighting and adds derived retrieval structures. On a dataset that just received new content via `remember()`, this deepens the relationships and can improve the quality of subsequent `GRAPH_COMPLETION` queries.
- The demo sequence that makes this **reliable**: `remember(new_info)` → wait for completion → `improve()` → `recall(same_question)` → richer answer. This is the honest version that works because real content was added. Do not call `improve()` on a dataset with no new content and expect a different answer — the graph has nothing new to enrich.

### 3.6 "Archive" / `forget()`
```python
# Archive a single item by its Cognee data ID
await cognee.forget(
    dataset_name=f"ctxos_{project_id}",
    data_id=memory_unit_node_id,
)

# Nuke an entire project (delete project action)
await cognee.forget(
    dataset=f"ctxos_{project_id}",
)
```
- **Critical warning from the docs:** `forget(dataset=...)` only removes DataPoints that were added with a `PipelineContext` carrying the dataset association. DataPoints added via `add_data_points()` standalone (without `PipelineContext`) are inserted globally and will NOT be removed by `forget(dataset=...)`. Since ContextOS uses `remember()` (which internally uses the full pipeline and properly sets dataset context), this is not a problem — but do not mix `add_data_points()` standalone calls with dataset-scoped `forget()`.
- The `data_id` for a specific node can be retrieved from recall results or from `cognee.datasets.list_data(dataset_id=...)`.

### 3.7 Continuation prompt → `recall()` + Gemini
```python
# recall() to get the current project state
summary = await cognee.recall("current project summary goals decisions risks tasks", datasets=[f"ctxos_{project_id}"])
# feed to Gemini continuation-prompt generator (§7)
```

### 3.8 "What changed this week" → `recall()` with temporal filter
```python
results = await cognee.recall(
    query_text="decisions and changes from the last 7 days",
    datasets=[f"ctxos_{project_id}"],
    query_type="GRAPH_COMPLETION",
)
```
Cognee does support temporal graph modes (`temporal_cognify=True` and `TEMPORAL` search type), but those require lower-level `cognify()` calls and may be overkill. For a 7-day build, rely on `GRAPH_COMPLETION` with a natural-language temporal question and let the graph + LLM handle it. The `Decision -SUPERSEDES-> Decision` edges in the schema (§8) will naturally surface recency-based answers.

---

## 4. Dataset Design

**Rule: one Cognee dataset per ContextOS project.**

```
ContextOS project "hackathon-build"  →  Cognee dataset: "ctxos_{proj_uuid}"
ContextOS project "client-alpha"     →  Cognee dataset: "ctxos_{proj_uuid_2}"
```

**Why this is correct:**
- Dataset isolation in Cognee is the documented mechanism for preventing `recall()` cross-contamination between unrelated projects. A `recall()` scoped to `datasets=[f"ctxos_{project_id}"]` only touches that project's graph.
- `forget(dataset=...)` deletes the entire project's memory in one call — perfect for "Delete this project" functionality.
- Dataset-level permissions are enforced in Cognee Cloud (read/write/share/forget). This lines up with future multi-user expansion.

**Naming convention:** `ctxos_{project_uuid}` — human-readable enough for debugging Cognee Cloud's dashboard, unique enough to avoid collisions.

**Dataset creation:** implicit on first `remember()` call. The `dataset_name` parameter creates the dataset if it doesn't exist. No pre-creation API call needed.

**Dataset deletion:** call `cognee.forget(dataset=f"ctxos_{project_id}")` when a user deletes a project. Also delete the Postgres project row in the same transaction.

**What stays in Postgres, what stays in Cognee:**

| Data | Where | Why |
|---|---|---|
| Project name, status, timestamps | Postgres | App metadata — not knowledge |
| User accounts, extension tokens | Postgres | Auth — not knowledge |
| `cognee_dataset_id` | Postgres | The pointer into Cognee |
| Decisions, tasks, risks, facts, goals | Cognee only | Knowledge — source of truth |
| Rationale, relationships, graph edges | Cognee only | Graph structure |
| Open question answers, summaries | Cognee only | Derived from the graph |

**Never mirror decisions/tasks/risks into Postgres.** This was stated in the PRD and is correct. Once you duplicate graph data into a relational store, you have two sources of truth and guaranteed drift.

---

## 5. Search Type Design

| ContextOS Feature | Search Type | Why |
|---|---|---|
| Reasoning-chain Q&A ("Why did we choose X?") | `GRAPH_COMPLETION` | Graph traversal + LLM completion; the only type that follows Decision → Rationale → Alternative chains |
| Graph path visualization for the Ask tab | `INSIGHTS` | Returns raw triples (source, edge, target); use the output to render the node chain in the UI |
| Project summary | `GRAPH_COMPLETION` (auto-routed via `recall()`) | Natural-language summary benefits from graph context |
| Decisions list | `SUMMARIES` or `GRAPH_COMPLETION` | Both work; `SUMMARIES` is faster for canned list views |
| Tasks list | `GRAPH_COMPLETION` with explicit "list open tasks" query | Tasks have `DEPENDS_ON` relationships that benefit from traversal |
| Risks list | `GRAPH_COMPLETION` | Risks have `AFFECTS` edges to decisions/tasks |
| Memory Viewer (all raw units) | `CHUNKS` | Returns raw stored content without LLM overhead; fastest for a browsable list |
| Continuation prompt generation | `GRAPH_COMPLETION` for context, then Gemini for formatting | Cognee provides the structured context; Gemini formats the human-readable prompt |
| "What changed this week" | `GRAPH_COMPLETION` with temporal natural-language question | |

**Rule of thumb:** use `GRAPH_COMPLETION` for anything that involves *reasoning* or *connections*. Use `CHUNKS` for anything that's *browsing* raw stored content. Use `INSIGHTS` specifically to render graph paths visually.

---

## 6. Memory Flow — Complete Ingestion Pipeline

```
1. Raw text arrives (extension capture or dashboard paste)
           │
           ▼
2. Dedup check
   → hash the raw text
   → query Postgres: has this hash been captured for this project before?
   → if yes: return {skipped: true, reason: "already captured"}
   → if no: proceed, store hash in Postgres capture_hashes table
           │
           ▼
3. Gemini Extraction (extraction prompt, see §7)
   → input: raw text
   → output: JSON array of typed memory units
     [
       {
         "type": "Decision",
         "content": "Chose FastAPI for the backend",
         "rationale": "Async support and fast prototyping speed",
         "considered_alternatives": ["Flask", "Django"],
         "relates_to": ["Python", "REST API"],
         "status": "active",
         "source": "ChatGPT"
       },
       {
         "type": "Risk",
         "content": "Cognee Cloud latency may stall the live demo",
         "status": "active"
       }
     ]
           │
           ▼
4. Templated Statement Generation
   → convert each unit to natural language that biases Cognee's own
     entity/relationship extraction toward the ContextOS schema
   
   Decision template:
   "DECISION: {content}. RATIONALE: {rationale}. CONSIDERED AND REJECTED: {alternatives}. 
    RELATES TO: {relates_to}. STATUS: {status}. SOURCE: {source}."
   
   Task template:
   "TASK: {content}. STATUS: {status}. SOURCE: {source}."
   
   Risk template:
   "RISK: {content}. STATUS: {status}. SOURCE: {source}."
           │
           ▼
5. remember() call per unit
   await cognee.remember(
     data=templated_statement,
     dataset_name=f"ctxos_{project_id}",
     graph_model=ContextOSGraph,      ← constrains LLM extraction to our schema
     self_improvement=True,           ← improves graph in background
     run_in_background=True,          ← non-blocking
   )
           │
           ▼
6. Cognee internal pipeline (runs in Cognee Cloud, not your code)
   add() → cognify() → improve()
   
   cognify() stages:
   a. Classify document
   b. Check dataset permissions
   c. Extract chunks from templated statement
   d. LLM entity+relationship extraction using ContextOSGraph schema
      → finds "FastAPI" (Technology), "async support" (Fact)
      → creates Decision -HAS_RATIONALE-> Fact edges
      → creates Decision -CONSIDERED_ALT-> Technology(Flask) edges
   e. Generate summaries
   f. Embed all nodes and summaries
   g. Write graph nodes+edges to Cognee Cloud graph store
   h. Write embeddings to Cognee Cloud vector store
   
   improve() stages (background):
   a. Prune stale or weakly-connected nodes
   b. Strengthen frequently-recalled edges
   c. Add derived retrieval structures
           │
           ▼
7. Poll dataset status
   GET /api/v1/datasets/status?dataset=ctxos_{project_id}
   Wait for: DATASET_PROCESSING_COMPLETED
           │
           ▼
8. Return to Next.js → lifecycle toast fires
   "remember(): 1 decision, 1 risk added"
           │
           ▼
9. Dashboard recall queries run against the now-updated dataset
```

---

## 7. Gemini Integration

Gemini has one job in ContextOS: **LLM work that is external to Cognee's pipeline**. It is not inside Cognee. It pre-processes input before Cognee sees it, and post-processes Cognee output into user-facing text.

**Cognee uses its own internal LLM** (configurable, defaults to OpenAI-compatible) for entity extraction during `cognify()`. You do not need to pass Gemini into Cognee — Cognee's own LLM handles graph construction. Gemini handles everything on your side of the pipeline.

### Where Gemini goes

```
[1] Before remember():       Raw text → Gemini extraction → typed units
[2] Before/after recall():   recall() output → Gemini → continuation prompt
[3] On demand:               recall() output → Gemini → project summary prose
```

### What Gemini does NOT do
- Entity extraction inside Cognee's pipeline (Cognee's own LLM does this)
- Graph traversal or relationship reasoning (Cognee does this)
- Answering the "Why did we choose FastAPI" question directly (Cognee does this via `GRAPH_COMPLETION`)

### Gemini prompts

**Extraction prompt** (called before every `remember()`):
```
SYSTEM:
You are a project-memory extraction engine. Given raw conversation text,
extract every discrete piece of project knowledge as a JSON array of typed
memory units.

Output ONLY a valid JSON array. No markdown, no prose, no code fences.

For each unit, output this shape:
{
  "type": "Decision" | "Task" | "Risk" | "Goal" | "OpenQuestion" | "Fact",
  "content": string,
  "rationale": string | null,                   // Decision only
  "considered_alternatives": string[] | null,    // Decision only
  "relates_to": string[],
  "status": "active" | "resolved" | "blocked"
}

Rules:
- For Decisions: ALWAYS try to extract rationale even if implied, not stated.
  Infer from context. Do not leave rationale null if the reasoning is present.
- ALWAYS capture alternatives that were mentioned and rejected.
- If a unit is ambiguous between types, prefer the more specific type.

USER:
{{raw_text}}
```

**Malformed JSON recovery prompt** (called only on parse failure):
```
The following was not valid JSON. Return only the corrected JSON array.
Do not add explanation. Output ONLY the array.

{{malformed_output}}
```

**Continuation prompt generator** (called after recall()):
```
SYSTEM:
Write a single context-handoff block the user can paste verbatim into a new
AI chat to resume this project. Be structured, not conversational. Cover
project goal, key decisions with their reasoning, open tasks, and open risks.

Use this format exactly:

"I'm continuing a project called {{name}}.

GOAL: {{summary}}

KEY DECISIONS (with reasoning):
- {{decision}} — because {{rationale}}

OPEN TASKS:
- {{task}}

OPEN RISKS:
- {{risk}}

Please continue from here."

USER:
Project data: {{recall_output}}
Optional filter: {{since_source}} (only include items where source = this value)
```

**Project summary prose** (called from project detail page header):
```
SYSTEM:
Write a 2-sentence summary of this project's current state.
Base it only on the provided data. Do not invent anything not present.
Output plain text only.

USER:
{{recall_output}}
```

---

## 8. The Custom Graph Model (the single most important technical decision)

The `graph_model` parameter on `remember()` (which passes through to `cognify()`) constrains what entity types and relationships Cognee's own LLM extracts from your text. Without it, Cognee uses its default `KnowledgeGraph` schema and may extract generic entities like "FastAPI" → "is a" → "framework" instead of "Decision: chose FastAPI" → "HAS_RATIONALE" → "Fact: async support needed."

**This is what makes the flagship reasoning-chain query work reliably.** Do not skip this.

### ContextOSGraph definition (Python, in `cognee_service/schemas.py`)

```python
from typing import Any, List, Optional
from pydantic import SkipValidation
from cognee.infrastructure.engine import DataPoint
from cognee.infrastructure.engine.models.Edge import Edge

class Technology(DataPoint):
    name: str
    metadata: dict = {"index_fields": ["name"]}

class Fact(DataPoint):
    content: str
    metadata: dict = {"index_fields": ["content"]}

class Decision(DataPoint):
    content: str
    rationale: Optional[str] = None
    status: str = "active"
    source: Optional[str] = None
    has_rationale: SkipValidation[Any] = None   # → Fact node
    considered_alt: SkipValidation[Any] = None  # → Technology node(s)
    relates_to: SkipValidation[Any] = None      # → Technology node(s)
    supersedes: SkipValidation[Any] = None      # → Decision (for "what changed")
    metadata: dict = {"index_fields": ["content", "rationale"]}

class Task(DataPoint):
    content: str
    status: str = "active"
    source: Optional[str] = None
    depends_on: SkipValidation[Any] = None      # → Task
    metadata: dict = {"index_fields": ["content"]}

class Risk(DataPoint):
    content: str
    status: str = "active"
    source: Optional[str] = None
    affects: SkipValidation[Any] = None         # → Decision | Task
    metadata: dict = {"index_fields": ["content"]}

class Goal(DataPoint):
    content: str
    status: str = "active"
    metadata: dict = {"index_fields": ["content"]}

class OpenQuestion(DataPoint):
    content: str
    metadata: dict = {"index_fields": ["content"]}

class ContextOSGraph(DataPoint):
    """
    The top-level graph model. Cognee uses this as the schema
    for LLM entity/relationship extraction during cognify().
    """
    decisions: SkipValidation[Any] = None
    tasks: SkipValidation[Any] = None
    risks: SkipValidation[Any] = None
    goals: SkipValidation[Any] = None
    open_questions: SkipValidation[Any] = None
    facts: SkipValidation[Any] = None
    metadata: dict = {"index_fields": ["decisions", "tasks", "risks"]}
```

**Key edge names** (field names become relationship labels in Cognee's graph):
- `has_rationale` → `Decision -HAS_RATIONALE-> Fact`
- `considered_alt` → `Decision -CONSIDERED_ALT-> Technology`
- `relates_to` → `Decision -RELATES_TO-> Technology`
- `supersedes` → `Decision -SUPERSEDES-> Decision`
- `depends_on` → `Task -DEPENDS_ON-> Task`
- `affects` → `Risk -AFFECTS-> Decision | Task`

**Usage in remember():**
```python
await cognee.remember(
    data=templated_statement,
    dataset_name=f"ctxos_{project_id}",
    graph_model=ContextOSGraph,
    self_improvement=True,
    run_in_background=True,
)
```

---

## 9. Backend APIs

### 9.1 Python Cognee Service (FastAPI, internal)

This service is NOT public-facing. Next.js calls it on a private network. It wraps Cognee and Gemini. No auth beyond a shared internal secret between Next.js and the Python service.

```
python-cognee-service/
├── main.py                 # FastAPI app
├── cognee_client.py        # cognee.serve() initialization + lifecycle wrappers
├── gemini_client.py        # extraction + summary + continuation prompt prompts
├── schemas.py              # ContextOSGraph DataPoint definitions
├── memory_units.py         # MemoryUnit pydantic model (input)
├── dedup.py                # content-hash check
└── requirements.txt
```

**Routes:**

```
POST /memory/remember
  Body: { project_id, raw_text, source? }
  Calls: Gemini extraction → dedup check → cognee.remember() per unit
  Returns: { remembered: int, skipped: int, summary: str }

POST /memory/recall
  Body: { project_id, question, query_type? }
  Calls: cognee.recall(query_text, datasets=[f"ctxos_{project_id}"], query_type)
  Returns: { answer: str, path?: list[triple] }   # path only for INSIGHTS calls

POST /memory/recall/canned
  Body: { project_id, type: "summary"|"decisions"|"tasks"|"risks" }
  Calls: cognee.recall() with appropriate canned query + GRAPH_COMPLETION
  Returns: { items: list }

POST /memory/improve
  Body: { project_id }
  Calls: cognee.improve(dataset_name=f"ctxos_{project_id}")
  Returns: { improved: bool }

POST /memory/forget
  Body: { project_id, node_id?: str, wipe_project?: bool }
  Calls: cognee.forget(dataset_name=...) or cognee.forget(dataset=..., data_id=...)
  Returns: { forgotten: bool }

GET  /memory/status/{project_id}
  Calls: cognee.datasets.get_status([dataset_id])
  Returns: { status: "DATASET_PROCESSING_COMPLETED" | "DATASET_PROCESSING_STARTED" | ... }

POST /memory/continuation-prompt
  Body: { project_id, since_source?: str }
  Calls: cognee.recall() for context → Gemini continuation prompt generator
  Returns: { prompt: str }
```

### 9.2 Next.js Route Handlers (public-facing)

These validate auth, call Postgres for metadata, and proxy memory operations to the Python service.

```
POST /api/projects
  Postgres: INSERT project row with cognee_dataset_id=ctxos_{uuid}
  Returns: { id, name, cognee_dataset_id }

GET  /api/projects
  Postgres: SELECT projects WHERE user_id = session_user
  Returns: [{id, name, status, last_activity_at, open_task_count, open_risk_count}]
  Note: counts are cached; they update when remember() completes, not on every render

GET  /api/projects/:id
  Postgres: SELECT project
  Python service: POST /memory/recall/canned {type: "summary"/"decisions"/"tasks"/"risks"}
  Returns: { project, summary, decisions, tasks, risks }

POST /api/projects/:id/remember
  Validates session, proxies to Python service POST /memory/remember
  Returns: { remembered, skipped, summary }

POST /api/projects/:id/recall
  Proxies to Python service POST /memory/recall
  Returns: { answer, path? }

POST /api/projects/:id/improve
  Proxies to Python service POST /memory/improve
  Returns: { improved }

POST /api/projects/:id/forget
  Proxies to Python service POST /memory/forget
  On wipe_project=true: also DELETE Postgres project row
  Returns: { forgotten }

POST /api/projects/:id/continuation-prompt
  Proxies to Python service POST /memory/continuation-prompt
  Returns: { prompt }

GET  /api/projects/:id/status
  Proxies to Python service GET /memory/status/{project_id}
  Returns: { status }

POST /api/extension/auth
  Validates pairing token, issues short-lived JWT
  Returns: { session_token, expires_at }

POST /api/extension/capture
  Validates JWT, proxies to Python service POST /memory/remember
  Returns: { remembered, skipped, summary }
```

---

## 10. Chrome Extension → Backend Communication

1. **Pairing (once):** user copies a token from Settings page, pastes into extension popup → extension POSTs to `/api/extension/auth` → receives a session JWT → stored in `chrome.storage.local`.
2. **Capture:** user selects text, clicks "Capture" → popup reads `window.getSelection()` via content script message → POSTs `{text, project_id, source}` to `/api/extension/capture` with `Authorization: Bearer {jwt}` → Next.js validates JWT → proxies to Python service → toast returns.
3. **Continuation prompt:** user clicks "Copy Continuation Prompt" → popup POSTs `{project_id, since_source?}` to `/api/projects/:id/continuation-prompt` → response.prompt is written to clipboard via `navigator.clipboard.writeText()`.
4. **No DOM injection, no MUI scraping.** The extension reads `window.getSelection()` only — a standard browser API available everywhere, with no platform-specific logic.

---

## 11. Database Design

### Postgres (app metadata only)

```sql
-- Users
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  status            TEXT DEFAULT 'active',
  cognee_dataset_id TEXT NOT NULL,           -- "ctxos_{id}" — the Cognee dataset name
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  last_activity_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_activity ON projects(last_activity_at DESC);

-- Extension tokens
CREATE TABLE extension_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_ext_tokens_token ON extension_tokens(token);

-- Content dedup (capture hashing)
CREATE TABLE capture_hashes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  hash       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, hash)
);
CREATE INDEX idx_capture_hashes ON capture_hashes(project_id, hash);
```

**What never goes in Postgres:** decisions, tasks, risks, goals, open questions, facts, rationale, relationships, graph edges, summaries. These are Cognee's job. Full stop.

---

## 12. Folder Structure

```
contextos/
├── nextjs-app/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (dashboard)/page.tsx
│   │   ├── (dashboard)/projects/[id]/page.tsx
│   │   ├── (dashboard)/settings/page.tsx
│   │   └── api/
│   │       ├── projects/route.ts
│   │       ├── projects/[id]/route.ts
│   │       ├── projects/[id]/remember/route.ts
│   │       ├── projects/[id]/recall/route.ts
│   │       ├── projects/[id]/improve/route.ts
│   │       ├── projects/[id]/forget/route.ts
│   │       ├── projects/[id]/status/route.ts
│   │       ├── projects/[id]/continuation-prompt/route.ts
│   │       └── extension/{auth,capture}/route.ts
│   ├── components/
│   │   ├── ProjectCard.tsx
│   │   ├── MemoryUnitList.tsx
│   │   ├── ReasoningChainBox.tsx
│   │   ├── GraphPathViewer.tsx       # renders INSIGHTS triples as a node chain
│   │   ├── LifecycleLog.tsx          # corner toast log — names every cognee call
│   │   ├── GraphEmbed.tsx            # embeds Cognee native graph view
│   │   └── CaptureForm.tsx
│   ├── lib/
│   │   ├── cognee-proxy.ts           # wraps all calls to python service
│   │   ├── db.ts
│   │   └── auth.ts
│   └── extension/
│       ├── manifest.json
│       ├── content-script.js
│       ├── background.js
│       └── popup/{popup.html, popup.js}
│
├── python-cognee-service/
│   ├── main.py                       # FastAPI app
│   ├── cognee_client.py              # cognee.serve() + remember/recall/improve/forget wrappers
│   ├── gemini_client.py              # extraction + continuation prompts
│   ├── schemas.py                    # ContextOSGraph DataPoint definitions
│   ├── memory_units.py               # MemoryUnit pydantic input model
│   ├── dedup.py                      # content hash check
│   └── requirements.txt
│
└── scripts/
    └── seed.ts                       # seeds demo data through the real /remember API path
```

---

## 13. Technical Risks & Common Cognee Integration Mistakes

### 13.1 Most common Cognee integration mistakes (from documentation and community)

**Mistake 1: Not using `graph_model`**
The biggest mistake is passing raw text to `remember()` without a custom schema and expecting Cognee to extract structured, typed relationships. Without `graph_model=ContextOSGraph`, Cognee extracts generic entities — and "Why did we choose FastAPI" returns a vague paragraph, not a traversable decision chain.
**Fix:** always pass `graph_model=ContextOSGraph` on every `remember()` call.

**Mistake 2: Calling `recall()` immediately after `remember()`**
`remember()` with `run_in_background=True` returns before indexing is complete. Newly ingested content is not yet queryable. Calling `recall()` on the same dataset immediately returns stale results.
**Fix:** poll `GET /memory/status/{project_id}` until `DATASET_PROCESSING_COMPLETED`. In the demo script, the buffer between the capture beat (1:20–1:45) and the next recall beat (1:45–2:10) must be real wall-clock seconds, not just the next line of code.

**Mistake 3: Using `add_data_points()` standalone and then expecting `forget(dataset=...)` to clean up**
Documented explicitly: nodes added via `add_data_points()` without `PipelineContext` are not associated with a dataset and will not be removed by `forget(dataset=...)`.
**Fix:** use `remember()` for all ingestion (it sets context correctly). If you ever use `add_data_points()` directly, pass `PipelineContext`.

**Mistake 4: Not scoping `recall()` to a dataset**
Calling `cognee.recall()` without specifying `datasets=[f"ctxos_{project_id}"]` queries across ALL datasets. In a multi-project scenario, this will return decisions from other projects.
**Fix:** always pass `datasets=[f"ctxos_{project_id}"]`.

**Mistake 5: Calling `improve()` on a dataset with no new content and expecting enrichment**
`improve()` enriches based on what's in the graph. If nothing new has been added since the last `improve()` pass (which `self_improvement=True` already ran), calling it again adds noise but not value.
**Fix:** the demo sequence is always: `remember(new_content)` → `improve()` → `recall()`. Never `improve()` → `recall()` with nothing new added.

**Mistake 6: Assuming Gemini handles entity extraction inside Cognee**
Cognee uses its own configured LLM (not your Gemini client) for `cognify()`. Your Gemini client pre-processes text before it goes to Cognee, and post-processes Cognee output into user-facing text. These are separate jobs.

### 13.2 Demo-specific risks

| Risk | Mitigation |
|---|---|
| `remember()` background processing not complete when `recall()` fires | Poll `/memory/status` before enabling any recall action on the captured dataset |
| `GRAPH_COMPLETION` call takes 10+ seconds | Show a real loading indicator with elapsed-time text; pre-warm on demo dataset; backup video |
| `graph_model` schema doesn't produce `HAS_RATIONALE` edges reliably | Test specifically against the "FastAPI decision" transcript on Day 2; iterate on the templated statement format until INSIGHTS returns the right triple |
| `improve()` shows no visible delta without new content | Stage the demo correctly: capture new snippet first, then improve, then re-ask |
| `forget()` node_id not known at archive time | Retrieve node_id from the recall result metadata and store it alongside the memory unit in the UI state; don't depend on a separate lookup at archive time |

---

## 14. Best Use of Cognee — Maximizing Judge Score

The hackathon rubric scores "Best Use of Cognee" explicitly. Here is how to maximize that score specifically:

**1. Use all four lifecycle operations, named on-screen every time.**
Every button that fires a Cognee call shows a toast naming the function: `remember()`, `recall()`, `improve()`, `forget()`. Do not let these be invisible backend calls. The lifecycle log component in the corner of Project Detail exists specifically for this.

**2. Use `graph_model` — this differentiates ContextOS from every project that just dumps raw text.**
Passing a custom `ContextOSGraph` schema to `remember()` shows you understand Cognee's graph architecture at a deep level. Judges who know Cognee well will recognize this. Judges who don't will still see typed, structured graph nodes in Cognee's native graph view — which looks dramatically better than a soup of generic "entity" nodes.

**3. Use `INSIGHTS` search type to render the reasoning-chain path.**
Most projects only use `GRAPH_COMPLETION` for text answers. Using `INSIGHTS` to get the raw triplets and rendering them as a visible node chain (Decision → Fact → Technology) is a concrete proof of graph reasoning that no other judge framing ("it uses a knowledge graph") can fake.

**4. Show `session_id` usage for the live-capture beat.**
When the user captures new text mid-demo, use `session_id` for the `remember()` call — this stores it immediately in session cache (fast) while the background pipeline builds the permanent graph. Then call `improve()` explicitly to bridge it into the graph. This demonstrates both session memory and permanent memory in sequence, showing you understand Cognee's two-tier architecture.

```python
# The capture beat: fast session storage first
await cognee.remember(
    data=captured_text,
    dataset_name=f"ctxos_{project_id}",
    session_id=f"demo_session_{project_id}",
    self_improvement=True,           # bridges to permanent graph in background
)
# Toast: "remember(): stored in session, bridging to graph..."
# After polling: "remember(): 2 facts, 1 decision indexed"
```

**5. Make `forget()` a "data ownership" narrative, not just a delete button.**
In the demo, when you archive a stale risk via `forget()`, say: "Users own their memory. Any item can be surgically removed from the graph." This answers the privacy question before judges ask it, and frames `forget()` as a product feature rather than a cleanup utility.

---

## 15. Implementation Roadmap

This is the correct order of implementation. Each step depends on the previous. No skipping.

```
Step 1 — Cognee Cloud account
  Create account at cognee.ai
  Get tenant URL and API key
  Store in .env: COGNEE_API_URL, COGNEE_API_KEY

Step 2 — Python Cognee Service skeleton
  pip install cognee fastapi uvicorn
  main.py: one route, no logic yet
  cognee_client.py: call cognee.serve(url, api_key)
  Smoke test: remember("hello world") → recall("hello") → confirm round-trip
  ↓ Do NOT proceed until this works

Step 3 — Lock and test the graph schema
  Write schemas.py with ContextOSGraph DataPoint
  Test: remember("DECISION: chose FastAPI. RATIONALE: async support. CONSIDERED AND REJECTED: Flask.", graph_model=ContextOSGraph)
  Then: recall("Why did we choose FastAPI?", query_type="GRAPH_COMPLETION")
  AND: recall("FastAPI decision rationale", query_type="INSIGHTS")
  Confirm INSIGHTS returns a triple with HAS_RATIONALE edge
  ↓ Do NOT proceed until the reasoning-chain query works reliably on 3 consecutive tries

Step 4 — Gemini extraction pipeline
  Write gemini_client.py with extraction prompt
  Test against the exact "FastAPI decision" demo transcript
  Confirm typed unit JSON is produced
  Wire: raw text → Gemini → templated statement → remember()
  Test end-to-end: paste a conversation chunk → recall("why FastAPI") → get the right answer
  ↓ Do NOT proceed until this works on real conversation text

Step 5 — All four lifecycle routes in Python service
  POST /memory/remember
  POST /memory/recall  (both GRAPH_COMPLETION and INSIGHTS modes)
  POST /memory/recall/canned
  POST /memory/improve
  POST /memory/forget
  GET  /memory/status
  POST /memory/continuation-prompt

Step 6 — Postgres schema + Next.js project API
  Supabase/Neon: run the 4-table SQL
  Next.js: /api/projects GET and POST
  Dashboard: project cards, create project modal, routing

Step 7 — Project Detail page — Overview and Ask tabs
  Wire GET /api/projects/:id → canned recall queries → decisions/tasks/risks lists
  Wire POST /api/projects/:id/recall → ReasoningChainBox
  Wire POST /api/projects/:id/remember → CaptureForm (dashboard paste)
  LifecycleLog component wired and visible

Step 8 — improve() and forget() UI
  "Refresh Memory" button → POST /api/projects/:id/improve → toast
  Before/after answer comparison in Ask tab
  Archive button in MemoryUnitList → POST /api/projects/:id/forget → list update
  Both named in LifecycleLog

Step 9 — Chrome Extension
  manifest.json + content-script.js (selection read only)
  popup.html/js: project picker, source tag, capture button, copy prompt button
  background.js: JWT auth, API calls
  Pairing flow wired to Settings page
  Test capture-to-dashboard end-to-end

Step 10 — Timeline + Graph tabs (P1)
  Timeline: recall with temporal question + render chronologically
  Graph: embed Cognee native graph view (iframe or web component from Cloud)

Step 11 — Demo data seeding
  scripts/seed.ts: POST to /api/projects/:id/remember with canned transcripts
  Run the seed THROUGH the real API path (exercises same code as live demo)
  Pre-warm dataset: seed → wait for DATASET_PROCESSING_COMPLETED → verify recall

Step 12 — Demo rehearsal + backup video
  Run the 3-minute script 3× live
  Record the entire script on a warm, seeded dataset
  Verify every lifecycle toast fires on time
  Verify the INSIGHTS path renders correctly

Step 13 — README + deploy + disclose
  README: lifecycle code snippets, architecture diagram, demo GIF, backup video link
  Vercel deploy (Next.js) + Railway/Render deploy (Python service)
  README AI-assistant disclosure (Claude Code usage)
  Submit
```
