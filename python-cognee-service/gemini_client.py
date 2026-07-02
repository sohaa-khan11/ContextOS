import os
from typing import List
from memory_units import MemoryUnit

# import google.generativeai as genai

async def extract_memory_units(raw_text: str) -> List[MemoryUnit]:
    """Uses Gemini to extract memory units from raw text."""
    # TODO: Implement Gemini extraction
    return []

async def generate_continuation_prompt(recall_output: str, name: str, summary: str) -> str:
    """Uses Gemini to format a continuation prompt."""
    # TODO: Implement Gemini formatting
    return "mock continuation prompt"

async def generate_project_summary(recall_output: str) -> str:
    """Uses Gemini to generate a 2-sentence summary."""
    # TODO: Implement Gemini summarization
    return "mock summary"
