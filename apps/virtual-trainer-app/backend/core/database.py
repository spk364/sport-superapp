"""
Конфигурация базы данных
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import asyncio
from loguru import logger

from backend.core.config import settings
from backend.database.models import Base


# Асинхронный движок для SQLite
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

# Асинхронная сессия
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Синхронный движок для Alembic
sync_engine = create_engine(
    settings.database_url_sync,
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

# Синхронная сессия
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine
)


async def get_db() -> AsyncSession:
    """Получение асинхронной сессии БД"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_sync_db():
    """Получение синхронной сессии БД"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def init_db():
    """Инициализация базы данных"""
    try:
        # Создание таблиц
        async with async_engine.begin() as conn:
            # В продакшене использовать Alembic
            if settings.DEBUG:
                await conn.run_sync(Base.metadata.create_all)
        
        logger.info("База данных успешно инициализирована")
        
    except Exception as e:
        logger.error(f"Ошибка инициализации БД: {e}")
        raise


async def close_db():
    """Закрытие соединений с БД"""
    await async_engine.dispose()
    logger.info("Соединения с БД закрыты") 