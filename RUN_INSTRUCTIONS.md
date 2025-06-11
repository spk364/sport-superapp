# 🚀 Инструкция по запуску ИИ Тренера

## ✅ Готово к запуску!
Все файлы настроены и готовы. API ключи добавлены в конфигурацию.

## 🖥️ Запуск системы

### 🚀 БЫСТРЫЙ ЗАПУСК (рекомендуется)

#### Вариант 1: Только ИИ тренер
```bash
./start-ai.sh
```

#### Вариант 2: Все приложения сразу
```bash
./start-all.sh
```

### 📝 РУЧНОЙ ЗАПУСК

### 1️⃣ Запуск Backend (ИИ Агент)

```bash
# 1. Перейти в директорию backend
cd apps/virtual-trainer-app

# 2. Активировать виртуальное окружение
source venv/bin/activate

# 3. Запустить сервер
python3 start_server.py
```

**Backend будет доступен по адресу:** `http://localhost:8000`
- 📚 API документация: `http://localhost:8000/docs`
- ❤️ Health check: `http://localhost:8000/health`

### 2️⃣ Запуск Frontend (в новом терминале)

```bash
# 1. Перейти в директорию frontend
cd apps/client-app

# 2. Запустить React приложение
npm start
```

**Frontend будет доступен по адресу:** `http://localhost:3000`

## 🧪 Тестирование ИИ

### Тест 1: Health Check
```bash
curl http://localhost:8000/health
```

### Тест 2: ИИ Чат
```bash
curl -X POST http://localhost:8000/api/v1/llm/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "session_id": "test_session",
    "message": "Привет! Помоги составить план тренировок",
    "attachments": []
  }'
```

## 🎯 Использование в браузере

1. Откройте `http://localhost:3000`
2. Нажмите на иконку "ИИ Тренер" в нижней навигации
3. Или используйте виджет ИИ на главной странице
4. Отправьте сообщение: "Привет! Помоги с тренировками"

## 🔧 Возможные проблемы

### Проблема: Backend не запускается
**Решение:**
```bash
cd apps/virtual-trainer-app
source venv/bin/activate
pip install -r requirements.txt
python3 start_server.py
```

### Проблема: Frontend не запускается
**Решение:**
```bash
cd apps/client-app
npm install
npm start
```

### Проблема: ИИ не отвечает
**Проверьте:**
- OpenAI API ключ в `.env` файле
- Backend запущен на порту 8000
- Нет ошибок в логах backend

## 🎉 Готово!

Система ИИ тренера запущена и готова к использованию! 🤖💪

### Основные возможности:
- 💬 Чат с виртуальным тренером
- 🏋️ Генерация программ тренировок  
- 📊 Анализ прогресса
- 🔔 Умные уведомления 