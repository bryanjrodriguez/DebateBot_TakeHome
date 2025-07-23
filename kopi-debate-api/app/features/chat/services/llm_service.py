from __future__ import annotations

import google.generativeai as genai
from typing import Any, Dict, List
from pydantic import ValidationError
import google.api_core.exceptions

from app.core.config import get_settings
from app.features.chat.models.chat_meta import ChatMeta
from app.features.chat.prompts.debate_prompts import build_meta_extraction_prompt, build_debate_system_prompt
from app.core.errors import Result

settings = get_settings()
genai.configure(api_key=settings.GOOGLE_API_KEY)

class LLMService:
    def __init__(self) -> None:
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)

    def extract_meta_from_message(self, message: str) -> Result[ChatMeta]:
        try:
            prompt = build_meta_extraction_prompt()
            chat = self.model.start_chat()
            
            full_prompt = f"{prompt}\n\nUser: {message}\nResponse:"
            response = chat.send_message(full_prompt)
            
           
            cleaned_response = self._clean_json_response(response.text)
            data = ChatMeta.model_validate_json(cleaned_response)

            if data.topic == "INVALID" or data.stance == "INVALID":
                return Result.fail("Could not extract valid topic and stance from message")
            
            return Result.ok(data)
        except google.api_core.exceptions.GoogleAPIError as e:
            return Result.fail(f"Gemini API error: {str(e)}")
        except Exception as e:
            return Result.fail(f"Unexpected error during meta extraction: {str(e)}")

    def generate_debate_response(
        self, 
        user_message: str, 
        chat_history: List[Dict[str, Any]], 
        topic: str, 
        stance: str
    ) -> Result[str]:
        try:
            system_prompt = build_debate_system_prompt(topic, stance)
            gemini_history = [
                {"role": "model", "parts": [system_prompt]},
                *({"role": "user" if m["role"] == "user" else "model", "parts": [m["message"]]}
                  for m in reversed(chat_history))
            ]

            chat = self.model.start_chat(history=gemini_history)
            response = chat.send_message(user_message)
            return Result.ok(response.text.strip())
        except google.api_core.exceptions.GoogleAPIError as e:
            return Result.fail(f"Gemini API error: {str(e)}")
        except Exception as e:
            return Result.fail(f"Unexpected error during response generation: {str(e)}")

    def _clean_json_response(self, text: str) -> str:
        #remove markdown 
        return text.replace('```json', '').replace('```', '').strip() 