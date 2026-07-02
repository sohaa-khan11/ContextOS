from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

# import cognee_client
# import gemini_client
# import dedup

app = FastAPI(title="ContextOS Cognee Service")

# --- Models ---
class RememberRequest(BaseModel):
    project_id: str
    raw_text: str
    source: Optional[str] = None

class RecallRequest(BaseModel):
    project_id: str
    question: str
    query_type: Optional[str] = "GRAPH_COMPLETION"

class CannedRecallRequest(BaseModel):
    project_id: str
    type: str # "summary" | "decisions" | "tasks" | "risks"

class ImproveRequest(BaseModel):
    project_id: str

class ForgetRequest(BaseModel):
    project_id: str
    node_id: Optional[str] = None
    wipe_project: Optional[bool] = False

class ContinuationRequest(BaseModel):
    project_id: str
    since_source: Optional[str] = None

# --- Routes ---
@app.on_event("startup")
async def startup_event():
    # await cognee_client.init_cognee()
    pass

@app.post("/memory/remember")
async def remember(req: RememberRequest):
    # TODO: Implement dedup, extraction, and cognee.remember calls
    return {"remembered": 0, "skipped": 0, "summary": "mock"}

@app.post("/memory/recall")
async def recall(req: RecallRequest):
    # TODO: Implement cognee.recall call
    return {"answer": "mock answer", "path": []}

@app.post("/memory/recall/canned")
async def recall_canned(req: CannedRecallRequest):
    # TODO: Implement canned queries
    return {"items": []}

@app.post("/memory/improve")
async def improve(req: ImproveRequest):
    # TODO: Implement cognee.improve call
    return {"improved": True}

@app.post("/memory/forget")
async def forget(req: ForgetRequest):
    # TODO: Implement cognee.forget
    return {"forgotten": True}

@app.get("/memory/status/{project_id}")
async def get_status(project_id: str):
    # TODO: Implement cognee.datasets.get_status
    return {"status": "DATASET_PROCESSING_COMPLETED"}

@app.post("/memory/continuation-prompt")
async def continuation_prompt(req: ContinuationRequest):
    # TODO: Implement cognee.recall for context, then Gemini formatting
    return {"prompt": "mock prompt"}
