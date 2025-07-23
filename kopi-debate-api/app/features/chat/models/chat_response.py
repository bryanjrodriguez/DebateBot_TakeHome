from typing import TypeVar, Generic, Optional, Union, List
from pydantic import BaseModel
from datetime import datetime
from .chat_message import ChatMessage, ChatMessageHistory

T = TypeVar('T')

class ChatMessageResponse(BaseModel):
    conversation_id: str
    message: List[ChatMessage]

class ChatHistoryResponse(BaseModel):
    conversation_id: str
    message: List[ChatMessageHistory]

class ChatSummary(BaseModel):
    conversation_id: str
    topic: str
    created_at: datetime

class DeleteResponse(BaseModel):
    message: str = "Chat deleted" 