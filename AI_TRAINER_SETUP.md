# Полная настройка ИИ Тренера

## Обзор
Эта инструкция поможет запустить полную систему ИИ тренера, включающую:
- Backend с ИИ агентом (FastAPI + OpenAI)
- Клиентское приложение (React + TypeScript)
- Интеграцию между компонентами

## Предварительные требования

1. **Python 3.8+**
2. **Node.js 16+**  
3. **OpenAI API ключ**

## Настройка Backend (ИИ Агент)

### 1. Переход в директорию backend
```bash
cd apps/virtual-trainer-app
```

### 2. Создание виртуального окружения
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows
```

### 3. Установка зависимостей
```bash
pip install -r requirements.txt
```

### 4. Настройка переменных окружения
Создайте файл `.env`:
```bash
# Основные настройки
APP_NAME="Virtual Trainer"
DEBUG=true
LOG_LEVEL=INFO

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1500

# Безопасность
SECRET_KEY=your_secret_key_here
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]

# База данных (SQLite по умолчанию)
DATABASE_URL=sqlite:///./trainer.db
```

### 5. Запуск backend
```bash
python -m uvicorn backend.main:app --reload --port 8000
```

Backend будет доступен на `http://localhost:8000`
- API документация: `http://localhost:8000/docs`
- Альтернативная документация: `http://localhost:8000/redoc`

## Настройка Frontend (Клиентское приложение)

### 1. Переход в директорию frontend
```bash
cd apps/client-app
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
Создайте файл `.env`:
```bash
REACT_APP_API_URL=http://localhost:8000
```

### 4. Запуск клиентского приложения
```bash
npm start
```

Приложение будет доступно на `http://localhost:3000`

## Тестирование интеграции

### 1. Проверка backend
```bash
curl http://localhost:8000/health
```

Ожидаемый ответ:
```json
{
  "status": "healthy",
  "timestamp": 1703123456.789,
  "version": "1.0.0"
}
```

### 2. Тестирование ИИ агента
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

### 3. Тестирование в браузере
1. Откройте `http://localhost:3000`
2. Перейдите в раздел "ИИ Тренер" через навигацию
3. Отправьте сообщение: "Привет! Как дела?"
4. Проверьте, что ИИ отвечает

## Функциональность ИИ Агента

### Доступные возможности:
1. **Чат с виртуальным тренером**
   - Персонализированные советы
   - Ответы на вопросы о тренировках
   - Мотивационная поддержка

2. **Генерация программ тренировок**
   - Персональные планы
   - Учёт целей и уровня подготовки
   - Адаптация под доступное оборудование

3. **Анализ прогресса**
   - Оценка достижений
   - Выявление узких мест
   - Рекомендации по улучшению

4. **Создание уведомлений**
   - Персонализированные напоминания
   - Мотивационные сообщения

## Архитектура системы

```
[React App] ↔ [Proxy] ↔ [FastAPI] ↔ [OpenAI API]
     ↑           ↑         ↑
  localhost:3000  setup   port:8000
                Proxy.js
```

## Troubleshooting

### Проблема: ИИ не отвечает
**Решение:**
1. Проверьте OpenAI API ключ в `.env`
2. Убедитесь что backend запущен на порту 8000
3. Проверьте логи backend: `tail -f logs/app.log`

### Проблема: CORS ошибки
**Решение:**
1. Проверьте настройки CORS_ORIGINS в backend `.env`
2. Убедитесь что прокси настроен в `setupProxy.js`

### Проблема: 404 на API запросы
**Решение:**
1. Проверьте что прокси middleware работает
2. Убедитесь что backend API доступен на `/api/v1/`

## Производственная среда

### Backend
1. Настройте HTTPS
2. Используйте Production базу данных
3. Настройте логирование
4. Добавьте мониторинг

### Frontend  
1. Сборка production: `npm run build`
2. Настройте CDN для статических файлов
3. Настройте правильные API endpoints

## Поддержка

Для получения помощи:
1. Проверьте логи backend в `logs/app.log`
2. Проверьте консоль браузера для frontend ошибок
3. Убедитесь что все зависимости установлены корректно

Система готова к использованию! 🚀🤖 