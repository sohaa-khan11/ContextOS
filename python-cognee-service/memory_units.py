from typing import Optional, List, Literal
from pydantic import BaseModel

class MemoryUnit(BaseModel):
    type: Literal["Decision", "Task", "Risk", "Goal", "OpenQuestion", "Fact"]
    content: str
    rationale: Optional[str] = None
    considered_alternatives: Optional[List[str]] = None
    relates_to: Optional[List[str]] = None
    status: Literal["active", "resolved", "blocked"] = "active"
    source: Optional[str] = None
