"""
LLM эндпоинты для Virtual Trainer
Реализация всех эндпоинтов согласно техническому заданию
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from loguru import logger

from backend.services.llm_service import llm_service
from backend.core.exceptions import LLMServiceError, ValidationError

router = APIRouter()


# Pydantic модели для запросов и ответов
class UserProfile(BaseModel):
    """Профиль пользователя для контекста чата"""
    age: Optional[int] = Field(default=None, description="Возраст")
    gender: Optional[str] = Field(default=None, description="Пол")
    height: Optional[int] = Field(default=None, description="Рост в см")
    weight: Optional[int] = Field(default=None, description="Вес в кг")
    goals: Optional[List[str]] = Field(default=None, description="Цели тренировок")
    fitness_level: Optional[str] = Field(default=None, description="Уровень подготовки")
    equipment: Optional[List[str]] = Field(default=None, description="Доступное оборудование")
    limitations: Optional[List[str]] = Field(default=None, description="Ограничения")
    nutrition_goal: Optional[str] = Field(default=None, description="Цель питания")
    food_preferences: Optional[List[str]] = Field(default=None, description="Пищевые предпочтения")
    allergies: Optional[List[str]] = Field(default=None, description="Аллергии")


class ConversationMessage(BaseModel):
    """Сообщение в истории разговора"""
    role: str = Field(..., description="Роль отправителя: user, assistant, system")
    content: str = Field(..., description="Содержимое сообщения")
    timestamp: Optional[str] = Field(default=None, description="Временная метка")


class ContextSettings(BaseModel):
    """Настройки контекста для чата"""
    include_recent_messages: int = Field(default=8, description="Количество последних сообщений")
    include_session_summary: bool = Field(default=True, description="Включать ли сводку сессии")
    max_context_tokens: int = Field(default=3000, description="Максимальное количество токенов контекста")


class ChatRequest(BaseModel):
    """Запрос для чата с виртуальным тренером"""
    user_id: str = Field(..., description="ID пользователя")
    session_id: str = Field(..., description="ID сессии чата")
    message: str = Field(..., description="Сообщение пользователя")
    conversation_history: Optional[List[ConversationMessage]] = Field(default=None, description="История разговора")
    attachments: List[str] = Field(default=[], description="Список URL файлов")
    user_profile: Optional[UserProfile] = Field(default=None, description="Профиль пользователя для контекста")
    context_settings: Optional[ContextSettings] = Field(default=None, description="Настройки контекста")


class ChatResponse(BaseModel):
    """Ответ чата"""
    response_text: str = Field(..., description="Ответ виртуального тренера")
    session_id: str = Field(..., description="ID сессии")
    timestamp: datetime = Field(..., description="Время ответа")
    used_rag: Optional[bool] = Field(default=False, description="Использовались ли RAG инструменты")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Метаданные")


class ProgramCreateRequest(BaseModel):
    """Запрос на создание программы"""
    user_id: str = Field(..., description="ID пользователя")
    goal: str = Field(..., description="Цель тренировок")
    level: str = Field(..., description="Уровень подготовки")
    equipment: List[str] = Field(default=[], description="Доступное оборудование")
    sessions_per_week: int = Field(..., description="Количество тренировок в неделю")
    limitations: List[str] = Field(default=[], description="Ограничения")


class ProgramResponse(BaseModel):
    """Ответ с программой тренировок"""
    program_id: str = Field(..., description="ID программы")
    program_structure: Dict[str, Any] = Field(..., description="Структура программы")
    generated_at: datetime = Field(..., description="Время генерации")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Метаданные")


class ProgramAdjustRequest(BaseModel):
    """Запрос на корректировку программы"""
    user_id: str = Field(..., description="ID пользователя")
    program_id: str = Field(..., description="ID программы")
    feedback: str = Field(..., description="Обратная связь")
    progress_data: Optional[Dict[str, Any]] = Field(default=None, description="Данные прогресса")


class ProgressAnalyzeRequest(BaseModel):
    """Запрос на анализ прогресса"""
    user_id: str = Field(..., description="ID пользователя")
    date_from: str = Field(..., description="Дата начала периода")
    date_to: str = Field(..., description="Дата окончания периода")


class ProgressAnalyzeResponse(BaseModel):
    """Ответ с анализом прогресса"""
    report: Dict[str, Any] = Field(..., description="Отчет о прогрессе")
    generated_at: datetime = Field(..., description="Время генерации")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Метаданные")


class NotificationCreateRequest(BaseModel):
    """Запрос на создание уведомления"""
    user_id: str = Field(..., description="ID пользователя")
    type: str = Field(..., description="Тип уведомления")
    context: Dict[str, Any] = Field(..., description="Контекст уведомления")


class NotificationResponse(BaseModel):
    """Ответ с уведомлением"""
    notification_id: str = Field(..., description="ID уведомления")
    message: str = Field(..., description="Текст уведомления")
    scheduled_at: Optional[datetime] = Field(default=None, description="Время планируемой отправки")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Метаданные")


@router.post("/chat/send", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest):
    """
    Отправка сообщения виртуальному тренеру
    
    Эндпоинт для реализации чат-бота согласно ТЗ.
    Обрабатывает текстовые сообщения и возвращает ответ виртуального тренера.
    Поддерживает RAG для доступа к истории разговоров.
    """
    try:
        logger.info(f"Получен чат запрос от пользователя {request.user_id}")
        logger.info(f"Профиль пользователя: {request.user_profile}")
        logger.info(f"Получена история разговора: {len(request.conversation_history or [])} сообщений")
        
        # Используем историю разговора из frontend или получаем из БД
        chat_history = []
        if request.conversation_history:
            # Конвертируем историю в формат, ожидаемый LLM сервисом
            chat_history = [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp
                }
                for msg in request.conversation_history
            ]
            logger.info(f"Используем историю из frontend: {len(chat_history)} сообщений")
        else:
            # Fallback - получить историю из БД (если реализовано)
            logger.info("История из frontend не предоставлена, используем пустую историю")
        
        # Создаем контекст пользователя из переданного профиля
        user_context = {}
        if request.user_profile:
            # Основные физические характеристики
            if request.user_profile.age:
                user_context["age"] = request.user_profile.age
            if request.user_profile.gender:
                user_context["gender"] = request.user_profile.gender
            if request.user_profile.height:
                user_context["height"] = f"{request.user_profile.height} см"
            if request.user_profile.weight:
                user_context["weight"] = f"{request.user_profile.weight} кг"
            
            # Фитнес-цели и уровень
            if request.user_profile.goals:
                user_context["goals"] = request.user_profile.goals
            if request.user_profile.fitness_level:
                user_context["fitness_level"] = request.user_profile.fitness_level
            
            # Оборудование и ограничения
            if request.user_profile.equipment:
                user_context["equipment"] = request.user_profile.equipment
            if request.user_profile.limitations:
                user_context["limitations"] = request.user_profile.limitations
            
            # Питание
            if request.user_profile.nutrition_goal:
                user_context["nutrition_goal"] = request.user_profile.nutrition_goal
            if request.user_profile.food_preferences:
                user_context["food_preferences"] = request.user_profile.food_preferences
            if request.user_profile.allergies:
                user_context["allergies"] = request.user_profile.allergies
        
        # Вызов LLM сервиса с параметрами для RAG
        result = await llm_service.chat_with_virtual_trainer(
            user_message=request.message,
            chat_history=chat_history,
            user_context=user_context,
            user_id=request.user_id,
            session_id=request.session_id
        )
        
        # TODO: Сохранить сообщения в БД
        
        return ChatResponse(
            response_text=result["response"],
            session_id=request.session_id,
            timestamp=datetime.now(),
            used_rag=result.get("used_rag", False),
            metadata=result.get("metadata")
        )
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Ошибка в чате: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка сервера"
        )


@router.post("/program/create", response_model=ProgramResponse)
async def create_workout_program(request: ProgramCreateRequest):
    """
    Генерация тренировочной программы
    
    Создает персонализированную программу тренировок на основе
    целей, уровня подготовки и доступного оборудования.
    """
    try:
        logger.info(f"Запрос на создание программы для пользователя {request.user_id}")
        
        # Подготовка данных клиента
        client_data = {
            "goal": request.goal,
            "level": request.level,
            "equipment": request.equipment,
            "sessions_per_week": request.sessions_per_week,
            "limitations": request.limitations
        }
        
        # Генерация программы
        program = await llm_service.generate_workout_program(client_data)
        
        return ProgramResponse(
            program_id=f"program_{request.user_id}_{int(datetime.now().timestamp())}",
            program_structure=program,
            generated_at=datetime.now()
        )
        
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Ошибка при создании программы: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось создать программу тренировок"
        )


@router.post("/program/adjust", response_model=ProgramResponse)
async def adjust_workout_program(request: ProgramAdjustRequest):
    """
    Корректировка тренировочной программы
    
    Адаптирует существующую программу на основе обратной связи
    и данных о прогрессе пользователя.
    """
    try:
        logger.info(f"Запрос на корректировку программы {request.program_id}")
        
        # TODO: Получить текущую программу из БД
        current_program = {"placeholder": "current_program_data"}
        
        # Корректировка программы
        adjusted_program = await llm_service.adjust_workout_program(
            current_program=current_program,
            feedback=request.feedback,
            progress_data=request.progress_data
        )
        
        return ProgramResponse(
            program_id=f"{request.program_id}_adjusted_{int(datetime.now().timestamp())}",
            program_structure=adjusted_program,
            generated_at=datetime.now()
        )
        
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Ошибка при корректировке программы: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось скорректировать программу"
        )


@router.post("/progress/analyze", response_model=ProgressAnalyzeResponse)
async def analyze_progress(request: ProgressAnalyzeRequest):
    """
    Анализ прогресса пользователя
    
    Анализирует данные тренировок и показатели за указанный период,
    выявляет тенденции и дает рекомендации.
    """
    try:
        logger.info(f"Анализ прогресса для пользователя {request.user_id}")
        
        # Подготовка данных
        client_data = {"user_id": request.user_id}
        period_data = {
            "date_from": request.date_from,
            "date_to": request.date_to
        }
        
        # Анализ прогресса
        analysis = await llm_service.analyze_progress(
            client_data=client_data,
            period_data=period_data
        )
        
        return ProgressAnalyzeResponse(
            report=analysis,
            generated_at=datetime.now()
        )
        
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Ошибка при анализе прогресса: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось проанализировать прогресс"
        )


@router.post("/notifications/create", response_model=NotificationResponse)
async def create_notification(request: NotificationCreateRequest):
    """
    Создание персонализированного уведомления
    
    Генерирует уведомление на основе типа и контекста пользователя.
    """
    try:
        logger.info(f"Создание уведомления для пользователя {request.user_id}")
        
        # Генерация уведомления
        notification = await llm_service.generate_notification(
            notification_type=request.type,
            user_context=request.context
        )
        
        return NotificationResponse(
            notification_id=f"notif_{request.user_id}_{int(datetime.now().timestamp())}",
            message=notification["message"],
            scheduled_at=notification.get("scheduled_at"),
            metadata=notification.get("metadata")
        )
        
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Ошибка при создании уведомления: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось создать уведомление"
        )


@router.get("/status")
async def llm_service_status():
    """
    Проверка статуса LLM сервиса
    
    Возвращает информацию о доступности и настройках сервиса.
    """
    try:
        return {
            "status": "operational",
            "model": llm_service.model,
            "timestamp": datetime.now()
        }
    except Exception as e:
        logger.error(f"Ошибка проверки статуса LLM: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM сервис недоступен"
        ) 