#!/bin/bash

# 🤖 Скрипт для запуска ИИ тренера (Frontend + AI Backend)
echo "🤖 Запускаем ИИ тренера..."

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"
}

# Проверки
if [ ! -f "package.json" ]; then
    error "Запустите из корневой директории проекта"
    exit 1
fi

if [ ! -d "apps/virtual-trainer-app/venv" ]; then
    error "Python venv не найден. Следуйте инструкциям в RUN_INSTRUCTIONS.md"
    exit 1
fi

if [ ! -f "apps/virtual-trainer-app/.env" ]; then
    error ".env файл с API ключами не найден"
    exit 1
fi

log "🎯 Запускаем ИИ тренера..."

# Запускаем только ИИ backend + Frontend
npx concurrently \
  --names "🤖AI-Backend,📱Frontend" \
  --prefix-colors "magenta,cyan" \
  --kill-others \
  --restart-tries 3 \
  "cd apps/virtual-trainer-app && source venv/bin/activate && python3 start_server.py" \
  "cd apps/client-app && npm start"

log "👋 ИИ тренер остановлен." 