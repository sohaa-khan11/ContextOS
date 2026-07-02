import hashlib

def generate_content_hash(text: str) -> str:
    """Generate a SHA-256 hash of the raw text for deduplication."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

# TODO: Add function to query Next.js/Postgres to verify if the hash exists
