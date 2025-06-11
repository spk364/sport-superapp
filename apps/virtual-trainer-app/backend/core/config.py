"""
Конфигурация приложения Virtual Trainer
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from pathlib import Path


class Settings(BaseSettings):
    """Настройки приложения"""
    
    # Основные настройки
    APP_NAME: str = "Virtual Trainer"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    API_V1_STR: str = "/api/v1"
    
    # База данных
    DATABASE_URL: str = "sqlite+aiosqlite:///./virtual_trainer.db"
    DATABASE_TEST_URL: Optional[str] = "sqlite+aiosqlite:///./virtual_trainer_test.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # OpenAI LLM
    OPENAI_API_KEY: str = "your-openai-api-key-here"
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_MAX_TOKENS: int = 1500
    OPENAI_TIMEOUT: int = 30
    
    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = "your-telegram-bot-token-here"
    TELEGRAM_WEBHOOK_URL: str = ""
    TELEGRAM_WEBHOOK_SECRET: str = ""
    
    # JWT
    JWT_SECRET_KEY: str = "jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 часа
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Email
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True
    
    # Push уведомления
    FCM_SERVER_KEY: str = ""
    
    # Файлы
    UPLOAD_PATH: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [
        "image/jpeg", "image/png", "image/gif", 
        "audio/mpeg", "audio/wav", "audio/ogg",
        "application/pdf"
    ]
    
    # Логирование
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Безопасность
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "https://localhost:3000",
    ]
    RATE_LIMIT_PER_MINUTE: int = 60
    BCRYPT_ROUNDS: int = 12
    
    # Локализация
    DEFAULT_LOCALE: str = "ru"
    SUPPORTED_LOCALES: List[str] = ["ru", "kk", "en"]
    
    # LLM Промпты (системные сообщения)
    SYSTEM_PROMPTS: dict = {
        "virtual_trainer": """Ты — опытный виртуальный персональный тренер. 
        Ты специализируешься на фитнесе, силовых тренировках и единоборствах.
        Отвечай на русском языке, давай практические советы, будь дружелюбным и мотивирующим.
        Всегда учитывай безопасность клиента и рекомендуй консультации с врачом при необходимости.
        
        ВАЖНО ДЛЯ ФОРМАТИРОВАНИЯ TELEGRAM:
        - Используй *одну звездочку* для выделения (не две **)
        - Используй заголовки в формате *Заголовок:* (не ###)
        - Списки начинай с символа • или цифр
        - Избегай символов ### и ** в тексте
        - Структурируй ответ с переносами строк для читабельности""",
        
        "program_generator": """Ты — эксперт по составлению тренировочных программ.
        Создавай детальные планы тренировок в формате JSON согласно предоставленной схеме.
        Учитывай цели, уровень подготовки, доступное оборудование и ограничения клиента.
        Программы должны быть прогрессивными и безопасными.""",
        
        "progress_analyzer": """Ты — аналитик спортивных результатов.
        Анализируй данные тренировок и физических показателей.
        Выявляй тенденции, достижения и проблемные зоны.
        Давай конкретные рекомендации для улучшения результатов.""",
        
        "notification_creator": """Ты — специалист по мотивационным сообщениям.
        Создавай персонализированные уведомления и напоминания.
        Учитывай психологический профиль пользователя и контекст ситуации.
        Сообщения должны быть мотивирующими, но не навязчивыми."""
    }
    
    # Кэширование
    CACHE_TTL_SECONDS: int = 300  # 5 минут
    CACHE_FAQ_TTL_SECONDS: int = 3600  # 1 час
    
    # Лимиты
    MAX_CHAT_HISTORY: int = 10  # Количество сообщений в истории чата
    MAX_CONCURRENT_LLM_REQUESTS: int = 5
    
    # Планировщик уведомлений
    NOTIFICATION_CHECK_INTERVAL_MINUTES: int = 15
    WORKOUT_REMINDER_HOURS: List[int] = [2, 0]  # За 2 часа и в момент
    PAYMENT_REMINDER_DAYS: List[int] = [3, 1, 0, -1]  # До и после окончания
    
    # Настройки для продакшена
    ENVIRONMENT: str = "development"  # development, staging, production
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Разрешаем дополнительные поля
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Создание директорий
        Path(self.UPLOAD_PATH).mkdir(parents=True, exist_ok=True)
        Path(self.LOG_FILE).parent.mkdir(parents=True, exist_ok=True)
    
    @property
    def database_url_sync(self) -> str:
        """Синхронный URL для Alembic"""
        if "sqlite" in self.DATABASE_URL:
            return self.DATABASE_URL.replace("+aiosqlite", "")
        return self.DATABASE_URL.replace("+asyncpg", "")
    
    @property
    def is_production(self) -> bool:
        """Проверка продакшен среды"""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """Проверка среды разработки"""
        return self.ENVIRONMENT == "development"


# Создание глобального экземпляра настроек
settings = Settings() 