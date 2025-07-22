from fastapi import APIRouter, HTTPException, Query
from app.features.chat.models.chat_request import ChatMessageRequest
from app.features.chat.models.chat_response import ChatMessageResponse, ChatSummary
from app.core.container import Container
from typing import List

router = APIRouter()
container = Container()
chat_service = container.chat_service()

@router.post("/chat/message", response_model=ChatMessageResponse)
def post_message(request: ChatMessageRequest):
    return chat_service.post_message(request.conversation_id, request.message)

@router.get("/chat/chats", response_model=List[ChatSummary])
def get_chats():
    chats = chat_service.get_chats()
    return [
        ChatSummary(
            conversation_id=chat["conversation_id"],
            topic=chat["topic"],
            created_at=chat["created_at"]
        ) for chat in chats
    ]

@router.get("/chat/history/{conversation_id}")
def get_history(conversation_id: str, limit: int = Query(5, ge=1)):
    return {"conversation_id": conversation_id, "message": chat_service.get_history(conversation_id, limit=limit, desc=False)}

@router.delete("/chat/{conversation_id}")
def delete_chat(conversation_id: str):
    chat_service.delete_chat(conversation_id)
    return {"message": "Chat deleted"} 