from dependency_injector import containers, providers
from app.features.chat.repositories.chat_repository import ChatRepository
from app.features.chat.services.chat_service import ChatService
from app.features.chat.services.llm_service import LLMService

class Container(containers.DeclarativeContainer):
    chat_repository = providers.Factory(ChatRepository)
    llm_service = providers.Factory(LLMService)
    chat_service = providers.Factory(
        ChatService, 
        repository=chat_repository,
        llm_service=llm_service
    ) 