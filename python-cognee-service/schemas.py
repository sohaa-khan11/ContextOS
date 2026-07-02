from typing import Any, List, Optional
from pydantic import BaseModel, SkipValidation
from cognee.infrastructure.engine import DataPoint

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
    has_rationale: SkipValidation[Any] = None   # -> Fact node
    considered_alt: SkipValidation[Any] = None  # -> Technology node(s)
    relates_to: SkipValidation[Any] = None      # -> Technology node(s)
    supersedes: SkipValidation[Any] = None      # -> Decision (for "what changed")
    metadata: dict = {"index_fields": ["content", "rationale"]}

class Task(DataPoint):
    content: str
    status: str = "active"
    source: Optional[str] = None
    depends_on: SkipValidation[Any] = None      # -> Task
    metadata: dict = {"index_fields": ["content"]}

class Risk(DataPoint):
    content: str
    status: str = "active"
    source: Optional[str] = None
    affects: SkipValidation[Any] = None         # -> Decision | Task
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
