from typing import TypeVar, Generic, Optional, Union
from pydantic import BaseModel
from datetime import datetime

T = TypeVar('T')

class ChatMessageResponse(BaseModel):
    conversation_id: str
    message: str
    created_at: datetime

class ChatSummary(BaseModel):
    conversation_id: str
    topic: str
    created_at: datetime

class DeleteResponse(BaseModel):
    message: str = "Chat deleted" 