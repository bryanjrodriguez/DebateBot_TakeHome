import pytest
from unittest.mock import Mock, patch
from app.core.container import Container
from app.features.chat.models.chat_meta import ChatMeta
from app.features.chat.services.chat_service import ChatService


def get_container_override():
    container = Container()
    container.chat_repository.override(Mock())
    container.llm_service.override(Mock())
    container.chat_service.override(Mock())
    return container

@pytest.fixture(autouse=True)
def override_container():
    with patch('app.core.container.Container', return_value=get_container_override()):
        yield

@pytest.fixture
def fake_repo():
    repo = Mock()
    repo.get_conversation_meta.return_value = None
    repo.save_conversation_meta.return_value = None
    repo.save_message.return_value = None
    repo.get_messages.return_value = []
    repo.get_chats.return_value = []
    repo.delete_chat.return_value = None
    return repo

@pytest.fixture
def fake_llm():
    llm = Mock()
    llm.extract_meta_from_message.return_value = \
        Mock(_is_error=False, _value=ChatMeta(topic="Moon landing", stance="was faked"))
    llm.generate_debate_response.return_value = \
        Mock(_is_error=False, _value="Sure, the flag shouldn't wave!")
    return llm

@pytest.fixture
def chat_service(fake_repo, fake_llm):
    return ChatService(repository=fake_repo, llm_service=fake_llm)

