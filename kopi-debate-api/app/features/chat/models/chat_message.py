from pydantic import BaseModel
from typing import Literal

class ChatMessage(BaseModel):
    role: Literal["user", "bot"]
    message: str 
    