@echo off
echo.
echo 🤖 Запускаем объединенную систему ИИ тренера...
echo.

REM 🚀 Скрипт для запуска объединенной системы ИИ тренера
REM 
REM 🏗️ АРХИТЕКТУРА:
REM - Объединенное приложение на порту 3000 (клиенты + тренеры)
REM - ИИ Backend на порту 8000 (FastAPI + OpenAI)
REM - Единая точка входа с выбором роли при входе
REM
REM 🌐 ДОСТУП:
REM - http://localhost:3000/ - главная страница с выбором роли
REM - Клиенты: поиск залов, тренировки, прогресс
REM - Тренеры: панель управления, аналитика, клиенты

REM Проверяем что мы в правильной директории
if not exist "package.json" (
    echo ❌ ERROR: package.json не найден. Запустите скрипт из корневой директории проекта.
    pause
    exit /b 1
)

echo 📂 Текущая директория: %CD%
echo.

REM Установка зависимостей если нужно
if not exist "node_modules" (
    echo 📦 Устанавливаем зависимости для монорепозитория...
    npm install
)

REM Проверяем зависимости client-app
if not exist "apps\client-app\node_modules" (
    echo 📦 Устанавливаем зависимости для client-app...
    cd apps\client-app
    npm install
    cd ..\..
)

REM Проверяем Python окружение
if not exist "apps\virtual-trainer-app\venv" (
    echo ⚠️  WARNING: Python venv не найден. Создайте виртуальное окружение:
    echo cd apps\virtual-trainer-app ^&^& python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    pause
    exit /b 1
)

REM Проверяем .env файл для ИИ
if not exist "apps\virtual-trainer-app\.env" (
    echo ⚠️  WARNING: .env файл не найден для ИИ backend. Создайте его с API ключами.
    pause
    exit /b 1
)

echo 🎯 Запускаем объединенное приложение...
echo.
echo 📱 После запуска приложение будет доступно по адресу:
echo 🌐 http://localhost:3000/
echo.
echo 🎭 Функциональность:
echo 👤 Клиенты: Выберите 'I'm a Client' для доступа к поиску залов и тренировкам
echo 💼 Тренеры: Выберите 'I'm a Trainer' для доступа к панели управления
echo 🤖 ИИ Backend: http://localhost:8000 (автоматически)
echo.
echo 📋 Что запускается:
echo   1. React приложение (порт 3000) - объединенный интерфейс
echo   2. FastAPI ИИ backend (порт 8000) - чат с ИИ тренером
echo.
echo ⏰ Для остановки нажмите Ctrl+C
echo.

REM Запускаем через concurrently
npx concurrently --names "AI-Backend,Unified-App" --prefix-colors "magenta,cyan" --kill-others --restart-tries 3 "cd apps/virtual-trainer-app && venv\Scripts\activate && python start_server.py" "npm run dev"

echo.
echo 👋 Все приложения остановлены.
pause