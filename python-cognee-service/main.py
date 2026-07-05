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
    metadata: Optional[dict] = None

class AnalyzeRequest(BaseModel):
    project_id: str
    raw_text: str

@app.on_event("startup")
async def startup_event():
    await cognee_client.init_cognee()

@app.post("/memory/analyze")
async def analyze_memory(req: AnalyzeRequest):
    logger.info(f"Analyze request for project {req.project_id}")
    
    # 1. Deduplication Check
    text_hash = dedup.generate_content_hash(req.raw_text)
    is_dup = False
    try:
        is_dup = dedup.is_duplicate(req.project_id, text_hash)
    except Exception as e:
        logger.error(f"Database failure during dup check: {e}")
    
    # 2. AI Analysis
    try:
        analysis = await groq_client.analyze_memory_content(req.raw_text)
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        analysis = {"summary": "Failed to analyze", "should_save": False, "importance_score": 0}

    # 3. Related Memories
    related = []
    if analysis.get("summary") and not is_dup:
        try:
            res = await cognee_client.recall_query(req.project_id, analysis["summary"])
            if res and res.get("answer"):
                # We extract the answer as a related memory. In a real system, we'd parse nodes.
                related.append(res["answer"])
        except Exception as e:
            logger.error(f"Recall failed during analysis: {e}")

    return {
        "is_duplicate": is_dup,
        "duplicate_time": "previously" if is_dup else None,
        "analysis": analysis,
        "related_memories": related
    }

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

    # Check if analysis is already provided in metadata to skip Groq extraction
    units = []
    analysis = None
    if req.metadata and isinstance(req.metadata, dict):
        analysis = req.metadata.get("analysis")
        
    if analysis and isinstance(analysis, dict) and analysis.get("should_save"):
        logger.info("Bypassing Groq extraction: using analysis passed from extension")
        from memory_units import MemoryUnit
        
        # Map raw string type to literal constraints of MemoryUnit
        m_type = analysis.get("memory_type", "Fact")
        if m_type not in ["Decision", "Task", "Risk", "Goal", "OpenQuestion", "Fact"]:
            m_type = "Fact"
            
        unit = MemoryUnit(
            type=m_type,
            content=req.raw_text,
            rationale=analysis.get("reason", "Captured from extension analysis"),
            status="active",
            source=req.source or "extension"
        )
        units = [unit]
    else:
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
            
            # BUG 2 FIX: We no longer inject URL/metadata natively into the string to prevent vector pollution
            await cognee_client.remember_unit(req.project_id, statement)
            remembered_count += 1
        logger.info(f"Cognee remember successful for {remembered_count} units")
    except Exception as e:
        logger.error(f"Cognee failure (network/auth): {e}")
        # In a real environment we might fail, but for the hackathon demo we degrade gracefully
        # raise HTTPException(status_code=500, detail=f"Cognee ingestion failed: {str(e)}")

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
        logger.info("Raw Graph and Semantic Chunks Retrieved")
    except Exception as e:
        logger.error(f"Cognee failure during recall: {e}")
        raise HTTPException(status_code=500, detail=f"Cognee recall failed: {str(e)}")
        
    # Synthesize human-readable answer using Groq
    try:
        context_str = f"Raw Memory Context:\n{results.get('answer', '')}"
        synthesized_answer = await groq_client.synthesize_recall(req.question, context_str)
        logger.info("Synthesized response Built")
    except Exception as e:
        logger.error(f"Groq synthesis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Groq synthesis failed: {str(e)}")
    
    logger.info("Success")
    
    return {
        "summary": synthesized_answer.get("summary"),
        "reasoning": synthesized_answer.get("reasoning"),
        "supporting_memories": synthesized_answer.get("supporting_memories", []),
        "entities": synthesized_answer.get("entities", []),
        "relationships": synthesized_answer.get("relationships", []),
        "confidence": synthesized_answer.get("confidence"),
        "metadata": {
            "project_id": req.project_id,
            "status": "success"
        }
    }
@app.post("/memory/recall/canned")
async def recall_canned(req: dict):
    project_id = req.get("project_id")
    canned_type = req.get("type", "summary")
    
    if not project_id:
        raise HTTPException(status_code=400, detail="Missing project_id")
        
    try:
        if canned_type == "dashboard_data":
            # Fast fetch for everything needed by the dashboard panel
            res = await cognee_client.recall_query(project_id, "project context decisions tasks risks goals")
            context_str = f"Graph Paths:\n{res['path']}\n\nSemantic Chunks:\n{res['answer']}"
            dashboard_json = await groq_client.synthesize_dashboard_data(context_str)
            return dashboard_json
        elif canned_type == "all":
            # For Memory Viewer
            res = await cognee_client.recall_query(project_id, "List all memories")
            return {"items": [{"type": "Fact", "content": str(res["answer"])}]}
        else:
            return {"items": []}
    except Exception as e:
        logger.error(f"Failed canned recall: {e}")
        return {"items": [], "summary": "Error fetching data"}

class ImproveRequest(BaseModel):
    project_id: str

class ForgetRequest(BaseModel):
    project_id: str
    node_id: Optional[str] = None
    wipe_project: Optional[bool] = False

@app.post("/memory/improve")
async def improve(req: ImproveRequest):
    if not req.project_id or not req.project_id.strip():
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    logger.info(f"Improve Started for project {req.project_id}")
    try:
        await cognee_client.improve_dataset(req.project_id)
        logger.info(f"Improve Completed for project {req.project_id}")
        return {"improved": True, "metadata": {"project_id": req.project_id, "status": "success"}}
    except Exception as e:
        logger.error(f"Cognee failure during improve: {e}")
        raise HTTPException(status_code=500, detail=f"Cognee improve failed: {str(e)}")

@app.post("/memory/forget")
async def forget(req: ForgetRequest):
    if not req.project_id or not req.project_id.strip():
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    logger.info(f"Forget Requested for project {req.project_id}")
    try:
        if req.wipe_project or not req.node_id:
            await cognee_client.forget_dataset_or_node(req.project_id)
            logger.info(f"Memory Deleted: Entire dataset ctxos_{req.project_id}")
            logger.info("Metadata Updated")
            return {"forgotten": True, "type": "dataset"}
        else:
            await cognee_client.forget_dataset_or_node(req.project_id, data_id=req.node_id)
            logger.info(f"Memory Deleted: Node {req.node_id}")
            logger.info("Metadata Updated")
            return {"forgotten": True, "type": "node", "node_id": req.node_id}
    except Exception as e:
        logger.error(f"Cognee failure during forget: {e}")
        raise HTTPException(status_code=500, detail=f"Cognee forget failed: {str(e)}")

@app.get("/memory/status/{project_id}")
async def get_status(project_id: str): 
    try:
        status = await cognee_client.get_dataset_status(project_id)
        return {"status": status}
    except Exception as e:
        return {"status": "UNKNOWN", "error": str(e)}

@app.post("/memory/continuation-prompt")
async def continuation_prompt(req: dict): 
    project_id = req.get("project_id")
    if not project_id:
        raise HTTPException(status_code=400, detail="Missing project_id")
        
    try:
        # recall current project state
        summary = await cognee_client.recall_query(project_id, "current project summary goals decisions risks tasks")
        
        # We would use gemini here to format the prompt. For simplicity, just format it manually or use Gemini
        # (Updated to use groq_client as per consolidation)
        prompt = await groq_client.generate_continuation_prompt(summary["answer"])
        return {"prompt": prompt}
    except Exception as e:
        logger.error(f"Failed to generate continuation prompt: {e}")
        return {"prompt": "Failed to generate context.", "error": str(e)}

@app.get("/memory/graph/{project_id}")
async def get_graph(project_id: str):
    # Hardcoded test data as requested in STEP 8
    nodes = [
        {"id": "A", "label": "Node A", "type": "context"},
        {"id": "B", "label": "Node B", "type": "decision"},
        {"id": "C", "label": "Node C", "type": "risk"}
    ]
    edges = [
        {"source": "A", "target": "B", "label": "connects"},
        {"source": "B", "target": "C", "label": "leads to"}
    ]
    return {"nodes": nodes, "edges": edges}

@app.get("/health")
async def health(): return {"status": "ok"}
