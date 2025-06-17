"""
Эндпоинты пользователей
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from backend.core.database import get_db
from backend.crud import crud_user
from backend.schemas import user_schema
from backend.services.user_service import UserService

router = APIRouter()


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str


class ProfileUpdateRequest(BaseModel):
    answers: Dict[str, Any]


@router.get("/me", response_model=user_schema.User)
async def get_current_user(db: AsyncSession = Depends(get_db)):
    """Получение профиля текущего пользователя"""
    
    # TODO: Получить из JWT токена, пока хардкод
    user_id = "9ff91fd7-1da3-4a37-8550-38902251e578"
    
    try:
        # Инициализируем сервис пользователей
        user_service = UserService()
        
        # Получаем профиль из файлового хранилища
        user_profile = user_service.get_user_profile(user_id)
        
        print(f"Raw user_profile from file: {user_profile}")
        print(f"Equipment: {user_profile.get('equipment', 'NOT FOUND')}")
        print(f"Limitations: {user_profile.get('limitations', 'NOT FOUND')}")
        print(f"Height: {user_profile.get('height', 'NOT FOUND')}")
        print(f"Weight: {user_profile.get('weight', 'NOT FOUND')}")
        
        # Мапим данные на правильную структуру User
        from datetime import datetime
        from uuid import UUID
        
        # Извлекаем данные из профиля
        preferences = {
            "age": user_profile.get("age"),
            "gender": user_profile.get("gender"),
            "nutrition_goal": user_profile.get("nutrition_goal"),
            "food_preferences": user_profile.get("food_preferences", []),
            "allergies": user_profile.get("allergies", [])
        }
        
        # Получаем рост и вес напрямую как числа
        height = user_profile.get("height", 0)
        weight = user_profile.get("weight", 0)
        
        # Создаем client_profile всегда, если есть хотя бы одно поле анкеты
        equipment = user_profile.get("equipment", [])
        limitations = user_profile.get("limitations", [])
        
        print(f"Creating client_profile with:")
        print(f"  - equipment: {equipment}")
        print(f"  - limitations: {limitations}")
        print(f"  - height: {height}, weight: {weight}")
        
        client_profile = user_schema.ClientProfile(
            id=user_id,
            subscription_status="active",
            subscription_expires=None,
            goals=user_profile.get("goals", []),
            fitness_level=user_profile.get("fitness_level"),
            equipment_available=equipment,
            limitations=limitations,
            body_metrics={"height": height, "weight": weight}
        )
        
        mock_user = user_schema.User(
            id=UUID(user_id),
            email="user@example.com",
            name="Пользователь",
            role=user_schema.UserRole.client,
            is_active=True,
            phone=None,
            telegram_id=user_id,
            preferences=preferences,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            client_profile=client_profile,
            trainer_profile=None
        )
        
        print(f"Returning user data: {mock_user}")
        return mock_user
        
    except Exception as e:
        print(f"Error getting current user: {e}")
        
        # Fallback to database if file storage fails
        user_id_uuid = UUID(user_id)
        user = await crud_user.get_user(db, user_id=user_id_uuid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        return user


@router.post("/profile/update", response_model=user_schema.User)
async def update_user_profile(
    answers: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """Обновление профиля пользователя данными из анкеты"""
    
    # TODO: Получить из JWT токена, пока хардкод
    user_id = "9ff91fd7-1da3-4a37-8550-38902251e578"
    
    try:
        # Инициализируем сервис пользователей
        user_service = UserService()
        
        # Обновляем профиль пользователя
        user_service.update_user_profile(user_id, answers)
        
        # Получаем обновленный профиль из файлового хранилища
        updated_profile = user_service.get_user_profile(user_id)
        
        print(f"Raw user_profile from file: {updated_profile}")
        print(f"Equipment: {updated_profile.get('equipment', 'NOT FOUND')}")
        print(f"Limitations: {updated_profile.get('limitations', 'NOT FOUND')}")
        print(f"Height: {updated_profile.get('height', 'NOT FOUND')}")
        print(f"Weight: {updated_profile.get('weight', 'NOT FOUND')}")
        
        # Мапим данные анкеты на правильную структуру User
        from datetime import datetime
        from uuid import UUID
        
        # Извлекаем данные из анкеты
        preferences = {
            "age": updated_profile.get("age"),
            "gender": updated_profile.get("gender"),
            "nutrition_goal": updated_profile.get("nutrition_goal"),
            "food_preferences": updated_profile.get("food_preferences", []),
            "allergies": updated_profile.get("allergies", [])
        }
        
        # Получаем рост и вес напрямую как числа
        height = updated_profile.get("height", 0)
        weight = updated_profile.get("weight", 0)
        
        # Создаем client_profile всегда, если есть хотя бы одно поле анкеты
        equipment = updated_profile.get("equipment", [])
        limitations = updated_profile.get("limitations", [])
        
        print(f"Creating client_profile with:")
        print(f"  - equipment: {equipment}")
        print(f"  - limitations: {limitations}")
        print(f"  - height: {height}, weight: {weight}")
        
        client_profile = user_schema.ClientProfile(
            id=user_id,
            subscription_status="active",
            subscription_expires=None,
            goals=updated_profile.get("goals", []),
            fitness_level=updated_profile.get("fitness_level"),
            equipment_available=equipment,
            limitations=limitations,
            body_metrics={"height": height, "weight": weight}
        )
        
        mock_user = user_schema.User(
            id=UUID(user_id),
            email="user@example.com",
            name="Пользователь",
            role=user_schema.UserRole.client,
            is_active=True,
            phone=None,
            telegram_id=user_id,
            preferences=preferences,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            client_profile=client_profile,
            trainer_profile=None
        )
        
        print(f"Returning user data: {mock_user}")
        return mock_user
        
    except Exception as e:
        print(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


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