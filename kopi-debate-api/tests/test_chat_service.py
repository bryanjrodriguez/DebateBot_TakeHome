from app.core.errors import Result
from app.features.chat.models.chat_message import ChatMessage
from app.features.chat.services.llm_service import LLMService
from unittest.mock import Mock
import uuid

def test_post_message_happy(chat_service, fake_repo, fake_llm):
    fake_repo.get_conversation_meta.return_value = None
    fake_llm.extract_meta_from_message.return_value = Mock(
        _is_error=False,
        _value=Mock(topic="Moon landing", stance="was faked")
    )
    fake_llm.generate_debate_response.return_value = Mock(
        _is_error=False,
        _value="The flag waved because of mechanical movement"
    )
    fake_repo.get_messages.return_value = [
        {"role": "user", "message": "Why did the flag wave?"},
        {"role": "bot", "message": "The flag waved because of mechanical movement"}
    ]

    res = chat_service.post_message(None, "Why did the flag wave?")
    assert res.ok
    assert not res._is_error
    assert res._value.conversation_id is not None
    assert len(res._value.message) == 2
    assert fake_repo.save_message.call_count == 2

def test_extract_meta_error(chat_service, fake_repo, fake_llm):
    fake_repo.get_conversation_meta.return_value = None
    fake_llm.extract_meta_from_message.return_value = Result.fail("Failed to extract metadata")
    
    res = chat_service.post_message(None, "hi")
    assert res._is_error
    assert "Failed to extract conversation metadata" in res._value.error

def test_get_history_ok(chat_service, fake_repo):
    fake_repo.get_messages.return_value = [
        {"role": "user", "message": "hi", "id": 1, "conversation_id": "c123", "created_at": "2024-01-01"}
    ]
    
    res = chat_service.get_history("c123")
    assert res.ok
    assert res._value.conversation_id == "c123"
    assert len(res._value.message) == 1
    assert res._value.message[0].message == "hi"

def test_clean_json_response():
    raw = "```json\n{\"topic\": \"A\", \"stance\": \"B\"}\n```"
    cleaned = LLMService()._clean_json_response(raw)
    assert cleaned == '{"topic": "A", "stance": "B"}'


