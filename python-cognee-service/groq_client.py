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
            model="llama3-8b-8192",
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
                model="llama3-8b-8192",
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
