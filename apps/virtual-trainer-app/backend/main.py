"""
Virtual Trainer - Главное приложение FastAPI
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from loguru import logger

from backend.core.config import settings
from backend.core.database import init_db
from backend.api.v1.api import api_router
from backend.core.exceptions import CustomException

# Настройка логирования
logging.getLogger("uvicorn.access").disabled = True
logger.add(
    settings.LOG_FILE,
    rotation="1 day",
    retention="30 days",
    level=settings.LOG_LEVEL,
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
    encoding="utf-8"
)


def create_application() -> FastAPI:
    """Создание и настройка FastAPI приложения"""
    
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Система управления тренировками с LLM функционалом",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # Middleware для CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
        allow_headers=["*"],
    )
    
    # Middleware для доверенных хостов
    application.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # В продакшене указать конкретные домены
    )
    
    # Подключение роутеров
    application.include_router(api_router, prefix=settings.API_V1_STR)
    
    return application


app = create_application()


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware для логирования запросов"""
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s"
    )
    
    return response


@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    """Обработчик пользовательских исключений"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_code": exc.error_code}
    )


@app.on_event("startup")
async def startup_event():
    """Действия при запуске приложения"""
    logger.info("Запуск Virtual Trainer Backend")
    await init_db()
    logger.info("База данных инициализирована")


@app.on_event("shutdown")
async def shutdown_event():
    """Действия при остановке приложения"""
    logger.info("Остановка Virtual Trainer Backend")


@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "message": "Virtual Trainer API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Проверка состояния сервиса"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.APP_VERSION
    } 