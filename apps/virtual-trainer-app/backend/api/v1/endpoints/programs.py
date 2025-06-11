"""
Эндпоинты программ тренировок
"""

from fastapi import APIRouter
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class ProgramSummary(BaseModel):
    id: str
    name: str
    description: str
    created_at: datetime
    is_active: bool


@router.get("/", response_model=List[ProgramSummary])
async def get_user_programs(user_id: str):
    """Получение списка программ пользователя"""
    # TODO: Получить из БД
    return [
        ProgramSummary(
            id="program-1",
            name="Программа для снижения веса",
            description="4-недельная программа",
            created_at=datetime.now(),
            is_active=True
        )
    ]


@router.get("/{program_id}")
async def get_program_details(program_id: str):
    """Получение детальной информации о программе"""
    # TODO: Получить из БД
    return {
        "id": program_id,
        "name": "Программа тренировок",
        "structure": {"weeks": []},
        "created_at": datetime.now()
    } 