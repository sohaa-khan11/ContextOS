# Hackathon Submission Specification: ContextOS

This document contains copy-paste ready summaries, technical details, and project statements for Devpost or other hackathon submission forms.

---

## 1. Project Profile

* **Project Title**: ContextOS
* **Tagline**: The ambient, cross-platform memory layer for AI-assisted development.
* **Devpost Link**: `[PLACEHOLDER]`
* **GitHub Link**: `https://github.com/sohaa-khan11/ContextOS.git`

---

## 2. Submission Content

### A. Elevator Pitch
"ContextOS is a proactive, ambient memory layer that preserves project context as you work. It observes your AI conversations in the background, structures important engineering choices and tasks into an evolving 3D Knowledge Graph, and lets you inject your entire project state into any target AI assistant with a single click."

### B. The Problem
"When working on complex engineering projects, developer context is incredibly fragile. Starting a new chat session means painstakingly re-explaining your architecture, libraries, and goals. Furthermore, this knowledge is completely siloed—an architecture decision made in ChatGPT is invisible to Cursor. Manual 'master prompt' maintenance is tedious and quickly becomes outdated, leading to context drift and AI hallucinations."

### C. The Solution
"ContextOS introduces an ambient, roaming memory client (Chrome Extension) that captures facts, decisions, and tasks directly from your AI interactions. These blocks are analyzed via Groq and structured into a persistent, queryable Knowledge Graph using Cognee Cloud. 

Developers can explore their project visually in a stunning 3D spatial memory visualizer, and instantly continue their work in any tab. With a single click, ContextOS compiles the graph relationships into a master continuation prompt and injects it into the prompt input of any target AI tool."

### D. Technical Complexity & Architecture
"ContextOS features a high-performance, hybrid RAG + Knowledge Graph architecture:
1. **Frontend Dashboard**: Built using Next.js 16 (App Router) and Tailwind CSS, featuring a Three.js (React Three Fiber) spatial memory dashboard that displays Neo4j nodes and edges in real-time using Server-Sent Events (SSE).
2. **Orchestration Backend**: A Python FastAPI service that executes MD5 hash checks on text elements to prevent graph database duplication. It extracts structured JSON data using Groq (`llama3-8b-8192`) and manages Neo4j and Qdrant ingestion via the Cognee Cloud SDK.
3. **Chrome Extension (Manifest V3)**: A lightweight, unpacked client that monitors ChatGPT text stream completion, sanitizes text (removes code and ASCII diagrams), and inserts absolute-positioned toolbars below paragraphs for seamless context saving and prompt injections."

### E. Cognee Integration Highlight
"ContextOS leverages Cognee Cloud to solve the context window limitations of traditional vector RAG. Instead of chunking documents into disconnected vectors, Cognee structures captured memories into semantic graph triplets. This allows ContextOS to perform complex graph traversals to retrieve the complete history of developer decisions and dependencies (e.g. `[FastAPI] -> (REPLACES) -> [Flask]`), resulting in highly structured and contextually complete prompts."

### F. Challenges We Overcame
"Our biggest challenge was DOM stability and React re-rendering in SPAs (Single Page Applications) like ChatGPT. Initially, our extension used `MutationObserver` loops to position overlays, which caused high CPU usage and layout shifting during live response streaming. 

We completely redesigned the pipeline from first principles, shifting to a lightweight transition listener on ChatGPT’s submit button to detect the exact moment streaming finishes. We also moved from floating body elements to relative parent positioning inside the assistant containers, eliminating layout shift and scroll lag completely."

### G. Future Roadmap
- **Multi-Platform Support**: Adding DOM selectors for Claude, Gemini, and GitHub Copilot.
- **Deep Codebase Mapping**: Integrating file AST parsers in the Python backend to link code changes to the captured memory graph.
- **Collaborative Graphs**: Enabling teams to share a project graph, aligning multiple developers to the same architectural decisions.
