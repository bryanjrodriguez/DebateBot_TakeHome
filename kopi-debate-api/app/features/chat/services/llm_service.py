from __future__ import annotations

import google.generativeai as genai
from typing import Any, Dict, List
from pydantic import ValidationError

from app.core.config import get_settings
from app.features.chat.models.chat_meta import ChatMeta
from app.features.chat.prompts.debate_prompts import build_meta_extraction_prompt, build_debate_system_prompt

settings = get_settings()
genai.configure(api_key=settings.GOOGLE_API_KEY)

class LLMService:
    def __init__(self) -> None:
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)

    def extract_meta_from_message(self, message: str) -> ChatMeta:
       
        prompt = build_meta_extraction_prompt()
        chat = self.model.start_chat()
        
        
        full_prompt = f"{prompt}\n\nUser: {message}\nResponse:"
        response = chat.send_message(full_prompt)
        
        try:
            cleaned_response = self._clean_json_response(response.text)
            data = ChatMeta.model_validate_json(cleaned_response)
            if data.topic == "Unknown topic":  # Double-check we got a valid response
                raise ValidationError("Invalid topic", None)
            return data
        except (ValidationError, ValueError):
            
            try:
                retry_response = chat.send_message(
                    "Please respond with ONLY a JSON object in this exact format, with NO markdown formatting: "
                    '{"topic": "specific topic", "stance": "specific stance"}'
                )
                cleaned_retry = self._clean_json_response(retry_response.text)
                return ChatMeta.model_validate_json(cleaned_retry)
            except (ValidationError, ValueError):
                # Final fallback
                return ChatMeta(topic="Unknown topic", stance="No clear stance.")

    def generate_debate_response(
        self, 
        user_message: str, 
        chat_history: List[Dict[str, Any]], 
        topic: str, 
        stance: str
    ) -> str:
        
        system_prompt = build_debate_system_prompt(topic, stance)
        gemini_history = [
            {"role": "model", "parts": [system_prompt]},
            *({"role": "user" if m["role"] == "user" else "model", "parts": [m["message"]]}
              for m in reversed(chat_history))
        ]

        chat = self.model.start_chat(history=gemini_history)
        response = chat.send_message(user_message)
        return response.text.strip()

    def _clean_json_response(self, text: str) -> str:
        #remove markdown 
        return text.replace('```json', '').replace('```', '').strip() 