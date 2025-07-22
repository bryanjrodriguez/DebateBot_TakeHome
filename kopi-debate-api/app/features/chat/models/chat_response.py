from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class ChatMessageResponse(BaseModel):
    conversation_id: str
    message: List[Dict[str, Any]]

class ChatSummary(BaseModel):
    conversation_id: str
    topic: str
    created_at: datetime 