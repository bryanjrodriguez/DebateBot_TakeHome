from pydantic import BaseModel


class ChatMeta(BaseModel):
    topic: str
    stance: str