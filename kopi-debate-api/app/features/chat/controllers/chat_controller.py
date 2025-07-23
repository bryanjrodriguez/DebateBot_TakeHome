from fastapi import APIRouter, Query, Depends
from app.features.chat.models.chat_request import ChatMessageRequest
from app.features.chat.models.chat_response import ChatMessageResponse, ChatHistoryResponse, ChatSummary, DeleteResponse
from app.core.container import Container
from app.core.respose_handler import handle_result
from app.features.chat.services.chat_service import ChatService
from typing import List

router = APIRouter()
container = Container()

def get_chat_service() -> ChatService:
    return container.chat_service()

@router.post("/chat/message", response_model=ChatMessageResponse)
def post_message(request: ChatMessageRequest, chat_service: ChatService = Depends(get_chat_service)):
    return handle_result(lambda: chat_service.post_message(request.conversation_id, request.message))

@router.get("/chat/chats", response_model=List[ChatSummary])
def get_chats(chat_service: ChatService = Depends(get_chat_service)):
    return handle_result(lambda: chat_service.get_chats())

@router.get("/chat/history/{conversation_id}", response_model=ChatHistoryResponse)
def get_history(conversation_id: str, limit: int = Query(5, ge=1), chat_service: ChatService = Depends(get_chat_service)):
    return handle_result(lambda: chat_service.get_history(conversation_id, limit=limit, desc=False))

@router.delete("/chat/{conversation_id}", response_model=DeleteResponse)
def delete_chat(conversation_id: str, chat_service: ChatService = Depends(get_chat_service)):
    return handle_result(lambda: chat_service.delete_chat(conversation_id)) 