from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from uuid import UUID

from backend.database import models
from backend.schemas import user_schema

async def get_user(db: Session, user_id: UUID):
    """
    Получение пользователя по ID с его профилем (клиента или тренера).
    """
    result = await db.execute(
        select(models.User)
        .where(models.User.id == str(user_id))
        .options(
            joinedload(models.User.client_profile),
            joinedload(models.User.trainer_profile)
        )
    )
    return result.scalars().first() 