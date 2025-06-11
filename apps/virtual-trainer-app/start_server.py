#!/usr/bin/env python3
"""
Скрипт запуска backend сервера ИИ тренера
"""
import uvicorn
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

if __name__ == "__main__":
    print("🚀 Запуск Backend ИИ Тренера...")
    print("📍 URL: http://localhost:8000")
    print("📚 Документация API: http://localhost:8000/docs")
    print("❤️ Health check: http://localhost:8000/health")
    print("-" * 50)
    
    # Запускаем сервер
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    ) 