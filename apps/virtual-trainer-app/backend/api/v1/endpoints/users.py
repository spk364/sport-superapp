"""
Эндпоинты пользователей
"""

from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str


@router.get("/me", response_model=UserProfile)
async def get_current_user():
    """Получение профиля текущего пользователя"""
    # TODO: Получить из JWT токена
    return UserProfile(
        id="mock-user-id",
        name="Тестовый пользователь",
        email="test@example.com",
        role="client"
    )


@router.get("/profile/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """Получение профиля пользователя"""
    # TODO: Реализовать получение из БД
    return UserProfile(
        id=user_id,
        name="Пользователь",
        email="user@example.com",
        role="client"
    ) 