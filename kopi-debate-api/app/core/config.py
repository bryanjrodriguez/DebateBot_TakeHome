import os
from functools import lru_cache

class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    PROJECT_NAME: str = "Kopi Debate API"
    API_PREFIX: str = "/api/v1"
    GEMINI_MODEL: str = "gemini-2.0-flash"
    CHAT_HISTORY_WINDOW: int = 5

@lru_cache
def get_settings():
    return Settings() 