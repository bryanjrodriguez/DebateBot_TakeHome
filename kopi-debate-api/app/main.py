from fastapi import FastAPI
from app.features.chat.controllers.chat_controller import router as chat_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(chat_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {"message": "Welcome to Kopi Debate API"} 