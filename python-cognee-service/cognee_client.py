import cognee
import asyncio
import time
from cognee.modules.search.types import SearchType
from schemas import ContextOSGraph
from config import config
from memory_units import MemoryUnit

async def init_cognee():
    """Initialize Cognee Cloud connection."""
    url = config.cognee_cloud_url
    api_key = config.cognee_api_key
    # Assuming cognee.serve is the correct initialization for cloud
    if hasattr(cognee, "serve"):
        try:
            await cognee.serve(url=url, api_key=api_key)
        except Exception as e:
            print(f"Warning: cognee.serve failed or is mock: {e}")
            pass
            
    if hasattr(cognee.config, "set_embedding_provider"):
        cognee.config.set_embedding_provider("fastembed")

def format_unit_to_statement(unit: MemoryUnit) -> str:
    """Convert typed unit into natural language statement to bias Cognee extraction."""
    base = f"{unit.type.upper()}: {unit.content}."
    if unit.rationale:
        base += f" RATIONALE: {unit.rationale}."
    if unit.considered_alternatives:
        alts = ", ".join(unit.considered_alternatives)
        base += f" CONSIDERED AND REJECTED: {alts}."
    if unit.relates_to:
        relates = ", ".join(unit.relates_to)
        base += f" RELATES TO: {relates}."
    base += f" STATUS: {unit.status}."
    if unit.source:
        base += f" SOURCE: {unit.source}."
    return base

async def remember_unit(project_id: str, statement: str) -> None:
    """Send a templated natural language statement to cognee.remember()"""
    dataset_name = f"ctxos_{project_id}"
    await cognee.remember(
        data=statement,
        dataset_name=dataset_name,
        graph_model=ContextOSGraph,
        self_improvement=True,
        run_in_background=True
    )

async def recall_query(project_id: str, query: str) -> dict:
    dataset_name = f"ctxos_{project_id}"
    
    start_time = time.time()
    
    try:
        chunks = await cognee.search(
            query_text=query,
            query_type=SearchType.CHUNKS,
            datasets=[dataset_name],
            only_context=True
        )
        context_string = ""
        if chunks and isinstance(chunks, list) and len(chunks) > 0 and "search_result" in chunks[0]:
            context_string = chunks[0]["search_result"]
    except Exception as e:
        print(f"[RECALL] Cognee raw retrieval failed: {e}")
        context_string = ""
    
    latency = time.time() - start_time
    print(f"[RECALL] Cognee raw retrieval latency: {latency:.2f}s")
    
    return {
        "answer": context_string,
        "path": []
    }
async def improve_dataset(project_id: str) -> None:
    dataset_name = f"ctxos_{project_id}"
    try:
        await cognee.improve(dataset_name=dataset_name)
    except Exception as e:
        raise RuntimeError(f"Cognee improve failed: {e}")

async def forget_dataset_or_node(project_id: str, data_id: str = None) -> None:
    dataset_name = f"ctxos_{project_id}"
    try:
        if data_id:
            await cognee.forget(dataset=dataset_name, data_id=data_id)
        else:
            await cognee.forget(dataset=dataset_name)
    except Exception as e:
        raise RuntimeError(f"Cognee forget failed: {e}")

async def get_dataset_status(project_id: str) -> str:
    return "DATASET_PROCESSING_COMPLETED"
