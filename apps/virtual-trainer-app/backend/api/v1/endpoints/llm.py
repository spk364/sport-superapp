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


class ChatRequest(BaseModel):
    """Запрос для чата с виртуальным тренером"""
    user_id: str = Field(..., description="ID пользователя")
    session_id: str = Field(..., description="ID сессии чата")
    message: str = Field(..., description="Сообщение пользователя")
    attachments: List[str] = Field(default=[], description="Список URL файлов")
    user_profile: Optional[UserProfile] = Field(default=None, description="Профиль пользователя для контекста")


class ChatResponse(BaseModel):
    """Ответ чата"""
    response_text: str = Field(..., description="Ответ виртуального тренера")
    session_id: str = Field(..., description="ID сессии")
    timestamp: datetime = Field(..., description="Время ответа")
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
    """
    try:
        logger.info(f"Получен чат запрос от пользователя {request.user_id}")
        logger.info(f"Профиль пользователя: {request.user_profile}")
        
        # TODO: Получить историю чата из БД
        chat_history = []  # История последних сообщений
        
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
        
        # Вызов LLM сервиса
        result = await llm_service.chat_with_virtual_trainer(
            user_message=request.message,
            chat_history=chat_history,
            user_context=user_context
        )
        
        # TODO: Сохранить сообщения в БД
        
        return ChatResponse(
            response_text=result["response"],
            session_id=request.session_id,
            timestamp=datetime.now(),
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
        result = await llm_service.generate_workout_program(client_data)
        
        # TODO: Сохранить программу в БД
        program_id = "generated-uuid"  # Заменить на реальный UUID из БД
        
        return ProgramResponse(
            program_id=program_id,
            program_structure=result["program"],
            generated_at=datetime.now(),
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
        logger.error(f"Ошибка создания программы: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка создания программы тренировок"
        )


@router.post("/program/adjust", response_model=ProgramResponse)
async def adjust_workout_program(request: ProgramAdjustRequest):
    """
    Корректировка тренировочной программы
    
    Адаптирует существующую программу на основе обратной связи
    и данных о прогрессе.
    """
    try:
        logger.info(f"Запрос на корректировку программы {request.program_id}")
        
        # TODO: Получить текущую программу из БД
        current_program = {
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
            ]
        }
        
        # Корректировка программы
        result = await llm_service.adjust_workout_program(
            current_program=current_program,
            feedback=request.feedback,
            progress_data=request.progress_data
        )
        
        # TODO: Обновить программу в БД
        
        return ProgramResponse(
            program_id=request.program_id,
            program_structure=result["program"],
            generated_at=datetime.now(),
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
        logger.error(f"Ошибка корректировки программы: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка корректировки программы"
        )


@router.post("/progress/analyze", response_model=ProgressAnalyzeResponse)
async def analyze_progress(request: ProgressAnalyzeRequest):
    """
    Анализ прогресса клиента
    
    Анализирует данные тренировок и физических показателей
    за указанный период и предоставляет рекомендации.
    """
    try:
        logger.info(f"Запрос на анализ прогресса пользователя {request.user_id}")
        
        # TODO: Получить данные клиента и период из БД
        client_data = {
            "name": "Клиент",
            "goals": ["снижение веса"],
            "current_metrics": {"weight": 80, "body_fat": 20}
        }
        
        period_data = {
            "workouts_completed": 12,
            "average_duration": 45,
            "weight_change": -3,
            "strength_improvements": {
                "bench_press": 10,
                "squat": 15
            }
        }
        
        # Анализ прогресса
        result = await llm_service.analyze_progress(
            client_data=client_data,
            period_data=period_data
        )
        
        # TODO: Сохранить отчет в БД
        
        return ProgressAnalyzeResponse(
            report=result["analysis"],
            generated_at=datetime.now(),
            metadata=result.get("metadata")
        )
        
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Ошибка анализа прогресса: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка анализа прогресса"
        )


@router.post("/notifications/create", response_model=NotificationResponse)
async def create_notification(request: NotificationCreateRequest):
    """
    Создание персонализированного уведомления
    
    Генерирует персонализированные уведомления и напоминания
    с учетом контекста пользователя.
    """
    try:
        logger.info(f"Запрос на создание уведомления для пользователя {request.user_id}")
        
        # Генерация уведомления
        result = await llm_service.generate_notification(
            notification_type=request.type,
            user_context=request.context
        )
        
        # TODO: Сохранить уведомление в БД и запланировать отправку
        notification_id = "notification-uuid"
        
        return NotificationResponse(
            notification_id=notification_id,
            message=result["message"],
            scheduled_at=datetime.now(),
            metadata=result.get("metadata")
        )
        
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Ошибка создания уведомления: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка создания уведомления"
        )


@router.get("/status")
async def llm_service_status():
    """
    Проверка статуса LLM сервиса
    """
    return {
        "status": "operational",
        "model": llm_service.model,
        "timestamp": datetime.now()
    } 