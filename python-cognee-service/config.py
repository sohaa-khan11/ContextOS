import os
from dotenv import load_dotenv

# Load from the root directory .env file
load_dotenv(dotenv_path="../.env")

def require_env_var(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value

class Config:
    @property
    def cognee_cloud_url(self) -> str:
        return require_env_var("COGNEE_CLOUD_URL")

    @property
    def cognee_api_key(self) -> str:
        return require_env_var("COGNEE_API_KEY")

    @property
    def groq_api_key(self) -> str:
        return require_env_var("GROQ_API_KEY")

    @property
    def supabase_url(self) -> str:
        return require_env_var("NEXT_PUBLIC_SUPABASE_URL")

    @property
    def supabase_key(self) -> str:
        return require_env_var("NEXT_PUBLIC_SUPABASE_ANON_KEY")

config = Config()
