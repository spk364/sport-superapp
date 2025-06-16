"""
Эндпоинты для получения информации о тренере
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from backend.core.database import get_db
from backend.database.models import User, TrainerProfile, UserRole
from backend.schemas.coach import CoachProfileResponse

router = APIRouter()

@router.get("/profile", response_model=CoachProfileResponse)
async def get_coach_profile(db: AsyncSession = Depends(get_db)):
    """
    Получение профиля первого доступного тренера.
    
    В реальном приложении здесь была бы логика для получения
    тренера, назначенного текущему пользователю.
    """
    # Find the first user with the role 'trainer'
    user_result = await db.execute(
        select(User).where(User.role == UserRole.TRAINER).limit(1)
    )
    coach_user = user_result.scalars().first()

    if not coach_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тренер не найден",
        )

    # Find the corresponding trainer profile
    profile_result = await db.execute(
        select(TrainerProfile).where(TrainerProfile.user_id == coach_user.id)
    )
    coach_profile = profile_result.scalars().first()

    if not coach_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль тренера не найден",
        )

    return CoachProfileResponse(
        id=coach_user.id,
        firstName=coach_user.name.split(" ")[0] if coach_user.name else "",
        lastName=coach_user.name.split(" ")[-1] if " " in coach_user.name else "",
        avatar=coach_user.preferences.get("avatar_url"), # Assuming avatar is in user preferences
        bio=coach_profile.bio,
        specialization=", ".join(coach_profile.specializations),
        experience=coach_profile.experience_years,
        whatsappNumber=coach_user.phone,
        telegramId=coach_user.telegram_id,
    ) 