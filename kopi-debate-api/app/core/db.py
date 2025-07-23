from supabase import create_client, Client
from app.core.config import get_settings

settings = get_settings()
_supabase_client = None

def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client

# For backwards compatibility
supabase = get_supabase_client 