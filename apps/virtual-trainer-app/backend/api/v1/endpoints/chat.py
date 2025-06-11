"""
Эндпоинты чата
"""

from fastapi import APIRouter
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class ChatSession(BaseModel):
    id: str
    name: str
    created_at: datetime
    is_active: bool


class ChatMessage(BaseModel):
    id: str
    sender_role: str
    message_text: str
    created_at: datetime


@router.get("/sessions", response_model=List[ChatSession])
async def get_chat_sessions(user_id: str):
    """Получение списка сессий чата"""
    # TODO: Получить из БД
    return [
        ChatSession(
            id="session-1",
            name="Чат с виртуальным тренером",
            created_at=datetime.now(),
            is_active=True
        )
    ]


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessage])
async def get_chat_messages(session_id: str):
    """Получение сообщений чата"""
    # TODO: Получить из БД
    return [
        ChatMessage(
            id="msg-1",
            sender_role="client",
            message_text="Привет, как дела?",
            created_at=datetime.now()
        )
    ]


@router.post("/sessions/{session_id}/reset")
async def reset_chat_session(session_id: str):
    """Сброс сессии чата"""
    # TODO: Очистить контекст в БД
    return {"message": "Сессия сброшена"} 