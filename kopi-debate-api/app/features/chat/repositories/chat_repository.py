from app.core.db import supabase
from typing import List, Dict, Any, Optional

class ChatRepository:
    def save_conversation_meta(self, conversation_id: str, topic: str, stance: str) -> None:
        data = {
            "conversation_id": conversation_id,
            "topic": topic,
            "stance": stance
        }
        supabase.table("conversations").insert(data).execute()

    def get_conversation_meta(self, conversation_id: str) -> Optional[Dict[str, str]]:
        res = supabase.table("conversations").select("topic, stance").eq("conversation_id", conversation_id).execute()
        return res.data[0] if res.data else None

    def save_message(self, conversation_id: str, role: str, message: str):
        data = {
            "conversation_id": conversation_id,
            "role": role,
            "message": message
        }
        supabase.table("chat_messages").insert(data).execute()

    def get_messages(self, conversation_id: str, limit: int = 5, desc: bool = True) -> List[Dict[str, Any]]:
        query = supabase.table("chat_messages").select("*").eq("conversation_id", conversation_id)
        query = query.order("created_at", desc=desc).limit(limit)
        res = query.execute()
        return res.data or []

    def get_chats(self) -> List[Dict[str, Any]]:
        res = supabase.table("conversations").select("conversation_id, topic, created_at").order("created_at", desc=True).execute()
        return res.data or []

    def delete_chat(self, conversation_id: str):
        supabase.table("conversations").delete().eq("conversation_id", conversation_id).execute() 