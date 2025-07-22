from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional

import google.generativeai as genai
from pydantic import  ValidationError

from app.core.config import get_settings
from app.features.chat.repositories.chat_repository import ChatRepository
from app.features.chat.prompts.debate_prompts import build_meta_extraction_prompt, build_debate_system_prompt
from app.features.chat.models.chat_meta import ChatMeta
settings = get_settings() 
genai.configure(api_key=settings.GOOGLE_API_KEY)

class ChatService:
    def __init__(self, repository: ChatRepository) -> None:
        self.repository = repository
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
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
            meta_obj = self._derive_meta_from_first_msg(message)
            self.repository.save_conversation_meta(
                conversation_id=conversation_id,
                topic=meta_obj.topic,
                stance=meta_obj.stance
            )
            meta = {"topic": meta_obj.topic, "stance": meta_obj.stance}

        self.repository.save_message(conversation_id, "user", message)
        bot_reply = self._generate_bot_reply(conversation_id, message, meta["topic"], meta["stance"])
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

    def _derive_meta_from_first_msg(self, first_msg: str) -> ChatMeta:
        prompt = build_meta_extraction_prompt()
        chat = self.model.start_chat()
        
        # Send the full prompt with the user's message
        full_prompt = f"{prompt}\n\nUser: {first_msg}\nResponse:"
        response = chat.send_message(full_prompt)

        print(f"Gemini Response: {response.text}")
        
        try:
            cleaned_response = self._clean_json_response(response.text)
            data = ChatMeta.model_validate_json(cleaned_response)
            print(f"Parsed Meta: {data}")  # Debug log
            if data.topic == "Unknown topic":  # Double-check we got a valid response
                raise ValidationError("Invalid topic", None)
            return data
        except (ValidationError, ValueError) as e:
            print(f"Validation Error: {e}")  # Debug log
            # Try one more time with explicit JSON request
            try:
                retry_response = chat.send_message(
                    "Please respond with ONLY a JSON object in this exact format, with NO markdown formatting: "
                    '{"topic": "specific topic", "stance": "specific stance"}'
                )
                print(f"Retry Response: {retry_response.text}")  # Debug log
                cleaned_retry = self._clean_json_response(retry_response.text)
                return ChatMeta.model_validate_json(cleaned_retry)
            except (ValidationError, ValueError):
                # Final fallback
                return ChatMeta(topic="Unknown topic", stance="No clear stance.")

    def _clean_json_response(self, text: str) -> str:

        #Remove markdown code blocks
        text = text.replace('```json', '').replace('```', '').strip()
        return text

    def _generate_bot_reply(self, conversation_id: str, user_message: str, topic: str, stance: str) -> str:
        history_records = self.repository.get_messages(conversation_id, limit=self.max_history, desc=True)
        system_prompt = build_debate_system_prompt(topic, stance)
        gemini_history = [
            {"role": "model", "parts": [system_prompt]},
            *({"role": "user" if m["role"] == "user" else "model", "parts": [m["message"]]}
              for m in reversed(history_records))
        ]

        chat = self.model.start_chat(history=gemini_history)
        response = chat.send_message(user_message)
        return response.text.strip()
