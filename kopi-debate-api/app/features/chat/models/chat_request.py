from pydantic import BaseModel
from typing import Optional

class ChatMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str 