"""
Эндпоинты аутентификации
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Вход в систему"""
    # TODO: Реализовать аутентификацию
    return LoginResponse(
        access_token="mock-token",
        token_type="bearer",
        user_id="mock-user-id"
    )


@router.post("/logout")
async def logout():
    """Выход из системы"""
    return {"message": "Успешный выход"} 