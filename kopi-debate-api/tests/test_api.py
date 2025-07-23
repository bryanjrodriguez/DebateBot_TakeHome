import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import Mock
from app.features.chat.controllers.chat_controller import get_chat_service
from app.features.chat.models.chat_message import ChatMessage
from app.features.chat.models.chat_response import ChatMessageResponse
from app.features.chat.services.chat_service import ChatService
from app.core.errors import Result

@pytest.fixture
def mock_chat_service():
    service = Mock(spec=ChatService)
    response = ChatMessageResponse(
        conversation_id="123",
        message=[ChatMessage(role="bot", message="Hello")]
    )
    service.post_message.return_value = Result.ok(response)
    return service

@pytest.fixture
def test_client(mock_chat_service):
    app.dependency_overrides[get_chat_service] = lambda: mock_chat_service
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_post_message_endpoint(test_client):
    request_payload = {"conversation_id": None, "message": "hi"}
    expected_response_data = {
        "conversation_id": "123",
        "message": [{"role": "bot", "message": "Hello"}]
    }
    response = test_client.post("/api/v1/chat/message", json=request_payload)
    assert response.status_code == 200
    assert response.json() == expected_response_data
