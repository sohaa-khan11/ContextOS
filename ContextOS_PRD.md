# ContextOS — Product Requirements Document
**A Memory Operating System for AI Projects**
Built for: Cognee "The Hangover Part AI: Where's My Context?" Hackathon (Cognee Cloud Track)
Author: Solo developer | Timeline: 7 days | Version: 1.0

> **Note on scope philosophy:** every section below is written to be buildable solo in 7 days while maximizing the hackathon's six judged axes (Potential Impact, Creativity & Innovation, Technical Excellence, Best Use of Cognee, User Experience, Presentation Quality). Where the original concept conflicts with that goal, it has been cut or rewritten, and the reasoning is stated explicitly — not buried.

---

## 1. Executive Summary

ContextOS is a memory operating system for AI-assisted projects. It captures the facts, decisions, tasks, risks, and reasoning that accumulate across long-running AI conversations, structures them into a Cognee-powered knowledge graph, and lets users retrieve and continue that context anywhere — in a dashboard, or in a brand-new chat on any AI platform.

The product has two parts:
1. A **Chrome Extension** for lightweight, manual capture of conversation context from whatever AI tool the user is currently in.
2. A **Dashboard** that is the project's memory brain — where that captured context becomes a queryable, structured, living graph.

Cognee's four lifecycle operations (`remember`, `recall`, `improve`/`memify`, `forget`) are not background plumbing — they are first-class, visible product actions that the user (and the judges) directly trigger and observe.

---

## 2. Problem Statement

People running real projects with AI assistance — students, developers, freelancers, indie builders — lose project context constantly:

- AI conversations hit length/context limits and degrade or get cut off.
- Starting a new chat means starting from zero.
- Switching between ChatGPT, Gemini, and Claude means three separate amnesiac silos.
- Returning after days or weeks means re-reading old chats (if you can even find them) just to remember *why* a decision was made.

The cost isn't just annoyance — it's **decision rot**. The reasoning behind a choice ("why did we use FastAPI instead of Flask") evaporates faster than the choice itself, and that reasoning is exactly what's needed when revisiting or onboarding someone into a project.

---

## 3. Vision

AI conversations should be disposable. Project memory should not be. ContextOS treats every chat as a temporary interface to a permanent, structured project brain — so the user's actual asset is the project's accumulated knowledge, not any single conversation thread.

---

## 4. Goals

- Demonstrate deep, visible use of all four Cognee lifecycle operations, not just `remember`/`recall`.
- Prove that a graph-backed memory answers questions a flat note-store or vector search cannot (the reasoning-chain query is the proof).
- Ship a working, demoable product solo in 7 days.
- Win the **Cognee Cloud track** specifically; be competitive for the overall prize on Technical Excellence and Best Use of Cognee.

## 5. Non-Goals

- **Not** a general-purpose note-taking or PM tool — it only exists in service of AI-project memory.
- **Not** attempting automatic, invisible context injection into ChatGPT/Gemini/Claude's UIs. There is no third-party API for this, and faking it via DOM injection is fragile, ToS-risky, and unscoreable on the rubric. ContextOS does this **honestly**, via an explicit, user-triggered copy/paste continuation prompt.
- **Not** multi-user, not a team product, not self-hosted Cognee OSS — Cognee Cloud only.
- **Not** a from-scratch graph visualization engine — Cognee's own graph view is used as-is.

---

## 6. Target Users

Solo builders and small teams running multi-session AI-assisted work who currently re-explain project state by hand at the start of every new chat.

## 7. User Personas

**1. Priya — Indie hacker / hackathon builder**
Runs 2-3 side projects in parallel, bounces between ChatGPT for brainstorming and Claude for coding, constantly re-pastes "here's where we are" summaries she writes from memory. Wants the AI to just know.

**2. Dan — Freelance technical consultant**
Manages several client engagements, each with its own AI-assisted research thread. Needs to recall, weeks later, exactly why a technical recommendation was made — for client trust and his own sanity.

*(Kept to two. A third persona adds narrative weight without adding demo value — cut.)*

---

## 8. User Stories

| As a... | I want to... | So that... | Priority |
|---|---|---|---|
| User | capture a chunk of an AI conversation with one click | I don't have to manually re-type what happened | P0 |
| User | ask "why did we choose FastAPI?" | I get the actual reasoning chain, not just a keyword match | P0 |
| User | see open tasks, risks, and decisions at a glance per project | I can resume work without re-reading old chats | P0 |
| User | generate a continuation prompt and paste it into a new chat | the new AI session starts with full context | P0 |
| User | refresh/enrich memory after adding new info | answers improve as the project evolves | P0 |
| User | delete a stale decision or risk | my memory stays accurate, not cluttered | P0 |
| User | see what changed recently in the project | I can catch up after being away | P1 |
| User | view the underlying knowledge graph | I can trust and explore how memory connects | P1 |

---

## 9. Functional Requirements

**P0**
- Create / list / view projects.
- Capture raw text (via extension selection or dashboard paste) into a project's memory.
- Extraction pipeline classifies captured text into typed memory units before storage.
- `remember()` stores memory units into a per-project Cognee dataset.
- `recall()` answers: project summary, decisions (with rationale), open tasks, open risks, and free-text questions.
- `improve()`/`memify()` triggerable on demand, with observable before/after effect on a recall answer.
- `forget()` deletes a specific memory unit, with visible graph/count update.
- Continuation prompt generator: produces copy-pasteable structured summary for any AI chat.
- Chrome extension: capture selected text → send to a chosen project.

**P1**
- "What changed this week" view, derived from timeline events / decision supersession, not a separate subsystem.
- Embedded Cognee native graph view per project.
- Extension popup: generate + copy continuation prompt without opening dashboard.

**P2 (explicitly stretch, not required for MVP)**
- Multi-user auth.
- n8n ingestion connector.
- Claude Code / OpenClaw integration as a separate product surface.

---

## 10. Non-Functional Requirements

- **Latency tolerance:** graph-completion calls can take several seconds. Every Cognee-calling UI action must show an explicit loading state — silence during a live demo reads as broken.
- **Reliability for demo:** all primary demo paths must work against pre-seeded data; nothing in the 3-minute demo should depend on a cold, empty graph.
- **Data isolation:** one Cognee dataset per project — required for `forget()` to be safely scoped and for `recall()` not to cross-contaminate between unrelated projects.
- **Security:** no API keys in client-side code; Gemini and Cognee Cloud calls happen server-side only (Next.js Route Handlers); extension authenticates via a short-lived token, not a raw API key.
- **Cost:** stay within Cognee Cloud free/dev-plan limits and Gemini free-tier rate limits; cache canned dashboard queries rather than re-querying on every render.
- **Disclosure:** AI-assistant tools used in building this project (per hackathon rules) are disclosed in the README.

---

## 11. Chrome Extension Features

#### Capture Selection — P0
- **Why it exists:** the only honest, low-risk way to get conversation content out of a third-party chat UI into ContextOS.
- **User benefit:** one click instead of manual copy-paste-retype.
- **Implementation:** Manifest V3 content script reads the current text selection on any page (works on chatgpt.com, gemini.google.com, claude.ai, or anywhere else); popup shows project picker; on confirm, sends `{text, project_id}` to `/api/extension/capture`.

#### Project Picker (Popup) — P0
- **Why:** captured text needs a destination.
- **Benefit:** zero context-switch — capture and route without opening the dashboard.
- **Implementation:** popup fetches the user's project list on open (cached, short TTL); simple dropdown + "Capture" button.

#### Copy Continuation Prompt — P0
- **Why:** this is the "Continue Anywhere" feature, done honestly.
- **Benefit:** user pastes a ready-made, structured context block into any new AI chat.
- **Implementation:** popup button calls `/api/projects/:id/continuation-prompt`, writes result to clipboard via the Clipboard API, shows a toast confirmation.

#### ~~Auto-inject into ChatGPT/Gemini/Claude~~ — **Cut**
- **Why removed:** no third-party API exists for this on any of the three platforms. DOM injection is fragile (breaks on UI updates), ToS-risky, and not what the rubric rewards (it scores zero on "Best Use of Cognee"). The copy-to-clipboard continuation prompt achieves the same user outcome with none of the risk.

---

## 12. Dashboard Features

#### Project Cards / List — P0
- **Why:** entry point, and the first thing judges see.
- **Benefit:** at-a-glance status across all active projects.
- **Implementation:** server component fetching from the lightweight project registry (see §23); each card shows name, status, last updated, open task/risk counts (cached recall results, refreshed on demand — not re-queried on every page load).

#### Project Detail Page — P0
- **Why:** this is the actual product — everything else is navigation to it.
- **Benefit:** single place to see and query everything about a project.
- **Implementation:** one route, sectioned: summary, decisions, tasks, risks, ask-a-question box, lifecycle action log, continuation prompt button, embedded Cognee graph view.
- *(Originally spec'd as five separate features — "Summary," "Goals," "Open Questions," "Timeline," "Knowledge Graph" — each as standalone dashboard modules. Merged into one page. Five subsystems for a solo 7-day build is the single biggest risk in the original spec; this collapses them into one without losing any user-visible capability.)*

#### Reasoning-Chain Q&A ("Why did we choose X?") — P0
- **Why it exists:** this is the flagship proof that ContextOS is graph-backed, not a glorified notes app.
- **Benefit:** instant, trustworthy recall of *reasoning*, not just facts.
- **Implementation:** free-text input → `recall()` with graph-completion search type → response includes both the answer and the traversed node path, rendered as a visible mini-chain (Decision → Rationale → Considered Alternatives).

#### Decisions / Tasks / Risks Lists — P0
- **Why:** the core day-to-day utility surface.
- **Benefit:** resume work without re-reading chat history.
- **Implementation:** three canned `recall()` queries per project, cached and refreshed on `remember()`/`improve()` actions.

#### Lifecycle Action Log — P0
- **Why it exists:** directly answers the rubric's "depth of memory lifecycle API usage" criterion *visibly*, instead of hoping judges infer it.
- **Benefit (for the demo, not the end user — this is judge-facing instrumentation):** every `remember`/`recall`/`improve`/`forget` call appears as a toast/log line naming the function and its effect.
- **Implementation:** thin wrapper around every Cognee call that pushes `{function, summary}` to a small client-side event log component.

#### "Refresh Memory" (improve/memify) — P0
- **Why:** makes an otherwise invisible enrichment operation into a concrete, demoable action.
- **Benefit:** answers visibly get richer/more accurate as the project evolves.
- **Implementation:** button calls `improve()`/`memify()` on the project's dataset; UI re-runs the last asked question automatically afterward to show the delta.

#### Archive / Forget — P0
- **Why:** memory must be correctable and deletable, not just additive — and this is the one rubric-mandated operation teams most often skip under time pressure.
- **Benefit:** trust ("I can remove what's wrong or stale") and tidiness.
- **Implementation:** archive button on any decision/task/risk → `forget()` scoped to that node id → UI removes it and decrements visible counts immediately.

#### Continuation Prompt Generator — P0
- **Why:** the dashboard-side counterpart to the extension feature; works even without the extension installed.
- **Benefit:** one-click, structured "resume this project" text block for pasting anywhere.
- **Implementation:** templated generation from the latest summary/decisions/tasks/risks recall results, via Gemini, with a "Copy" button.

#### "What Changed This Week" — P1
- **Why:** valuable, but not required for the flagship demo moment.
- **Benefit:** fast re-orientation after time away.
- **Implementation:** filtered view over timeline events / `Decision -SUPERSEDES-> Decision` edges within the last N days. **Not a separate dashboard module** — a filter/tab within the project detail page.

#### Knowledge Graph View — P1
- **Why:** visually proves "this is a graph, not a flat list" — strong for Technical Excellence and UX scoring.
- **Benefit:** exploratory trust-building.
- **Implementation:** embed Cognee Cloud's native graph visualization for the project's dataset. **Do not build a custom force-graph from scratch** — this is a multi-day trap with zero unique product value over the off-the-shelf option.

---

## 13. Cognee Integration Design

- **One Cognee Cloud dataset per ContextOS project** — gives clean isolation, makes `forget()` safely scoped, and prevents `recall()` cross-contamination between unrelated projects.
- **All Cognee calls happen server-side**, from Next.js Route Handlers, never from the browser or the extension directly — API keys never reach the client.
- **`remember()`** is called per batch of extracted memory units (see §14), not per raw paste — extraction happens first, then structured units (plus the original raw chunk, for grounding) are written.
- **`recall()`** is used in two modes: (a) canned, fixed queries for dashboard summary/decisions/tasks/risks, and (b) free-text graph-completion queries for the reasoning-chain Q&A.
- **`improve()`/`memify()`** is user-triggered ("Refresh Memory"), not purely automatic — automatic background enrichment is unpredictable in timing and a liability during a live demo. It can *also* run automatically post-ingestion if time permits (P1), but the manual trigger is the demo-safe P0 version.
- **`forget()`** is scoped to a single node id for everyday use, with dataset-level prune available as an admin/cleanup action (P1) for deleting an entire project.

> **Verification flag:** confirm Cognee Cloud's exact REST surface (auth scheme, dataset-scoping parameters, available `SearchType`s for graph-completion) directly against `docs.cognee.ai` on Day 1, before writing the extraction or dashboard code. Do not assume parity with the OSS Python library's exact call signatures.

---

## 14. Memory Lifecycle Design

| Operation | Trigger | What it does in ContextOS | Demo visibility |
|---|---|---|---|
| `remember()` | New capture (extension or dashboard paste) ingested | Stores extracted, typed memory units into the project's dataset | Toast: "remember(): 2 decisions, 1 risk added" + live count increment |
| `recall()` | Dashboard load, canned queries, or free-text question | Retrieves summary/decisions/tasks/risks, or answers a reasoning-chain question via graph completion | Visible answer + highlighted graph path for reasoning queries |
| `improve()` / `memify()` | "Refresh Memory" button | Re-enriches the dataset; re-running the last question shows a richer/updated answer | Before → after answer comparison shown side-by-side or sequentially |
| `forget()` | "Archive" action on any node | Surgically removes that memory unit from the graph | Node disappears from graph view + list; count decrements |

---

## 15. Graph Schema

**Node types:** `Project`, `Decision`, `Task`, `Risk`, `OpenQuestion`, `Fact`, `Goal`, `Technology`, `TimelineEvent`

**Key relationships (this schema *is* the product — get it right before writing extraction code):**

```
Project       -CONTAINS->            Decision | Task | Risk | Goal | OpenQuestion | Fact
Decision      -HAS_RATIONALE->       Fact
Decision      -CONSIDERED_ALT->      Technology
Decision      -RELATES_TO->          Technology
Decision      -SUPERSEDES->          Decision         (enables "what changed this week")
Task          -DEPENDS_ON->          Task
Risk          -AFFECTS->             Decision | Task
TimelineEvent -RECORDS->             Decision | Task | Goal
```

This is what makes "Why did we choose FastAPI?" answerable as a traversal (`Decision -HAS_RATIONALE-> Fact`, `Decision -CONSIDERED_ALT-> Technology`) rather than a lucky keyword hit.

---

## 16. Memory Schema

Shape of a structured memory unit, produced by the extraction pipeline, before being written via `remember()`:

```json
{
  "type": "Decision",
  "project_id": "proj_123",
  "content": "Chose FastAPI for the backend.",
  "rationale": "Needed async support and fast prototyping speed for a 7-day build.",
  "considered_alternatives": ["Flask", "Django"],
  "relates_to": ["Python", "REST API"],
  "status": "active",
  "source": "extension_capture",
  "timestamp": "2026-06-29T14:02:00Z"
}
```

Other types (`Task`, `Risk`, `Fact`, `Goal`, `OpenQuestion`) follow the same envelope, dropping fields that don't apply.

---

## 17. AI Workflow

1. Raw text arrives (capture or paste).
2. Gemini extraction prompt classifies and restructures it into one or more memory units matching §16's schema — critically, the prompt explicitly asks for rationale and considered alternatives whenever a decision is present, because this is what the flagship query needs and Cognee's own auto-extraction won't reliably surface it from raw prose alone.
3. Each memory unit is converted into a short, templated natural-language statement (e.g., *"DECISION: chose FastAPI BECAUSE of async support and fast prototyping. CONSIDERED AND REJECTED: Flask, Django. RELATES TO: Python backend architecture."*) — this biases Cognee's own `cognify()` entity/relationship extraction toward the schema in §15 without hand-building a custom graph pipeline.
4. The templated statement (plus the structured JSON as metadata) is passed to `remember()`.
5. Dashboard and extension read back through `recall()`.

---

## 18. Browser Extension Workflow

1. User selects text in any tab (ChatGPT, Gemini, Claude, or anywhere else).
2. Clicks the extension icon → popup shows project picker.
3. Picks a project, clicks "Capture."
4. Background service worker sends `{text, project_id}` + auth token to `/api/extension/capture`.
5. Server runs the AI Workflow (§17) and calls `remember()`.
6. Popup shows a success toast with the lifecycle summary (e.g., "Added 1 decision, 2 facts").
7. Separately, "Copy Continuation Prompt" calls `/api/projects/:id/continuation-prompt` and writes the result to the clipboard.

---

## 19. Dashboard Workflow

1. User logs in (single-user or simple token auth — see §27) → sees project cards.
2. Opens a project → page fires canned `recall()` queries for summary/decisions/tasks/risks (cached, with a manual refresh).
3. Asks a free-text question → graph-completion `recall()` → answer + path rendered.
4. Pastes new info directly (no extension required) → same AI Workflow as extension capture → `remember()`.
5. Clicks "Refresh Memory" → `improve()`/`memify()` → re-displays last question's answer, updated.
6. Archives a stale item → `forget()` → list and graph update immediately.
7. Clicks "Copy Continuation Prompt" → clipboard write → toast confirmation.

---

## 20. API Architecture

All endpoints are Next.js Route Handlers. No separate backend service unless Day-1 verification (§13) shows Cognee Cloud genuinely requires a Python-only SDK for needed capabilities — in that case, the *only* acceptable addition is a single minimal serverless Python function for that specific call, not a parallel FastAPI service.

```
POST   /api/projects                       create project (+ Cognee dataset)
GET    /api/projects                       list projects (dashboard cards)
GET    /api/projects/:id                   project detail bootstrap (summary/decisions/tasks/risks)
POST   /api/projects/:id/remember          ingest raw text → extract → remember()
POST   /api/projects/:id/recall            free-text question → recall() (graph completion)
POST   /api/projects/:id/improve           trigger improve()/memify()
POST   /api/projects/:id/forget            archive a specific node → forget()
POST   /api/projects/:id/continuation-prompt   generate copy-paste context block
POST   /api/extension/auth                 issue short-lived token for the extension
POST   /api/extension/capture              extension capture entry point → remember pipeline
```

---

## 21. Folder Structure

```
contextos/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx                 # project cards
│   │   └── projects/[id]/page.tsx   # project detail
│   ├── api/
│   │   ├── projects/route.ts
│   │   ├── projects/[id]/route.ts
│   │   ├── projects/[id]/remember/route.ts
│   │   ├── projects/[id]/recall/route.ts
│   │   ├── projects/[id]/improve/route.ts
│   │   ├── projects/[id]/forget/route.ts
│   │   ├── projects/[id]/continuation-prompt/route.ts
│   │   └── extension/{auth,capture}/route.ts
├── components/
│   ├── ProjectCard.tsx
│   ├── ReasoningChainBox.tsx
│   ├── LifecycleLog.tsx
│   ├── DecisionList.tsx / TaskList.tsx / RiskList.tsx
│   └── GraphEmbed.tsx
├── lib/
│   ├── cognee.ts          # thin client wrapper for all 4 lifecycle calls + logging
│   ├── gemini.ts          # extraction + continuation-prompt generation
│   ├── schema.ts          # memory unit types (§16)
│   └── db.ts              # project registry client
├── extension/
│   ├── manifest.json
│   ├── content-script.ts  # selection capture
│   ├── popup/
│   └── background.ts
└── README.md
```

---

## 22. Tech Stack

| Layer | Choice | Reasoning |
|---|---|---|
| Frontend + API | Next.js (App Router, Route Handlers) | One service instead of two; faster solo build |
| ~~Backend~~ | **Cut, conditionally** | FastAPI adds a second deployable surface for no benefit unless Cognee Cloud strictly requires it — verify first (§13) |
| Memory | Cognee Cloud | Required by hackathon track; zero devops |
| LLM | Gemini | Extraction, continuation-prompt generation |
| Extension | Chrome Manifest V3 | Selection capture + clipboard actions only — no DOM injection |
| Project registry DB | Lightweight Postgres (e.g., free-tier Supabase/Neon) | Cognee holds the knowledge graph; this just holds project metadata + auth tokens — not project content |
| Hosting | Vercel | Matches Next.js, zero devops |

---

## 23. Database Design

This is **not** where project knowledge lives — that's entirely in Cognee. This lightweight relational store only holds app-level metadata that Cognee isn't designed to hold:

```sql
users (id, email, created_at)

projects (
  id, user_id, name, status, cognee_dataset_id,
  created_at, updated_at, last_activity_at
)

extension_tokens (id, user_id, token, expires_at)
```

That's it. Three tables. Resist the urge to mirror decisions/tasks/risks here — that duplication invites drift between "what the dashboard cached" and "what Cognee actually knows," and the graph is the source of truth.

---

## 24. Development Roadmap (Solo, 7 Days)

| Day | Focus |
|---|---|
| 1 | Cognee Cloud + Gemini setup; verify REST surface (§13); round-trip `remember()`→`recall()` test; **lock the graph schema (§15)** |
| 2 | Build extraction pipeline (Gemini → typed memory units → templated injection → `remember()`); test specifically against a FastAPI-decision-style transcript |
| 3 | Build and harden the 4 canned `recall()` queries (summary, decisions+rationale, tasks, risks); iterate until the reasoning-chain query reliably returns a multi-hop answer — **this is the riskiest part of the build, do it early, not late** |
| 4 | Project registry DB + dashboard shell: project cards, create-project flow, project detail page skeleton |
| 5 | Complete project detail page: reasoning-chain Q&A box, lists, lifecycle log component, continuation-prompt generator, embed Cognee graph view |
| 6 | Wire `improve()` ("Refresh Memory") and `forget()` ("Archive") with visible UI effects; build Chrome extension (capture + popup + copy continuation prompt) |
| 7 | Seed final demo data; rehearse the 3-minute script; record a backup demo video; finish README; deploy; disclose AI-assistant usage |

---

## 25. MVP Features (must work for the demo)

- Project cards + project detail page (merged, single page per project)
- Capture via extension and via dashboard paste
- Reasoning-chain Q&A with visible graph path
- Decisions / tasks / risks lists
- All four lifecycle operations, visibly triggered and logged
- Continuation prompt generator + clipboard copy (dashboard and extension)

## 26. Stretch Goals

- "What changed this week" filter
- Embedded native Cognee graph view (P1, but high value-to-effort if Day 6 goes smoothly)
- Auto `improve()` post-ingestion in addition to the manual trigger

## 27. Out-of-Scope Features

- Auto-injection of context into ChatGPT/Gemini/Claude UIs (no API; explicitly cut, see §11)
- Custom-built graph visualization engine (use Cognee's native view)
- Multi-user/team accounts, roles, sharing
- Self-hosted Cognee OSS deployment (Cloud only, for the Cloud track)
- A second backend service (FastAPI), unless Day-1 verification proves it's strictly necessary
- n8n / OpenClaw / Claude Code as built product features — see §28 for the one exception worth taking

---

## 28. Integration Recommendations (n8n, OpenClaw, Claude Code, Codex)

**n8n, OpenClaw, Codex — skip as built features.** None of them touch the flagship demo moment (the reasoning-chain query), and wiring any of them under solo 7-day time pressure is more likely to cost a day than to add score.

**Claude Code — take this one, it's free.** Build ContextOS itself using Claude Code with Cognee's official Claude Code memory integration enabled, and disclose it in the README and demo. This costs nothing extra (you're using an AI coding assistant regardless), genuinely uses an organizer-spotlighted integration, and earns a strong closing demo line: *"We used Cognee's own dev-tool memory to remember our architecture decisions while building a tool that gives users the same capability."* Low risk, real narrative payoff.

---

## 29. Risks

| Risk | Mitigation |
|---|---|
| Live graph-completion calls are slow (several seconds) | Explicit loading states everywhere; pre-seeded demo data; recorded backup video for the riskiest 90 seconds |
| Extraction doesn't reliably produce rationale/alternative relationships | Solve this Day 2-3, not Day 6; use the templated natural-language injection technique (§17), test against the exact "why FastAPI" scenario repeatedly before moving on |
| Gemini or Cognee Cloud rate limits during live demo | Cache canned dashboard answers; rehearse against a pre-warmed dataset, not a cold one |
| Cognee Cloud's exact REST/SDK surface differs from assumptions here | Verify against docs.cognee.ai on Day 1 before writing extraction or dashboard code |
| Scope creep back toward the original 5-subsystem dashboard | This PRD is the guardrail — anything not in §25 MVP doesn't get built before Day 7 |
| `forget()` demoed live with no rehearsed fallback | Rehearse the exact archive action and its visible effect beforehand; know exactly which node gets archived in the demo script |

---

## 30. Demo Flow (Narrative)

Open on the pain (re-explaining a project to a new chat) → show the dashboard already knowing everything → prove it's a graph, not a list, via the reasoning-chain query → prove memory is live and editable via `remember()`/`improve()`/`forget()` fired on-screen → close by actually pasting a continuation prompt into a real, empty AI chat and watching it respond in-context.

## 31. 3-Minute Judge Demo Script

- **0:00–0:20** — "You re-explain your project to a new AI chat every week. ContextOS remembers it for you." Show dashboard, two pre-seeded project cards.
- **0:20–0:50** — Open one project. Walk through summary, open decisions, open risks — all from prior sessions.
- **0:50–1:20** — Type "Why did we choose FastAPI?" → answer renders with the highlighted graph path. Say explicitly: "That's a multi-hop graph traversal — `recall()` walking Decision → Rationale → Considered Alternatives. Not a keyword match."
- **1:20–1:45** — Switch to the extension, select a fresh snippet of text on a real page, capture it into the project. Toast fires: "`remember()`: 2 facts, 1 decision added." Dashboard count updates live.
- **1:45–2:10** — Click "Refresh Memory" → `improve()`/`memify()` fires → re-ask the same reasoning-chain question → show the answer is now richer/updated.
- **2:10–2:30** — Archive a stale risk → `forget()` fires → it visibly disappears from the list and the graph view; count drops.
- **2:30–2:50** — Click "Copy Continuation Prompt," open a brand-new, empty ChatGPT (or Gemini) tab, paste, hit enter — it responds with full project context instantly.
- **2:50–3:00** — "Built solo in 7 days, end-to-end on Cognee's four memory operations." Cut to GitHub link.

---

## 32. README Structure

1. Project name + tagline + one-line pitch
2. Problem (2-3 sentences)
3. Solution overview + architecture diagram
4. Screenshot/GIF of the reasoning-chain query in action
5. Tech stack
6. Cognee lifecycle usage — explicit code snippets for each of `remember()`/`recall()`/`improve()`/`forget()`, named and explained
7. Setup/run instructions
8. Demo video link (the recorded backup)
9. AI-assistant disclosure statement (Claude Code usage, per hackathon rules)
10. License

---

## 33. Future Improvements (Post-Hackathon, Not for This Build)

- Real injection into AI chat UIs, if/when platforms ever expose an official API for it
- Multi-user accounts and team sharing
- n8n ingestion connectors for non-chat sources (Slack, email, docs)
- OpenClaw skill so memory is queryable over messaging apps
- Proactive blocker/risk detection (push notifications, not just on-demand queries)
- Self-hosted Cognee OSS option for privacy-sensitive users
