"""
Пользовательские исключения
"""

from typing import Optional


class CustomException(Exception):
    """Базовое пользовательское исключение"""
    
    def __init__(
        self,
        detail: str,
        status_code: int = 400,
        error_code: Optional[str] = None
    ):
        self.detail = detail
        self.status_code = status_code
        self.error_code = error_code or "GENERAL_ERROR"
        super().__init__(self.detail)


class ValidationError(CustomException):
    """Ошибка валидации данных"""
    
    def __init__(self, detail: str):
        super().__init__(
            detail=detail,
            status_code=422,
            error_code="VALIDATION_ERROR"
        )


class AuthenticationError(CustomException):
    """Ошибка аутентификации"""
    
    def __init__(self, detail: str = "Неверные учетные данные"):
        super().__init__(
            detail=detail,
            status_code=401,
            error_code="AUTHENTICATION_ERROR"
        )


class AuthorizationError(CustomException):
    """Ошибка авторизации"""
    
    def __init__(self, detail: str = "Недостаточно прав"):
        super().__init__(
            detail=detail,
            status_code=403,
            error_code="AUTHORIZATION_ERROR"
        )


class NotFoundError(CustomException):
    """Ресурс не найден"""
    
    def __init__(self, detail: str = "Ресурс не найден"):
        super().__init__(
            detail=detail,
            status_code=404,
            error_code="NOT_FOUND"
        )


class ConflictError(CustomException):
    """Конфликт данных"""
    
    def __init__(self, detail: str = "Конфликт данных"):
        super().__init__(
            detail=detail,
            status_code=409,
            error_code="CONFLICT_ERROR"
        )


class RateLimitError(CustomException):
    """Превышен лимит запросов"""
    
    def __init__(self, detail: str = "Превышен лимит запросов"):
        super().__init__(
            detail=detail,
            status_code=429,
            error_code="RATE_LIMIT_ERROR"
        )


class LLMServiceError(CustomException):
    """Ошибка LLM сервиса"""
    
    def __init__(self, detail: str = "Ошибка службы ИИ"):
        super().__init__(
            detail=detail,
            status_code=503,
            error_code="LLM_SERVICE_ERROR"
        )


class ExternalServiceError(CustomException):
    """Ошибка внешнего сервиса"""
    
    def __init__(self, detail: str = "Ошибка внешнего сервиса"):
        super().__init__(
            detail=detail,
            status_code=503,
            error_code="EXTERNAL_SERVICE_ERROR"
        ) 