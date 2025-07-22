from dependency_injector import containers, providers
from app.features.chat.repositories.chat_repository import ChatRepository
from app.features.chat.services.chat_service import ChatService

class Container(containers.DeclarativeContainer):
    chat_repository = providers.Factory(ChatRepository)
    chat_service = providers.Factory(ChatService, repository=chat_repository) 