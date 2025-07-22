from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional

from app.core.config import get_settings
from app.features.chat.repositories.chat_repository import ChatRepository
from app.features.chat.services.llm_service import LLMService

settings = get_settings()

class ChatService:
    def __init__(self, repository: ChatRepository, llm_service: LLMService) -> None:
        self.repository = repository
        self.llm_service = llm_service
        self.max_history = settings.CHAT_HISTORY_WINDOW

    def post_message(
        self,
        conversation_id: Optional[str],
        message: str,
    ) -> Dict[str, Any]:
        conversation_id = conversation_id or str(uuid.uuid4())
        
        # Get or create conversation metadata
        meta = self.repository.get_conversation_meta(conversation_id)
        if not meta:
            meta_obj = self.llm_service.extract_meta_from_message(message)
            self.repository.save_conversation_meta(
                conversation_id=conversation_id,
                topic=meta_obj.topic,
                stance=meta_obj.stance
            )
            meta = {"topic": meta_obj.topic, "stance": meta_obj.stance}

        self.repository.save_message(conversation_id, "user", message)
        
        
        history = self.repository.get_messages(conversation_id, limit=self.max_history, desc=True)
        
        
        bot_reply = self.llm_service.generate_debate_response(
            user_message=message,
            chat_history=history,
            topic=meta["topic"],
            stance=meta["stance"]
        )
        
        self.repository.save_message(conversation_id, "bot", bot_reply)

        
        history = self.repository.get_messages(conversation_id)
        formatted_history = [
            {"role": m["role"], "message": m["message"]} for m in history
        ]
        return {"conversation_id": conversation_id, "message": formatted_history}

    def get_chats(self) -> List[Dict[str, Any]]:
        return self.repository.get_chats()

    def get_history(self, conversation_id: str, limit: int = 5, desc: bool = False) -> List[Dict[str, Any]]:
        return self.repository.get_messages(conversation_id, limit=limit, desc=desc)

    def delete_chat(self, conversation_id: str) -> None:
        self.repository.delete_chat(conversation_id)
