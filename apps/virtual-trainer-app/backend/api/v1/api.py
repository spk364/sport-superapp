"""
Главный роутер API v1
"""

from fastapi import APIRouter

from backend.api.v1.endpoints import llm, auth, users, programs, chat

api_router = APIRouter()

# Подключение роутеров
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(llm.router, prefix="/llm", tags=["llm"])
api_router.include_router(programs.router, prefix="/programs", tags=["programs"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"]) 