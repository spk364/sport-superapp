# Virtual Trainer API Documentation

## Обзор

Virtual Trainer предоставляет REST API для интеграции с LLM-функционалом, включая виртуального тренера, генерацию программ тренировок, анализ прогресса и персонализированные уведомления.

**Base URL**: `http://localhost:8000/api/v1`

## Аутентификация

В текущей версии аутентификация не реализована. В продакшене будет использоваться JWT токены.

```bash
# Будущий формат
Authorization: Bearer <jwt_token>
```

## LLM Эндпоинты

### 1. Чат с виртуальным тренером

**POST** `/llm/chat/send`

Отправка сообщения виртуальному тренеру для получения персонализированного ответа.

#### Запрос

```json
{
  "user_id": "string",
  "session_id": "string", 
  "message": "Как правильно делать приседания?",
  "attachments": ["url1", "url2"]
}
```

#### Ответ

```json
{
  "response_text": "Приседания - это базовое упражнение...",
  "session_id": "string",
  "timestamp": "2024-01-01T12:00:00Z",
  "metadata": {
    "tokens_used": 150,
    "model": "gpt-4",
    "latency_ms": 1200
  }
}
```

#### Пример

```bash
curl -X POST "http://localhost:8000/api/v1/llm/chat/send" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "session_id": "session456",
    "message": "Как правильно делать приседания?"
  }'
```

### 2. Создание программы тренировок

**POST** `/llm/program/create`

Генерация персонализированной программы тренировок на основе целей и параметров клиента.

#### Запрос

```json
{
  "user_id": "string",
  "goal": "снижение веса",
  "level": "начальный",
  "equipment": ["гантели", "турник"],
  "sessions_per_week": 3,
  "limitations": ["больная спина"]
}
```

#### Ответ

```json
{
  "program_id": "uuid",
  "program_structure": {
    "program_id": "uuid",
    "weeks": [
      {
        "week_number": 1,
        "days": [
          {
            "day_of_week": "понедельник",
            "workout_type": "силовая",
            "exercises": [
              {
                "name": "Приседания с гантелями",
                "sets": 3,
                "reps": 12,
                "weight": 8,
                "notes": "Следите за техникой"
              }
            ]
          }
        ]
      }
    ],
    "generated_at": "2024-01-01T12:00:00Z"
  },
  "generated_at": "2024-01-01T12:00:00Z",
  "metadata": {
    "tokens_used": 800,
    "model": "gpt-4",
    "latency_ms": 2500
  }
}
```

### 3. Корректировка программы

**POST** `/llm/program/adjust`

Адаптация существующей программы на основе обратной связи и данных о прогрессе.

#### Запрос

```json
{
  "user_id": "string",
  "program_id": "uuid",
  "feedback": "Слишком тяжело, не могу делать 12 повторов",
  "progress_data": {
    "day": "2024-01-01",
    "exercise_results": [
      {
        "exercise": "Приседания с гантелями",
        "sets": 3,
        "reps": 8,
        "weight": 8
      }
    ]
  }
}
```

#### Ответ

```json
{
  "program_id": "uuid",
  "program_structure": {
    // Обновленная структура программы
  },
  "generated_at": "2024-01-01T12:00:00Z",
  "metadata": {
    "tokens_used": 600,
    "model": "gpt-4",
    "latency_ms": 2000
  }
}
```

### 4. Анализ прогресса

**POST** `/llm/progress/analyze`

Анализ прогресса клиента за указанный период с рекомендациями.

#### Запрос

```json
{
  "user_id": "string",
  "date_from": "2024-01-01",
  "date_to": "2024-01-31"
}
```

#### Ответ

```json
{
  "report": {
    "summary": "За январь вы снизили вес на 3 кг и улучшили силовые показатели",
    "bottlenecks": [
      "Застой в становой тяге на 3-4 неделе",
      "Недостаточный объем кардио"
    ],
    "recommendations": [
      "Добавить 2 кардио-тренировки по 20 мин",
      "Снизить вес в становой на 10% и добавить суперсеты"
    ],
    "achievements": [
      "Увеличение жима лежа на 15%",
      "Снижение веса на 3 кг"
    ],
    "next_goals": [
      "Достичь 100 кг в становой тяге",
      "Снизить процент жира до 15%"
    ]
  },
  "generated_at": "2024-01-01T12:00:00Z",
  "metadata": {
    "tokens_used": 400,
    "model": "gpt-4",
    "latency_ms": 1800
  }
}
```

### 5. Создание уведомлений

**POST** `/llm/notifications/create`

Генерация персонализированных уведомлений и напоминаний.

#### Запрос

```json
{
  "user_id": "string",
  "type": "workout_reminder",
  "context": {
    "name": "Иван",
    "next_workout": "19:00",
    "workout_type": "силовая",
    "days_since_last": 3
  }
}
```

#### Ответ

```json
{
  "notification_id": "uuid",
  "message": "Привет, Иван! Сегодня в 19:00 у тебя силовая тренировка. Готов показать результат? 💪",
  "scheduled_at": "2024-01-01T17:00:00Z",
  "metadata": {
    "tokens_used": 50,
    "model": "gpt-4",
    "latency_ms": 800
  }
}
```

#### Типы уведомлений

- `workout_reminder` - Напоминание о тренировке
- `payment_reminder` - Напоминание об оплате
- `motivational` - Мотивационное сообщение
- `progress_report` - Приглашение посмотреть отчет

### 6. Статус LLM сервиса

**GET** `/llm/status`

Проверка работоспособности LLM сервиса.

#### Ответ

```json
{
  "status": "operational",
  "model": "gpt-4",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Управление чатом

### Получение сессий чата

**GET** `/chat/sessions?user_id=string`

```json
[
  {
    "id": "session-1",
    "name": "Чат с виртуальным тренером",
    "created_at": "2024-01-01T12:00:00Z",
    "is_active": true
  }
]
```

### Получение сообщений

**GET** `/chat/sessions/{session_id}/messages`

```json
[
  {
    "id": "msg-1",
    "sender_role": "client",
    "message_text": "Привет, как дела?",
    "created_at": "2024-01-01T12:00:00Z"
  }
]
```

### Сброс сессии

**POST** `/chat/sessions/{session_id}/reset`

```json
{
  "message": "Сессия сброшена"
}
```

## Управление программами

### Список программ пользователя

**GET** `/programs/?user_id=string`

```json
[
  {
    "id": "program-1",
    "name": "Программа для снижения веса",
    "description": "4-недельная программа",
    "created_at": "2024-01-01T12:00:00Z",
    "is_active": true
  }
]
```

### Детали программы

**GET** `/programs/{program_id}`

```json
{
  "id": "program-1",
  "name": "Программа тренировок",
  "structure": {
    "weeks": []
  },
  "created_at": "2024-01-01T12:00:00Z"
}
```

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Ресурс не найден |
| 422 | Ошибка валидации |
| 429 | Превышен лимит запросов |
| 503 | Сервис недоступен (LLM) |

### Пример ошибки

```json
{
  "detail": "Сообщение не может быть пустым",
  "error_code": "VALIDATION_ERROR"
}
```

## Rate Limiting

- **Лимит**: 60 запросов в минуту на IP
- **LLM запросы**: 5 одновременных запросов
- **Заголовки ответа**:
  - `X-RateLimit-Limit`: Лимит запросов
  - `X-RateLimit-Remaining`: Оставшиеся запросы
  - `X-RateLimit-Reset`: Время сброса лимита

## Примеры интеграции

### Python

```python
import requests

# Чат с виртуальным тренером
response = requests.post(
    "http://localhost:8000/api/v1/llm/chat/send",
    json={
        "user_id": "user123",
        "session_id": "session456", 
        "message": "Как правильно делать приседания?"
    }
)

data = response.json()
print(data["response_text"])
```

### JavaScript

```javascript
// Создание программы тренировок
const response = await fetch('http://localhost:8000/api/v1/llm/program/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_id: 'user123',
    goal: 'снижение веса',
    level: 'начальный',
    sessions_per_week: 3,
    equipment: ['гантели']
  })
});

const data = await response.json();
console.log(data.program_structure);
```

### cURL

```bash
# Анализ прогресса
curl -X POST "http://localhost:8000/api/v1/llm/progress/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "date_from": "2024-01-01",
    "date_to": "2024-01-31"
  }'
```

## Webhook для Telegram

**POST** `/webhook`

Эндпоинт для получения обновлений от Telegram Bot API.

```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "first_name": "Иван"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "text": "Привет!"
  }
}
```

## Мониторинг

- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics` (Prometheus)
- **OpenAPI**: `GET /docs`

## Версионирование

API использует версионирование через URL: `/api/v1/`

Текущая версия: **v1.0.0** 