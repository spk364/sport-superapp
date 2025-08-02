#!/bin/bash

# 🚀 Скрипт для запуска объединенной системы ИИ тренера
# 
# 🏗️ АРХИТЕКТУРА:
# - Объединенное приложение на порту 3000 (клиенты + тренеры)
# - ИИ Backend на порту 8000 (FastAPI + OpenAI)
# - Единая точка входа с выбором роли при входе
#
# 🌐 ДОСТУП:
# - http://localhost:3000/ - главная страница с выбором роли
# - Клиенты: поиск залов, тренировки, прогресс
# - Тренеры: панель управления, аналитика, клиенты
#
echo "🤖 Запускаем объединенную систему ИИ тренера..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"
}

# Проверяем что мы в правильной директории
if [ ! -f "package.json" ]; then
    error "package.json не найден. Запустите скрипт из корневой директории проекта."
    exit 1
fi

log "📂 Текущая директория: $(pwd)"

# Установка зависимостей если нужно
if [ ! -d "node_modules" ]; then
    log "📦 Устанавливаем зависимости для монорепозитория..."
    npm install
fi

# Проверяем зависимости client-app
if [ ! -d "apps/client-app/node_modules" ]; then
    log "📦 Устанавливаем зависимости для client-app..."
    cd apps/client-app && npm install && cd ../..
fi

# Проверяем Python окружение
if [ ! -d "apps/virtual-trainer-app/venv" ]; then
    warn "Python venv не найден. Создайте виртуальное окружение:"
    echo "cd apps/virtual-trainer-app && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Проверяем .env файл для ИИ
if [ ! -f "apps/virtual-trainer-app/.env" ]; then
    warn ".env файл не найден для ИИ backend. Создайте его с API ключами."
    exit 1
fi

log "🎯 Запускаем объединенное приложение..."

echo ""
echo "📱 После запуска приложение будет доступно по адресу:"
echo "🌐 http://localhost:3000/"
echo ""
echo "🎭 Функциональность:"
echo "👤 Клиенты: Выберите 'I'm a Client' для доступа к поиску залов и тренировкам"
echo "💼 Тренеры: Выберите 'I'm a Trainer' для доступа к панели управления"
echo "🤖 ИИ Backend: http://localhost:8000 (автоматически)"
echo ""
echo "📋 Что запускается:"
echo "  1. React приложение (порт 3000) - объединенный интерфейс"
echo "  2. FastAPI ИИ backend (порт 8000) - чат с ИИ тренером"
echo ""

# Запускаем через concurrently
npx concurrently \
  --names "AI-Backend,Unified-App" \
  --prefix-colors "magenta,cyan" \
  --kill-others \
  --restart-tries 3 \
  "cd apps/virtual-trainer-app && source venv/bin/activate && python3 start_server.py" \
  "npm run dev"

log "👋 Все приложения остановлены." 