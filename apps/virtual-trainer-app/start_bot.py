#!/usr/bin/env python3
"""
Скрипт запуска Telegram бота ИИ тренера
"""
import uvicorn
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

if __name__ == "__main__":
    print("🤖 Запуск Telegram бота ИИ тренера...")
    print("📍 URL: http://localhost:8001")
    print("🔔 Webhook URL (если настроен): " + os.getenv("TELEGRAM_WEBHOOK_URL", "не настроен"))
    print("-" * 50)
    
    # Запускаем сервер для бота
    uvicorn.run(
        "telegram_bot.main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
        log_level="info"
    ) 