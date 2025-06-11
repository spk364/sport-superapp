"""
Модели базы данных Virtual Trainer
"""

from sqlalchemy import (
    Column, Integer, String, DateTime, Text, JSON, Float, Boolean, 
    ForeignKey, Enum, Index, UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
import uuid


Base = declarative_base()


class UserRole(str, enum.Enum):
    """Роли пользователей"""
    TRAINER = "trainer"
    CLIENT = "client"
    ADMIN = "admin"


class SessionStatus(str, enum.Enum):
    """Статусы тренировочных сессий"""
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class PaymentStatus(str, enum.Enum):
    """Статусы платежей"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class WorkoutType(str, enum.Enum):
    """Типы тренировок"""
    STRENGTH = "strength"
    CARDIO = "cardio"
    TECHNIQUE = "technique"
    FLEXIBILITY = "flexibility"
    MIXED = "mixed"


class NotificationType(str, enum.Enum):
    """Типы уведомлений"""
    WORKOUT_REMINDER = "workout_reminder"
    PAYMENT_REMINDER = "payment_reminder"
    MOTIVATIONAL = "motivational"
    PROGRESS_REPORT = "progress_report"


class LLMRequestType(str, enum.Enum):
    """Типы LLM запросов"""
    CHAT = "chat"
    PROGRAM_CREATE = "program_create"
    PROGRAM_ADJUST = "program_adjust"
    PROGRESS_ANALYZE = "progress_analyze"
    NOTIFICATION_CREATE = "notification_create"


class User(Base):
    """Пользователи системы"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    role = Column(Enum(UserRole), nullable=False)
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(20), unique=True, index=True)
    password_hash = Column(String(255))
    name = Column(String(255), nullable=False)
    telegram_id = Column(String(50), unique=True, index=True)
    is_active = Column(Boolean, default=True)
    preferences = Column(JSON, default=dict)  # Язык, время уведомлений и т.д.
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Связи
    trainer_profile = relationship("TrainerProfile", back_populates="user", uselist=False)
    client_profile = relationship("ClientProfile", back_populates="user", uselist=False)
    
    __table_args__ = (
        Index('idx_users_role', 'role'),
        Index('idx_users_telegram_id', 'telegram_id'),
    )


class TrainerProfile(Base):
    """Профили тренеров"""
    __tablename__ = "trainer_profiles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    
    qualifications = Column(JSON, default=list)  # Список сертификатов
    specializations = Column(JSON, default=list)  # Фитнес, бокс, дзюдо и т.д.
    experience_years = Column(Integer, default=0)
    hourly_rate = Column(Float)
    packages = Column(JSON, default=list)  # Пакеты услуг
    
    bio = Column(Text)
    rating = Column(Float, default=0.0)
    total_clients = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Связи
    user = relationship("User", back_populates="trainer_profile")
    clients = relationship("ClientProfile", back_populates="trainer")
    sessions = relationship("SessionSchedule", back_populates="trainer")
    programs = relationship("Program", back_populates="trainer")


class ClientProfile(Base):
    """Профили клиентов"""
    __tablename__ = "client_profiles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    trainer_id = Column(String, ForeignKey("trainer_profiles.id"))
    
    goals = Column(JSON, default=list)  # Цели клиента
    fitness_level = Column(String(50))  # начальный, средний, продвинутый
    limitations = Column(JSON, default=list)  # Травмы, ограничения
    equipment_available = Column(JSON, default=list)  # Доступное оборудование
    
    body_metrics = Column(JSON, default=dict)  # История замеров
    medical_info = Column(Text)  # Медицинская информация
    
    subscription_status = Column(String(50), default="active")
    subscription_expires = Column(DateTime)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Связи
    user = relationship("User", back_populates="client_profile")
    trainer = relationship("TrainerProfile", back_populates="clients")
    sessions = relationship("SessionSchedule", back_populates="client")
    programs = relationship("Program", back_populates="client")
    chat_sessions = relationship("ChatSession", back_populates="client")


class SessionSchedule(Base):
    """Расписание тренировок"""
    __tablename__ = "session_schedule"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trainer_id = Column(String, ForeignKey("trainer_profiles.id"))
    client_id = Column(String, ForeignKey("client_profiles.id"))
    
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    workout_type = Column(Enum(WorkoutType), nullable=False)
    status = Column(Enum(SessionStatus), default=SessionStatus.SCHEDULED)
    
    notes = Column(Text)  # Заметки тренера
    client_feedback = Column(Text)  # Обратная связь клиента
    results = Column(JSON, default=dict)  # Результаты тренировки
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Связи
    trainer = relationship("TrainerProfile", back_populates="sessions")
    client = relationship("ClientProfile", back_populates="sessions")
    
    __table_args__ = (
        Index('idx_sessions_trainer_date', 'trainer_id', 'scheduled_at'),
        Index('idx_sessions_client_date', 'client_id', 'scheduled_at'),
    )


class Payment(Base):
    """Платежи"""
    __tablename__ = "payments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, ForeignKey("client_profiles.id"))
    trainer_id = Column(String, ForeignKey("trainer_profiles.id"))
    
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="KZT")
    payment_date = Column(DateTime, default=func.now())
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    package_info = Column(JSON, default=dict)  # Информация о пакете
    payment_method = Column(String(50))
    transaction_id = Column(String(100))
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_payments_client_date', 'client_id', 'payment_date'),
        Index('idx_payments_status', 'status'),
    )


class Program(Base):
    """Тренировочные программы"""
    __tablename__ = "programs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, ForeignKey("client_profiles.id"))
    trainer_id = Column(String, ForeignKey("trainer_profiles.id"))
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    structure = Column(JSON, nullable=False)  # JSON структура программы
    
    is_active = Column(Boolean, default=True)
    difficulty_level = Column(String(50))
    estimated_duration_weeks = Column(Integer)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Связи
    client = relationship("ClientProfile", back_populates="programs")
    trainer = relationship("TrainerProfile", back_populates="programs")
    
    __table_args__ = (
        Index('idx_programs_client_active', 'client_id', 'is_active'),
    )


class ChatSession(Base):
    """Сессии чата с виртуальным тренером"""
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, ForeignKey("client_profiles.id"))
    
    session_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    context_data = Column(JSON, default=dict)  # Контекст сессии
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Связи
    client = relationship("ClientProfile", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session")


class ChatMessage(Base):
    """Сообщения в чате"""
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    
    sender_role = Column(String(20), nullable=False)  # client, trainer, bot
    message_text = Column(Text, nullable=False)
    attachments = Column(JSON, default=list)  # Список URL файлов
    
    message_metadata = Column(JSON, default=dict)  # Метаданные сообщения
    
    created_at = Column(DateTime, default=func.now())
    
    # Связи
    session = relationship("ChatSession", back_populates="messages")
    
    __table_args__ = (
        Index('idx_messages_session_date', 'session_id', 'created_at'),
    )


class LLMLog(Base):
    """Логи LLM запросов"""
    __tablename__ = "llm_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    
    request_type = Column(Enum(LLMRequestType), nullable=False)
    input_payload = Column(JSON)
    output_payload = Column(JSON)
    
    status = Column(String(20), nullable=False)  # success, error
    error_message = Column(Text)
    latency_ms = Column(Integer)
    
    model_used = Column(String(50))
    tokens_used = Column(Integer)
    cost_estimate = Column(Float)
    
    created_at = Column(DateTime, default=func.now())
    
    __table_args__ = (
        Index('idx_llm_logs_user_type', 'user_id', 'request_type'),
        Index('idx_llm_logs_status_date', 'status', 'created_at'),
    )


class Notification(Base):
    """Уведомления"""
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    
    notification_type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255))
    message = Column(Text, nullable=False)
    
    scheduled_at = Column(DateTime, nullable=False)
    sent_at = Column(DateTime)
    is_sent = Column(Boolean, default=False)
    
    channels = Column(JSON, default=list)  # push, email, telegram
    notification_metadata = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=func.now())
    
    __table_args__ = (
        Index('idx_notifications_user_type', 'user_id', 'notification_type'),
        Index('idx_notifications_scheduled', 'scheduled_at', 'is_sent'),
    )


class ProgressReport(Base):
    """Отчеты прогресса"""
    __tablename__ = "progress_reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, ForeignKey("client_profiles.id"))
    
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    summary = Column(Text)
    bottlenecks = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    
    metrics_analyzed = Column(JSON, default=dict)
    generated_by_llm = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=func.now())
    
    __table_args__ = (
        Index('idx_reports_client_period', 'client_id', 'period_start', 'period_end'),
    ) 