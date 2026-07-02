import hashlib
from supabase import create_client, Client
from config import config

supabase: Client = create_client(config.supabase_url, config.supabase_key)

def generate_content_hash(text: str) -> str:
    """Generate a SHA-256 hash of the raw text for deduplication."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def is_duplicate(project_id: str, text_hash: str) -> bool:
    """Check if the given content hash exists for the given project in Supabase."""
    response = supabase.table("capture_hashes").select("id").eq("project_id", project_id).eq("hash", text_hash).execute()
    return len(response.data) > 0

def store_hash(project_id: str, text_hash: str) -> None:
    """Store the content hash in Supabase after successful ingestion."""
    supabase.table("capture_hashes").insert({"project_id": project_id, "hash": text_hash}).execute()
