"""
Эндпоинты пользователей
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from backend.core.database import get_db
from backend.crud import crud_user
from backend.schemas import user_schema

router = APIRouter()


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str


@router.get("/me", response_model=user_schema.User)
async def get_current_user(db: AsyncSession = Depends(get_db)):
    """Получение профиля текущего пользователя"""
    
    # TODO: Получить из JWT токена, пока хардкод
    user_id = UUID("9ff91fd7-1da3-4a37-8550-38902251e578")

    user = await crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user


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