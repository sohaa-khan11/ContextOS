import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import groq_client
import cognee_client
import dedup

app = FastAPI(title="ContextOS Cognee Service")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Models ---
class RememberRequest(BaseModel):
    project_id: str
    raw_text: str
    source: Optional[str] = None

@app.on_event("startup")
async def startup_event():
    await cognee_client.init_cognee()

@app.post("/memory/remember")
async def remember(req: RememberRequest):
    logger.info(f"Capture received for project {req.project_id}")
    
    # 1. Deduplication Check
    text_hash = dedup.generate_content_hash(req.raw_text)
    logger.info(f"Hash generated: {text_hash}")
    
    try:
        is_dup = dedup.is_duplicate(req.project_id, text_hash)
        logger.info(f"Duplicate check result: {is_dup}")
        if is_dup:
            return {"remembered": 0, "skipped": 1, "summary": "already exists"}
    except Exception as e:
        logger.error(f"Database failure during duplicate check: {e}")
        raise HTTPException(status_code=500, detail="Database failure")

    # 2. Groq Extraction
    try:
        units = await groq_client.extract_memory_units(req.raw_text)
        logger.info(f"Groq extraction successful: extracted {len(units)} units")
    except Exception as e:
        logger.error(f"Groq failure: {e}")
        raise HTTPException(status_code=500, detail=f"Groq extraction failed: {str(e)}")

    if not units:
        return {"remembered": 0, "skipped": 0, "summary": "No relevant units extracted"}

    # 3. Cognee Ingestion
    remembered_count = 0
    try:
        for unit in units:
            unit.source = req.source or unit.source
            statement = cognee_client.format_unit_to_statement(unit)
            await cognee_client.remember_unit(req.project_id, statement)
            remembered_count += 1
        logger.info(f"Cognee remember successful for {remembered_count} units")
    except Exception as e:
        logger.error(f"Cognee failure: {e}")
        raise HTTPException(status_code=500, detail=f"Cognee ingestion failed: {str(e)}")

    # 4. Save metadata to Supabase
    try:
        dedup.store_hash(req.project_id, text_hash)
        logger.info("Supabase updated with capture hash")
    except Exception as e:
        logger.error(f"Database failure during hash store: {e}")
        raise HTTPException(status_code=500, detail="Database failure")

    logger.info("Success")
    return {
        "remembered": remembered_count,
        "skipped": 0,
        "summary": f"{remembered_count} memory units processed"
    }

# Mock endpoints to satisfy scaffolding
@app.post("/memory/recall")
async def recall(req: dict): return {"answer": "mock answer", "path": []}
@app.post("/memory/recall/canned")
async def recall_canned(req: dict): return {"items": []}
@app.post("/memory/improve")
async def improve(req: dict): return {"improved": True}
@app.post("/memory/forget")
async def forget(req: dict): return {"forgotten": True}
@app.get("/memory/status/{project_id}")
async def get_status(project_id: str): return {"status": "DATASET_PROCESSING_COMPLETED"}
@app.post("/memory/continuation-prompt")
async def continuation_prompt(req: dict): return {"prompt": "mock prompt"}
@app.get("/health")
async def health(): return {"status": "ok"}
