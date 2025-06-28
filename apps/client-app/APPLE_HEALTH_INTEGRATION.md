# Apple Health Integration - AI Trainer Mini App

## Обзор

Интеграция с Apple Health позволяет автоматически синхронизировать данные о здоровье и фитнесе пользователя, значительно улучшая точность аналитики и уменьшая необходимость ручного ввода данных.

## Архитектура

### Основные компоненты

1. **AppleHealthService** (`/services/appleHealthService.ts`)
   - Основной сервис для работы с HealthKit API
   - Управление разрешениями и получение данных
   - Mock данные для демонстрации в веб-версии

2. **useAppleHealth Hook** (`/hooks/useAppleHealth.ts`)
   - React hook для интеграции с Apple Health
   - Управление состоянием синхронизации
   - Кэширование и автоматическое обновление

3. **AppleHealthIntegration Component** (`/components/progress/AppleHealthIntegration.tsx`)
   - UI компонент для настройки и мониторинга интеграции
   - Отображение статистики и управление синхронизацией

## Поддерживаемые типы данных

### Активность и фитнес
- **Steps** - количество шагов
- **Active Energy Burned** - активные калории
- **Distance** - пройденное расстояние
- **Workouts** - тренировки с детальной информацией

### Здоровье
- **Body Mass** - вес тела
- **Heart Rate** - частота сердечных сокращений
- **Resting Heart Rate** - пульс покоя
- **Body Fat Percentage** - процент жира
- **Sleep Analysis** - анализ сна

### Дополнительные метрики
- **VO2 Max** - максимальное потребление кислорода
- **Blood Pressure** - артериальное давление
- **Blood Glucose** - уровень глюкозы

## API сервиса

### Основные методы

```typescript
// Запрос разрешений
await appleHealthService.requestPermissions();

// Получение данных о шагах
const steps = await appleHealthService.getStepsData(startDate, endDate);

// Получение данных о калориях
const calories = await appleHealthService.getCaloriesData(startDate, endDate);

// Получение данных о весе
const weight = await appleHealthService.getWeightData(startDate, endDate);

// Получение тренировок
const workouts = await appleHealthService.getWorkoutsData(startDate, endDate);

// Получение полного набора метрик
const healthMetrics = await appleHealthService.getHealthMetrics(startDate, endDate);
```

### Типы данных

```typescript
interface HealthKitDataPoint {
  value: number;
  unit: string;
  date: Date;
  source: string;
  metadata?: Record<string, any>;
}

interface WorkoutData {
  id: string;
  type: WorkoutType;
  startDate: Date;
  endDate: Date;
  duration: number;
  totalEnergyBurned?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
}

interface HealthMetrics {
  steps: HealthKitDataPoint[];
  calories: HealthKitDataPoint[];
  weight: HealthKitDataPoint[];
  heartRate: HealthKitDataPoint[];
  workouts: WorkoutData[];
  sleep: SleepData[];
}
```

## React Hook использование

### Базовое использование

```typescript
const {
  isAvailable,
  isAuthorized,
  isLoading,
  error,
  healthMetrics,
  requestPermissions,
  syncHealthData,
  getStepsToday,
  getCaloriesToday,
  getCurrentWeight
} = useAppleHealth();

// Запрос разрешений
const handleConnect = async () => {
  const granted = await requestPermissions();
  if (granted) {
    console.log('Apple Health подключен');
  }
};

// Получение данных за сегодня
const todaySteps = getStepsToday();
const todayCalories = getCaloriesToday();
const currentWeight = getCurrentWeight();
```

### Автоматическая синхронизация

```typescript
// Синхронизация данных за последние 30 дней
await syncHealthData();

// Синхронизация за определенный период
await syncHealthData(startDate, endDate);

// Обновление данных
await refreshData();
```

## Интеграция с компонентами

### ProgressChart с Apple Health

```typescript
<ProgressChart
  title="Изменение веса"
  data={mockData}
  unit="кг"
  color="bg-blue-500"
  enableAppleHealth={true}
  appleHealthDataType="weight"
/>
```

### WorkoutMetrics с автоматическими данными

Компонент автоматически использует данные из Apple Health если доступны:

```typescript
const {
  isAuthorized,
  healthMetrics,
  getWorkouts,
  getAverageHeartRate
} = useAppleHealth();

// Метрики рассчитываются автоматически из Health данных
const healthData = calculateMetricsFromHealth();
const metrics = healthData || mockData;
```

## Состояния и индикаторы

### Визуальные индикаторы

1. **Статус подключения**
   - ✅ Подключено - зеленый индикатор
   - ⚠️ Требуется авторизация - желтый индикатор
   - ❌ Недоступно - серый индикатор

2. **Источник данных**
   - 🩺 Apple Health badge на компонентах
   - Временные метки синхронизации
   - Счетчики полученных данных

3. **Процесс синхронизации**
   - Loading spinners
   - Progress indicators
   - Error messages

## Обработка ошибок

### Типы ошибок

```typescript
// Проверка доступности
if (!appleHealthService.isAvailable()) {
  console.warn('HealthKit недоступен');
}

// Обработка ошибок разрешений
try {
  const granted = await requestPermissions();
} catch (error) {
  console.error('Ошибка запроса разрешений:', error);
}

// Обработка ошибок синхронизации
try {
  await syncHealthData();
} catch (error) {
  console.error('Ошибка синхронизации:', error);
}
```

### Fallback стратегии

1. **Mock данные** - используются когда Apple Health недоступен
2. **Кэширование** - сохранение последних успешных данных
3. **Graceful degradation** - приложение работает без Health данных

## Безопасность и приватность

### Разрешения

- Запрос только необходимых типов данных
- Четкое объяснение для чего нужны данные
- Возможность отзыва разрешений

### Локальное хранение

```typescript
// Сохранение статуса авторизации
localStorage.setItem('appleHealthAuthorized', 'true');

// Очистка данных
const clearData = () => {
  setHealthMetrics(null);
  localStorage.removeItem('appleHealthAuthorized');
};
```

## Производственная реализация

### iOS приложение

Для полной функциональности требуется нативный iOS мост:

```swift
// HealthKit permissions
let healthStore = HKHealthStore()
let typesToRead: Set = [
    HKQuantityType.quantityType(forIdentifier: .stepCount)!,
    HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)!,
    HKQuantityType.quantityType(forIdentifier: .bodyMass)!
]

healthStore.requestAuthorization(toShare: nil, read: typesToRead) { success, error in
    // Handle authorization
}
```

### Web реализация

Для веб-версии используются mock данные с реалистичной симуляцией:

```typescript
// Имитация HealthKit API для веб
private getMockStepsData(startDate: Date, endDate: Date): HealthKitDataPoint[] {
  // Генерация реалистичных данных о шагах
  return generatedStepsData;
}
```

## Тестирование

### Сценарии тестирования

1. **Недоступность HealthKit**
   - Проверка fallback на mock данные
   - Корректное отображение статуса

2. **Отказ в разрешениях**
   - Обработка отказа пользователя
   - Повторный запрос разрешений

3. **Успешная синхронизация**
   - Получение реальных данных
   - Обновление UI компонентов

4. **Ошибки сети**
   - Timeout handling
   - Retry mechanisms

### Mock данные

Все mock данные реалистичны и основаны на реальных паттернах:

- **Шаги**: 8,000-13,000 в день
- **Калории**: 400-1,200 в день  
- **Вес**: постепенное изменение ±0.3 кг
- **Тренировки**: 30-90 минут, различные типы
- **Пульс**: 60-80 bpm покой, 120-180 активность

## Будущие улучшения

### Планируемые функции

1. **Расширенная аналитика**
   - Анализ паттернов сна
   - Корреляция настроения и активности
   - Прогнозирование трендов

2. **Умные уведомления**
   - Напоминания о тренировках
   - Достижение целей
   - Аномальные показатели

3. **Интеграция с другими источниками**
   - Google Fit для Android
   - Fitbit API
   - Умные весы и фитнес-трекеры

4. **AI анализ**
   - Персональные рекомендации на основе Health данных
   - Автоматическая корректировка программ тренировок
   - Предиктивная аналитика здоровья

## Заключение

Интеграция с Apple Health значительно улучшает пользовательский опыт:

- **Автоматизация** - нет необходимости в ручном вводе
- **Точность** - данные от датчиков устройства
- **Комплексность** - полная картина здоровья
- **Мотивация** - реальный прогресс и достижения

Реализация обеспечивает плавную деградацию и работает как с реальными данными Health, так и с демонстрационными данными для веб-версии. 