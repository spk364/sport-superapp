#!/bin/bash

# 🚀 Скрипт для запуска всех приложений ИИ тренера
echo "🤖 Запускаем систему ИИ тренера..."

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
    log "📦 Устанавливаем зависимости..."
    npm install
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

log "🎯 Запускаем все приложения..."

# Запускаем через concurrently
npx concurrently \
  --names "AI-Backend,Frontend,Trainer-App" \
  --prefix-colors "magenta,cyan,green" \
  --kill-others \
  --restart-tries 3 \
  "cd apps/virtual-trainer-app && source venv/bin/activate && python3 start_server.py" \
  "cd apps/client-app && npm start" \
  "cd apps/trainer-app && npm start"

log "👋 Все приложения остановлены." 