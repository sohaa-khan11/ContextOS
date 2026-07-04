# AI Pair Programming Workflow: ContextOS

This document outlines the collaborative, multi-agent AI pair programming workflow used to design, implement, and document the ContextOS platform. It acts as a blueprint for combining ChatGPT, Claude, and Antigravity.

---

## 1. AI Task Matrix (Division of Labor)

| AI Assistant | Primary Strengths | ContextOS Application Examples |
| :--- | :--- | :--- |
| **ChatGPT** | High-level ideation, quick syntax checks, copywriting, marketing copy, and presentation outlines. | Ideating project branding, drafting initial PRD summaries, and generating raw text mockups. |
| **Claude** | Deep architectural critiques, code structure refactoring, complex logic checking, and mathematical specifications. | Critiquing the hybrid Cognee database design, analyzing performance bottlenecks, and reviewing codebase typings. |
| **Antigravity** | Agentic repository search, step-by-step technical implementation, automated debugging, and multi-file code integration. | Implementing the polling content script rewrite, structuring Supabase queries, and executing build test validations. |

---

## 2. Practical Collaboration Pipelines

### A. The Implementation Pipeline (Ideation to Shipping)

```
[ ChatGPT ] ──> Brainstorm features & draft elevator pitches
     │
     ▼
[  Claude ] ──> Critique system design & structure FastAPI models
     │
     ▼
[ Antigravity ] ──> Write implementation code, fix TypeScript errors, verify build
     │
     ▼
[  Claude ] ──> Review codebase consistency & optimize Neo4j Cypher queries
     │
     ▼
[ ChatGPT ] ──> Generate video script voiceover & Devpost summaries
```

### B. The Debugging Loop (Fail to Fix)

1. **Identify**: Terminal build fails or browser logs throw ReferenceErrors.
2. **Consult Antigravity**: Feed the exact stack trace. Antigravity runs agentic searches (`grep_search` / `view_file`) across the workspace to locate the error origin.
3. **Draft Fix**: Antigravity writes the target edit.
4. **Review**: Claude reviews the proposed edit to verify it doesn't break adjacent component states.
5. **Stage & Commit**: Run build tests and stage changes.

---

## 3. Recommended Prompts

### A. High-Level Planning (ChatGPT)
- *Prompt*: `"We are building a Chrome Extension that ambiently captures AI responses. Brainstorm three premium tagline options, a clear problem statement, and five target user personas for our pitch deck."`

### B. Code Quality & Critique (Claude)
- *Prompt*: `"Here is our FastAPI remember endpoint. Review it for race conditions, security token leaks, and database connection pooling performance. Critique the design and suggest improvements."`

### C. Implementation & Execution (Antigravity)
- *Prompt*: `"Rewrite content.js to implement a polling loop tracking text stability. Filter out code blocks and diagrams using character density heuristics, and inject a horizontal absolute toolbar below target paragraphs."`
