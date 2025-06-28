"""
Workout/Session эндпоинты для календаря и управления тренировками
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from loguru import logger

router = APIRouter()


# Pydantic модели для workout API
class WorkoutBase(BaseModel):
    """Базовая модель тренировки"""
    name: str = Field(..., description="Название тренировки")
    type: str = Field(..., description="Тип тренировки")
    duration: int = Field(..., description="Продолжительность в минутах")
    location: str = Field(..., description="Место проведения")
    description: Optional[str] = Field(default=None, description="Описание тренировки")


class WorkoutCreate(WorkoutBase):
    """Модель для создания тренировки"""
    scheduled_at: datetime = Field(..., description="Время проведения")
    client_id: str = Field(..., description="ID клиента")
    trainer_id: Optional[str] = Field(default=None, description="ID тренера")


class WorkoutUpdate(BaseModel):
    """Модель для обновления тренировки"""
    name: Optional[str] = None
    type: Optional[str] = None
    duration: Optional[int] = None
    location: Optional[str] = None
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None


class TrainerInfo(BaseModel):
    """Информация о тренере для workout response"""
    id: str
    name: str
    avatar: Optional[str] = None


class Exercise(BaseModel):
    """Упражнение в тренировке"""
    id: str
    name: str
    sets: int
    reps: str
    weight: Optional[int] = None
    rest_time: Optional[int] = None


class WorkoutResponse(WorkoutBase):
    """Модель ответа с информацией о тренировке"""
    id: str
    date: datetime
    status: str
    trainer: TrainerInfo
    exercises: Optional[List[Exercise]] = []


@router.get("/", response_model=List[WorkoutResponse])
async def get_workouts(
    client_id: Optional[str] = Query(default=None, description="ID клиента"),
    date_from: Optional[datetime] = Query(default=None, description="Дата начала периода"),
    date_to: Optional[datetime] = Query(default=None, description="Дата окончания периода"),
    status: Optional[str] = Query(default=None, description="Статус тренировки"),
):
    """
    Получение списка тренировок с фильтрацией
    """
    try:
        logger.info(f"Запрос тренировок для клиента {client_id}")
        
        # Пока возвращаем mock данные
        # TODO: Заменить на реальные данные из БД
        mock_workouts = create_mock_workouts(client_id, date_from, date_to, status)
        
        return mock_workouts
        
    except Exception as e:
        logger.error(f"Ошибка получения тренировок: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка получения тренировок"
        )


@router.post("/", response_model=WorkoutResponse)
async def create_workout(workout_data: WorkoutCreate):
    """
    Создание новой тренировки
    """
    try:
        logger.info(f"Создание тренировки для клиента {workout_data.client_id}")
        
        # TODO: Сохранить в БД
        # Пока возвращаем mock ответ
        mock_workout = WorkoutResponse(
            id="new-workout-id",
            name=workout_data.name,
            type=workout_data.type,
            date=workout_data.scheduled_at,
            duration=workout_data.duration,
            location=workout_data.location,
            description=workout_data.description,
            status="scheduled",
            trainer=TrainerInfo(
                id="trainer-1",
                name="AI Тренер",
                avatar="/avatars/ai-trainer.jpg"
            ),
            exercises=[]
        )
        
        return mock_workout
        
    except Exception as e:
        logger.error(f"Ошибка создания тренировки: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка создания тренировки"
        )


@router.get("/{workout_id}", response_model=WorkoutResponse)
async def get_workout(workout_id: str):
    """
    Получение информации о конкретной тренировке
    """
    try:
        logger.info(f"Запрос тренировки {workout_id}")
        
        # TODO: Получить из БД
        # Пока возвращаем mock данные
        mock_workout = WorkoutResponse(
            id=workout_id,
            name="Силовая тренировка",
            type="strength",
            date=datetime.now(),
            duration=60,
            location="Спортзал",
            description="Тренировка для развития силы",
            status="scheduled",
            trainer=TrainerInfo(
                id="trainer-1",
                name="AI Тренер",
                avatar="/avatars/ai-trainer.jpg"
            ),
            exercises=[
                Exercise(
                    id="ex-1",
                    name="Приседания",
                    sets=3,
                    reps="12-15",
                    weight=40,
                    rest_time=60
                )
            ]
        )
        
        return mock_workout
        
    except Exception as e:
        logger.error(f"Ошибка получения тренировки: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тренировка не найдена"
        )


@router.put("/{workout_id}", response_model=WorkoutResponse)
async def update_workout(workout_id: str, workout_data: WorkoutUpdate):
    """
    Обновление тренировки
    """
    try:
        logger.info(f"Обновление тренировки {workout_id}")
        
        # TODO: Обновить в БД
        # Пока возвращаем mock ответ
        mock_workout = WorkoutResponse(
            id=workout_id,
            name=workout_data.name or "Обновленная тренировка",
            type=workout_data.type or "strength",
            date=workout_data.scheduled_at or datetime.now(),
            duration=workout_data.duration or 60,
            location=workout_data.location or "Спортзал",
            description=workout_data.description,
            status=workout_data.status or "scheduled",
            trainer=TrainerInfo(
                id="trainer-1",
                name="AI Тренер",
                avatar="/avatars/ai-trainer.jpg"
            ),
            exercises=[]
        )
        
        return mock_workout
        
    except Exception as e:
        logger.error(f"Ошибка обновления тренировки: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка обновления тренировки"
        )


@router.delete("/{workout_id}")
async def delete_workout(workout_id: str):
    """
    Удаление тренировки
    """
    try:
        logger.info(f"Удаление тренировки {workout_id}")
        
        # TODO: Удалить из БД
        
        return {"message": "Тренировка успешно удалена"}
        
    except Exception as e:
        logger.error(f"Ошибка удаления тренировки: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка удаления тренировки"
        )


def create_mock_workouts(
    client_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    status_filter: Optional[str] = None
) -> List[WorkoutResponse]:
    """Создание mock данных тренировок для демонстрации"""
    
    today = datetime.now()
    if not date_from:
        date_from = today - timedelta(days=7)
    if not date_to:
        date_to = today + timedelta(days=14)
    
    workouts = []
    current_date = date_from
    
    workout_types = ["strength", "cardio", "flexibility"]
    workout_names = {
        "strength": ["Силовая тренировка", "Тренировка верха тела", "Тренировка ног"],
        "cardio": ["Кардио тренировка", "HIIT тренировка", "Бег"],
        "flexibility": ["Растяжка", "Йога", "Пилатес"]
    }
    
    locations = ["Спортзал", "Домашняя тренировка", "Парк"]
    trainers = [
        TrainerInfo(id="1", name="Александр Петров", avatar="/avatars/trainer1.jpg"),
        TrainerInfo(id="2", name="Мария Иванова", avatar="/avatars/trainer2.jpg"),
        TrainerInfo(id="3", name="AI Тренер", avatar="/avatars/ai-trainer.jpg")
    ]
    
    workout_id = 1
    while current_date <= date_to:
        # Пропускаем некоторые дни для разнообразия
        if current_date.weekday() < 5 and len(workouts) % 3 != 0:  # Пн-Пт, не каждый день
            workout_type = workout_types[workout_id % len(workout_types)]
            names = workout_names[workout_type]
            name = names[workout_id % len(names)]
            trainer = trainers[workout_id % len(trainers)]
            location = locations[workout_id % len(locations)]
            
            # Время тренировки
            workout_datetime = current_date.replace(hour=9 + (workout_id % 8), minute=0, second=0, microsecond=0)
            
            # Статус тренировки
            if workout_datetime < today:
                workout_status = "completed" if workout_id % 4 != 0 else "missed"
            else:
                workout_status = "scheduled"
            
            # Фильтр по статусу
            if status_filter and workout_status != status_filter:
                current_date += timedelta(days=1)
                continue
            
            workout = WorkoutResponse(
                id=f"workout-{workout_id}",
                name=name,
                type=workout_type,
                date=workout_datetime,
                duration=45 + (workout_id % 30),  # 45-75 минут
                location=location,
                description=f"{name} с фокусом на {workout_type}",
                status=workout_status,
                trainer=trainer,
                exercises=[
                    Exercise(
                        id=f"ex-{workout_id}-1",
                        name="Приседания" if workout_type == "strength" else "Бег на месте" if workout_type == "cardio" else "Растяжка",
                        sets=1 if workout_type == "flexibility" else 3,
                        reps="30 сек" if workout_type == "flexibility" else "12-15",
                        weight=20 if workout_type == "strength" else None,
                        rest_time=0 if workout_type == "flexibility" else 60
                    )
                ]
            )
            
            workouts.append(workout)
            workout_id += 1
        
        current_date += timedelta(days=1)
    
    return workouts 