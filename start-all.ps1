# 🚀 PowerShell скрипт для запуска объединенной системы ИИ тренера
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

Write-Host ""
Write-Host "🤖 Запускаем объединенную систему ИИ тренера..." -ForegroundColor Green
Write-Host ""

# Функции для цветного вывода
function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Error($message) {
    Write-Host "❌ ERROR: $message" -ForegroundColor Red
}

function Write-Warning($message) {
    Write-Host "⚠️  WARNING: $message" -ForegroundColor Yellow
}

function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

# Проверяем что мы в правильной директории
if (-not (Test-Path "package.json")) {
    Write-Error "package.json не найден. Запустите скрипт из корневой директории проекта."
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

Write-Info "Текущая директория: $(Get-Location)"

# Проверяем установку Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js версия: $nodeVersion"
} catch {
    Write-Error "Node.js не установлен. Установите Node.js с https://nodejs.org/"
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Установка зависимостей если нужно
if (-not (Test-Path "node_modules")) {
    Write-Info "Устанавливаем зависимости для монорепозитория..."
    npm install
}

# Проверяем зависимости client-app
if (-not (Test-Path "apps\client-app\node_modules")) {
    Write-Info "Устанавливаем зависимости для client-app..."
    Set-Location "apps\client-app"
    npm install
    Set-Location "..\..\"
}

# Проверяем Python окружение
if (-not (Test-Path "apps\virtual-trainer-app\venv")) {
    Write-Warning "Python venv не найден. Создайте виртуальное окружение:"
    Write-Host "cd apps\virtual-trainer-app" -ForegroundColor White
    Write-Host "python -m venv venv" -ForegroundColor White
    Write-Host "venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "pip install -r requirements.txt" -ForegroundColor White
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Проверяем .env файл для ИИ
if (-not (Test-Path "apps\virtual-trainer-app\.env")) {
    Write-Warning ".env файл не найден для ИИ backend. Создайте его с API ключами."
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

Write-Info "Запускаем объединенное приложение..."
Write-Host ""
Write-Host "📱 После запуска приложение будет доступно по адресу:" -ForegroundColor Yellow
Write-Host "🌐 http://localhost:3000/" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎭 Функциональность:" -ForegroundColor Yellow
Write-Host "👤 Клиенты: Выберите 'I'm a Client' для доступа к поиску залов и тренировкам" -ForegroundColor White
Write-Host "💼 Тренеры: Выберите 'I'm a Trainer' для доступа к панели управления" -ForegroundColor White
Write-Host "🤖 ИИ Backend: http://localhost:8000 (автоматически)" -ForegroundColor White
Write-Host ""
Write-Host "📋 Что запускается:" -ForegroundColor Yellow
Write-Host "  1. React приложение (порт 3000) - объединенный интерфейс" -ForegroundColor White
Write-Host "  2. FastAPI ИИ backend (порт 8000) - чат с ИИ тренером" -ForegroundColor White
Write-Host ""
Write-Host "⏰ Для остановки нажмите Ctrl+C" -ForegroundColor Magenta
Write-Host ""

# Запускаем через concurrently
try {
    npx concurrently --names "AI-Backend,Unified-App" --prefix-colors "magenta,cyan" --kill-others --restart-tries 3 "cd apps/virtual-trainer-app && venv\Scripts\activate && python start_server.py" "npm run dev"
} catch {
    Write-Error "Ошибка при запуске приложений: $_"
}

Write-Host ""
Write-Success "Все приложения остановлены."
Read-Host "Нажмите Enter для выхода"