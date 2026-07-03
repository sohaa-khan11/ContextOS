import json
from typing import List
from memory_units import MemoryUnit
from groq import Groq
from config import config

client = Groq(api_key=config.groq_api_key)

EXTRACTION_SYSTEM_PROMPT = """
You are a project-memory extraction engine. Given raw conversation text,
extract every discrete piece of project knowledge as a JSON object containing a single key "units", which maps to an array of typed memory units.

Output ONLY a valid JSON object. No markdown, no prose, no code fences.

For each unit, output this shape:
{
  "type": "Decision" | "Task" | "Risk" | "Goal" | "OpenQuestion" | "Fact",
  "content": "string",
  "rationale": "string | null",
  "considered_alternatives": ["string"],
  "relates_to": ["string"],
  "status": "active" | "resolved" | "blocked"
}

Rules:
- For Decisions: ALWAYS try to extract rationale even if implied, not stated.
  Infer from context. Do not leave rationale null if the reasoning is present.
- ALWAYS capture alternatives that were mentioned and rejected.
- If a unit is ambiguous between types, prefer the more specific type.
"""

RECOVERY_SYSTEM_PROMPT = """
The following was not valid JSON. Return only the corrected JSON object.
Do not add explanation. Output ONLY the JSON object.

{malformed_output}
"""

async def extract_memory_units(raw_text: str) -> List[MemoryUnit]:
    """Uses Groq to extract memory units from raw text."""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": raw_text}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        units = data.get("units", [])
        return [MemoryUnit(**u) for u in units]
    except json.JSONDecodeError:
        # Recovery attempt
        try:
            recovery_response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": RECOVERY_SYSTEM_PROMPT.format(malformed_output=content)}
                ],
                response_format={"type": "json_object"}
            )
            data = json.loads(recovery_response.choices[0].message.content)
            units = data.get("units", [])
            return [MemoryUnit(**u) for u in units]
        except Exception as e:
            raise RuntimeError(f"Groq recovery extraction failed: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Groq extraction failed: {str(e)}")

CONTINUATION_PROMPT = """
Write a single context-handoff block the user can paste verbatim into a new
AI chat to resume this project. Be structured, not conversational. Cover
project goal, key decisions with their reasoning, open tasks, and open risks.

Use this format exactly:

"I'm continuing a project.

GOAL: {{summary}}

KEY DECISIONS (with reasoning):
- {{decision}} — because {{rationale}}

OPEN TASKS:
- {{task}}

OPEN RISKS:
- {{risk}}

Please continue from here."
"""

async def generate_continuation_prompt(recall_output: str) -> str:
    """Uses Groq to format a continuation prompt."""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": CONTINUATION_PROMPT},
                {"role": "user", "content": f"Project data: {recall_output}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Failed to generate context: {str(e)}"

async def generate_project_summary(recall_output: str) -> str:
    """Uses Groq to generate a 2-sentence summary."""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Write a 2-sentence summary of this project's current state. Base it only on the provided data. Output plain text only."},
                {"role": "user", "content": recall_output}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Project state based on memory: {recall_output[:100]}..."

ANALYSIS_SYSTEM_PROMPT = """
You are a proactive memory assistant. Analyze the following raw text and determine its value for long-term project memory.
Output ONLY a valid JSON object with the following structure:
{
  "importance_score": <number 0-100>,
  "importance_level": "<High|Medium|Low>",
  "memory_type": "<Decision|Task|Risk|Goal|Fact|Concept>",
  "reason": "<short explanation of why this is or isn't important>",
  "summary": "<a concise 1-sentence summary of the core insight>",
  "entities": ["<entity1>", "<entity2>"],
  "should_save": <boolean>
}
"""

async def analyze_memory_content(raw_text: str) -> dict:
    """Uses Groq to analyze memory and return structured JSON."""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": raw_text}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        return {
            "importance_score": 50,
            "importance_level": "Medium",
            "memory_type": "Fact",
            "reason": "Fallback analysis due to parsing error.",
            "summary": raw_text[:100] + "...",
            "entities": [],
            "should_save": True
        }

SYNTHESIZE_SYSTEM_PROMPT = """
You are ContextOS, a Universal AI Context Layer. Your goal is to provide polished, human-readable answers based on the retrieved project memory graph.

Use the provided raw graph and semantic context to answer the user's question naturally and fully.
Base your answer ONLY on the provided context. If the context is empty or lacks information, do not hallucinate an answer.

Structure your response exactly as follows (output ONLY a valid JSON object):

{
  "summary": "<A direct, natural 1-2 sentence answer to the question>",
  "reasoning": {
    "decision": "<Decision made or key insight, if any>",
    "rationale": "<Explain the reasoning found in the memory, connecting decisions to their rationales>"
  },
  "supporting_memories": ["<key fact or task 1>", "<key fact or task 2>"],
  "entities": ["<entity1>", "<entity2>"],
  "relationships": ["<Entity1> -> <Entity2>"],
  "confidence": "<High|Medium|Low based on context clarity>"
}

Rules:
- If a field is not applicable, leave it empty or omit it, but still provide the JSON structure.
- Do not output markdown, only valid JSON.
"""

async def synthesize_recall(question: str, context: str) -> dict:
    """Uses Groq to synthesize a fast, polished answer from raw Cognee retrieval data."""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYNTHESIZE_SYSTEM_PROMPT},
                {"role": "user", "content": f"Question: {question}\n\nContext Data:\n{context}"}
            ],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {
            "summary": f"Failed to synthesize context: {str(e)}",
            "reasoning": None
        }

DASHBOARD_DATA_SYSTEM_PROMPT = """
You are a memory parser. Based on the following raw project data, extract the current state into this exact JSON structure:
{
  "summary": "<1-2 sentences capturing the overall goal and status>",
  "decisions": [ {"type": "Decision", "content": "<decision rationale>"} ],
  "tasks": [ {"type": "Task", "content": "<task description>"} ],
  "risks": [ {"type": "Risk", "content": "<risk description>"} ]
}
Only output valid JSON.
"""

async def synthesize_dashboard_data(context: str) -> dict:
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": DASHBOARD_DATA_SYSTEM_PROMPT},
                {"role": "user", "content": context}
            ],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {
            "summary": "Error generating dashboard data.",
            "decisions": [],
            "tasks": [],
            "risks": []
        }
