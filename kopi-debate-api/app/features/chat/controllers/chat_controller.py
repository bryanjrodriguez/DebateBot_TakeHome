from fastapi import APIRouter, Query
from app.features.chat.models.chat_request import ChatMessageRequest
from app.features.chat.models.chat_response import ChatMessageResponse, ChatHistoryResponse, ChatSummary, DeleteResponse
from app.core.container import Container
from app.core.respose_handler import handle_result
from typing import List

router = APIRouter()
container = Container()
chat_service = container.chat_service()

@router.post("/chat/message", response_model=ChatMessageResponse)
def post_message(request: ChatMessageRequest):
    return handle_result(lambda: chat_service.post_message(request.conversation_id, request.message))

@router.get("/chat/chats", response_model=List[ChatSummary])
def get_chats():
    return handle_result(lambda: chat_service.get_chats())

@router.get("/chat/history/{conversation_id}", response_model=ChatHistoryResponse)
def get_history(conversation_id: str, limit: int = Query(5, ge=1)):
    return handle_result(lambda: chat_service.get_history(conversation_id, limit=limit, desc=False))

@router.delete("/chat/{conversation_id}", response_model=DeleteResponse)
def delete_chat(conversation_id: str):
    return handle_result(lambda: chat_service.delete_chat(conversation_id)) 