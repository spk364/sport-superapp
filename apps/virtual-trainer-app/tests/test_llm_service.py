"""
Тесты для LLM сервиса
"""

import pytest
from unittest.mock import AsyncMock, patch
from backend.services.llm_service import LLMService
from backend.core.exceptions import ValidationError, LLMServiceError


@pytest.fixture
def llm_service():
    """Фикстура LLM сервиса"""
    return LLMService()


@pytest.mark.asyncio
async def test_chat_with_virtual_trainer_empty_message(llm_service):
    """Тест валидации пустого сообщения"""
    with pytest.raises(ValidationError):
        await llm_service.chat_with_virtual_trainer("")


@pytest.mark.asyncio
async def test_generate_workout_program_missing_fields(llm_service):
    """Тест валидации обязательных полей для программы"""
    client_data = {"goal": "снижение веса"}  # Отсутствуют level и sessions_per_week
    
    with pytest.raises(ValidationError):
        await llm_service.generate_workout_program(client_data)


@pytest.mark.asyncio
async def test_adjust_workout_program_empty_feedback(llm_service):
    """Тест валидации пустой обратной связи"""
    current_program = {"weeks": []}
    
    with pytest.raises(ValidationError):
        await llm_service.adjust_workout_program(current_program, "")


@pytest.mark.asyncio
@patch('openai.ChatCompletion.acreate')
async def test_chat_with_virtual_trainer_success(mock_openai, llm_service):
    """Тест успешного чата с виртуальным тренером"""
    # Мокаем ответ OpenAI
    mock_response = AsyncMock()
    mock_response.choices = [AsyncMock()]
    mock_response.choices[0].message.content = "Отличный вопрос! Приседания нужно делать..."
    mock_response.usage.prompt_tokens = 50
    mock_response.usage.completion_tokens = 100
    mock_response.usage.total_tokens = 150
    mock_response.model = "gpt-4"
    
    mock_openai.return_value = mock_response
    
    # Выполняем тест
    result = await llm_service.chat_with_virtual_trainer(
        user_message="Как правильно делать приседания?",
        user_context={"goals": ["снижение веса"], "fitness_level": "начальный"}
    )
    
    # Проверяем результат
    assert "response" in result
    assert "metadata" in result
    assert result["metadata"]["tokens_used"] == 150
    assert "Отличный вопрос!" in result["response"]


@pytest.mark.asyncio
@patch('openai.ChatCompletion.acreate')
async def test_generate_workout_program_success(mock_openai, llm_service):
    """Тест успешной генерации программы тренировок"""
    # Мокаем ответ OpenAI с валидным JSON
    mock_response = AsyncMock()
    mock_response.choices = [AsyncMock()]
    mock_response.choices[0].message.content = '''
    {
        "program_id": "test-uuid",
        "weeks": [
            {
                "week_number": 1,
                "days": [
                    {
                        "day_of_week": "понедельник",
                        "workout_type": "силовая",
                        "exercises": [
                            {"name": "Приседания", "sets": 3, "reps": 12}
                        ]
                    }
                ]
            }
        ],
        "generated_at": "2024-01-01T12:00:00"
    }
    '''
    mock_response.usage.total_tokens = 200
    mock_response.model = "gpt-4"
    
    mock_openai.return_value = mock_response
    
    # Выполняем тест
    client_data = {
        "goal": "снижение веса",
        "level": "начальный",
        "sessions_per_week": 3,
        "equipment": ["гантели"],
        "limitations": []
    }
    
    result = await llm_service.generate_workout_program(client_data)
    
    # Проверяем результат
    assert "program" in result
    assert "metadata" in result
    assert "weeks" in result["program"]
    assert len(result["program"]["weeks"]) == 1
    assert result["program"]["weeks"][0]["week_number"] == 1


@pytest.mark.asyncio
@patch('openai.ChatCompletion.acreate')
async def test_openai_rate_limit_error(mock_openai, llm_service):
    """Тест обработки ошибки лимита OpenAI"""
    import openai
    
    # Мокаем ошибку лимита
    mock_openai.side_effect = openai.error.RateLimitError("Rate limit exceeded")
    
    # Проверяем, что выбрасывается правильное исключение
    with pytest.raises(LLMServiceError) as exc_info:
        await llm_service.chat_with_virtual_trainer("Тест")
    
    assert "лимит запросов" in str(exc_info.value)


@pytest.mark.asyncio
@patch('openai.ChatCompletion.acreate')
async def test_generate_notification_success(mock_openai, llm_service):
    """Тест успешной генерации уведомления"""
    # Мокаем ответ OpenAI
    mock_response = AsyncMock()
    mock_response.choices = [AsyncMock()]
    mock_response.choices[0].message.content = "Привет, Иван! Не забудь про тренировку сегодня в 19:00!"
    mock_response.usage.total_tokens = 50
    mock_response.model = "gpt-4"
    
    mock_openai.return_value = mock_response
    
    # Выполняем тест
    result = await llm_service.generate_notification(
        notification_type="workout_reminder",
        user_context={"name": "Иван", "next_workout": "19:00"}
    )
    
    # Проверяем результат
    assert "message" in result
    assert "metadata" in result
    assert "Иван" in result["message"]
    assert "19:00" in result["message"] 