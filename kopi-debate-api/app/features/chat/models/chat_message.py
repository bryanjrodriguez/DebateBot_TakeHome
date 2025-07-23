from pydantic import BaseModel
from typing import Literal
from datetime import datetime

class ChatMessage(BaseModel):
    role: Literal["user", "bot"]
    message: str

class ChatMessageHistory(ChatMessage):
    id: str
    conversation_id: str
    created_at: datetime


    