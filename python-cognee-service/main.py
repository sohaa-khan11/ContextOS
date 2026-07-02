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

class RecallRequest(BaseModel):
    project_id: str
    question: str

@app.post("/memory/recall")
async def recall(req: RecallRequest):
    logger.info(f"Recall Request for project {req.project_id}")
    
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Empty query provided")
        
    if not req.project_id or not req.project_id.strip():
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    logger.info(f"Dataset Resolved: ctxos_{req.project_id}")
    logger.info(f"Cognee Query: {req.question}")
    
    try:
        results = await cognee_client.recall_query(req.project_id, req.question)
        logger.info("Graph Retrieved")
    except Exception as e:
        logger.error(f"Cognee failure during recall: {e}")
        raise HTTPException(status_code=500, detail=f"Cognee recall failed: {str(e)}")
        
    # Validation of results
    if not results.get("answer"):
        raise HTTPException(status_code=404, detail="No matching memories found for this query")
        
    logger.info("Response Built")
    logger.info("Success")
    
    return {
        "answer": results["answer"],
        "path": results["path"],
        "metadata": {
            "project_id": req.project_id,
            "status": "success"
        }
    }
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
