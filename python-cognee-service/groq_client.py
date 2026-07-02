import os
from typing import List
from memory_units import MemoryUnit

# import groq

async def extract_memory_units(raw_text: str) -> List[MemoryUnit]:
    """Uses Groq to extract memory units from raw text."""
    # TODO: Implement Groq extraction
    return []

async def generate_continuation_prompt(recall_output: str, name: str, summary: str) -> str:
    """Uses Groq to format a continuation prompt."""
    # TODO: Implement Groq formatting
    return "mock continuation prompt"

async def generate_project_summary(recall_output: str) -> str:
    """Uses Groq to generate a 2-sentence summary."""
    # TODO: Implement Groq summarization
    return "mock summary"
