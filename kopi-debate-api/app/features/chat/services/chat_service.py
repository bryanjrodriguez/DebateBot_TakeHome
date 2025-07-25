from __future__ import annotations

import logging
import uuid
from typing import List

from app.core.config import get_settings
from app.features.chat.repositories.chat_repository import ChatRepository
from app.features.chat.services.llm_service import LLMService
from app.core.errors import Result
from app.features.chat.models.chat_response import ChatMessageResponse, ChatSummary, DeleteResponse
from app.features.chat.models.chat_message import ChatMessage, ChatMessageHistory
from app.features.chat.models.chat_response import ChatHistoryResponse

settings = get_settings()

class ChatService:
    def __init__(self, repository: ChatRepository, llm_service: LLMService) -> None:
        self.repository = repository
        self.llm_service = llm_service
        self.max_history = settings.CHAT_HISTORY_WINDOW

    def post_message(
        self,
        conversation_id: str | None,
        message: str,
    ) -> Result[ChatMessageResponse]:
        try:
            conversation_id = conversation_id or str(uuid.uuid4())
            
            # Get or create conversation metadata
            meta = self.repository.get_conversation_meta(conversation_id)
            if not meta:
                meta_result = self.llm_service.extract_meta_from_message(message)
                if meta_result._is_error:
                    error_msg = f"Failed to extract conversation metadata: {meta_result._value.error}"
                    logging.error(f"Error in conversation {conversation_id}: {error_msg}")
                    return Result.fail(error_msg)
                
                meta_obj = meta_result._value
                self.repository.save_conversation_meta(
                    conversation_id=conversation_id,
                    topic=meta_obj.topic,
                    stance=meta_obj.stance
                )
                meta = {"topic": meta_obj.topic, "stance": meta_obj.stance}

            self.repository.save_message(conversation_id, "user", message)
            
            history = self.repository.get_messages(conversation_id, limit=self.max_history, desc=True)
            
            bot_reply_result = self.llm_service.generate_debate_response(
                user_message=message,
                chat_history=history,
                topic=meta["topic"],
                stance=meta["stance"]
            )
            
            if bot_reply_result._is_error:
                error_msg = f"Failed to generate bot response: {bot_reply_result._value.error}"
                logging.error(f"Error in conversation {conversation_id}: {error_msg}")
                return Result.fail(error_msg)
            
            bot_reply = bot_reply_result._value
            self.repository.save_message(conversation_id, "bot", bot_reply)
            
            # Get the 5 most recent messages after saving the bot reply
            recent_messages = self.repository.get_messages(conversation_id, limit=5, desc=True)
            messages = [
                ChatMessage(role=msg["role"], message=msg["message"])
                for msg in recent_messages 
            ]
            
            return Result.ok(ChatMessageResponse(
                conversation_id=conversation_id,
                message=messages
            ))
        except Exception as e:
            logging.error(f"Failed to process message for conversation {conversation_id}: {str(e)}", exc_info=True)
            return Result.fail(f"Failed to process message: {str(e)}")

    def get_chats(self) -> Result[List[ChatSummary]]:
        try:
            chats = self.repository.get_chats()
            return Result.ok([
                ChatSummary(
                    conversation_id=chat["conversation_id"],
                    topic=chat["topic"],
                    created_at=chat["created_at"]
                ) for chat in chats
            ])
        except Exception as e:
            logging.error(f"Failed to fetch chats: {str(e)}", exc_info=True)
            return Result.fail(f"Failed to fetch chats: {str(e)}")

    def get_history(self, conversation_id: str, limit: int = 5, desc: bool = False) -> Result[ChatHistoryResponse]:
        try:
            messages = self.repository.get_messages(conversation_id, limit=limit, desc=desc)
            formatted_messages = [
                ChatMessageHistory(
                    id=str(msg["id"]),
                    conversation_id=msg["conversation_id"],
                    message=msg["message"],
                    role=msg["role"],
                    created_at=msg["created_at"]
                ) for msg in messages
            ]
            return Result.ok(ChatHistoryResponse(
                conversation_id=conversation_id,
                message=formatted_messages
            ))
        except Exception as e:
            logging.error(f"Failed to fetch chat history for {conversation_id}: {str(e)}", exc_info=True)
            return Result.fail(f"Failed to fetch chat history: {str(e)}")

    def delete_chat(self, conversation_id: str) -> Result[DeleteResponse]:
        try:
            self.repository.delete_chat(conversation_id)
            return Result.ok(DeleteResponse())
        except Exception as e:
            logging.error(f"Failed to delete chat {conversation_id}: {str(e)}", exc_info=True)
            return Result.fail(f"Failed to delete chat: {str(e)}")
