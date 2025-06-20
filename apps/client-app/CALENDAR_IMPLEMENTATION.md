# Календарь тренировок - Реализация

## Обзор

Интерактивный календарь тренировок предоставляет полнофункциональное решение для планирования, просмотра и отслеживания тренировок с несколькими режимами просмотра и детальной информацией.

## ✅ Реализованные функции

### 🗓️ Режимы просмотра
- **День** - детальный вид одного дня с полной информацией о тренировках
- **Неделя** - компактный недельный вид с возможностью быстрого доступа  
- **Месяц** - стандартный месячный календарь с индикаторами тренировок

### 📊 Статусы тренировок
- **Запланировано** (синий) - предстоящие тренировки
- **Выполнено** (зелёный) - завершённые тренировки  
- **Отменено** (красный) - отменённые сессии
- **Пропущено** (серый) - пропущенные без отмены

### 🔍 Детальная информация
- Название и тип тренировки
- Дата, время и продолжительность
- Локация проведения
- Информация о тренере
- Описание программы
- Список упражнений с подходами/повторениями

### 📱 Интерактивность
- Переключение между режимами просмотра
- Навигация по датам (предыдущий/следующий период)
- Клик по тренировке для модального окна с деталями
- Responsive дизайн для мобильных устройств

## 🏗️ Архитектура

### Компоненты

#### `DashboardCalendar.tsx`
Основной компонент календаря с тремя режимами просмотра:

```typescript
type ViewMode = 'day' | 'week' | 'month';
```

**Ключевые функции:**
- `renderDayView()` - отображение одного дня
- `renderWeekView()` - отображение недели  
- `renderMonthView()` - отображение месяца
- `formatDateHeader()` - форматирование заголовка под режим
- `getWorkoutsForDate()` - получение тренировок для даты
- `getStatusColor()` - цветовые индикаторы статусов

#### `Calendar.tsx`
Выделенная страница календаря с дополнительными элементами:
- Полноэкранный календарь
- Справка по использованию
- Статистика тренировок
- Легенда статусов

### Интеграция с данными

#### Store Integration
```typescript
const workouts = useAppStore((state) => state.workouts);
```

#### Mock Data
Календарь использует `createMockWorkouts()` из store для генерации:
- 3 недели данных (неделя назад + 2 недели вперёд)
- Разнообразные типы тренировок
- Реалистичные статусы на основе дат
- Упражнения с детализацией

#### TypeScript Types
```typescript
interface Workout {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'group' | 'personal';
  date: Date;
  duration: number;
  location: string;
  trainer: { id: string; name: string; avatar?: string };
  description?: string;
  exercises?: Exercise[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
}
```

## 🎨 UI/UX

### Дизайн-система
- **Tailwind CSS** - utility-first стилизация
- **Градиенты** - современный визуальный стиль
- **Иконки** - Heroicons для консистентности
- **Цветовая схема** - интуитивные цвета статусов

### Mobile-First
- Responsive сетки для всех размеров экрана
- Touch-friendly элементы управления
- Компактные карточки для недельного/месячного видов
- Модальные окна адаптированы под мобильные

### Анимации
- Hover эффекты на интерактивных элементах
- Плавные переходы между состояниями
- Transition классы Tailwind

## 🚀 Навигация

### Bottom Navigation
Календарь добавлен в основную навигацию:
```typescript
{
  id: 'calendar',
  label: 'Календарь', 
  icon: CalendarDaysIcon,
  activeIcon: CalendarDaysIconSolid,
}
```

### App Routing
```typescript
case 'calendar':
  return <Calendar />;
```

## 💾 Персистентность

### Local Storage
Данные календаря сохраняются через global store с localStorage:
- Workout данные в `useAppStore`
- Автоматическое восстановление при перезагрузке
- Fallback на mock данные при отсутствии API

### API Integration
Поддержка backend через `aiService`:
```typescript
const workoutsData = await aiService.getWorkouts({
  client_id: userId,
  date_from: dateFrom.toISOString(),
  date_to: dateTo.toISOString()
});
```

## 🔧 Использование

### Основные действия
1. **Переключение видов** - кнопки День/Неделя/Месяц в заголовке
2. **Навигация по датам** - стрелки влево/вправо
3. **Просмотр деталей** - клик по тренировке
4. **Быстрый доступ** - клик по дню в месячном виде

### Индикаторы
- **Цветные точки** - статус тренировки
- **Числовые значки** - количество тренировок при переполнении
- **Выделение сегодня** - особый стиль для текущего дня

## 📊 Данные и статистика

### Mock Data Features
- **Реалистичные паттерны** - тренировки каждые 2-3 дня
- **Разнообразие типов** - силовые, кардио, растяжка
- **Временные слоты** - утренние/дневные тренировки
- **Статусы по логике** - прошлые в основном выполнены, будущие запланированы

### Статистические показатели
- Выполненные тренировки за месяц
- Запланированные на неделю  
- Средняя продолжительность
- Популярные типы тренировок

## 🔮 Возможности развития

### Планируемые улучшения
- Drag & Drop для перепланирования тренировок
- Интеграция с уведомлениями
- Экспорт календаря в iCal/Google Calendar
- Фильтрация по типам тренировок
- Поиск по календарю
- Групповые тренировки и календарь тренера

### Backend интеграция
- CRUD операции для тренировок
- Синхронизация с внешними календарями  
- Push-уведомления о предстоящих тренировках
- Аналитика и отчёты

## 📋 Файлы

### Основные компоненты
- `src/components/dashboard/DashboardCalendar.tsx` - календарь
- `src/pages/Calendar.tsx` - страница календаря
- `src/components/common/BottomNavigation.tsx` - навигация

### Типы и данные
- `src/types/index.ts` - TypeScript интерфейсы
- `src/store/index.ts` - состояние и mock данные

### Routing
- `src/App.tsx` - маршрутизация страниц
- `src/pages/index.ts` - экспорт страниц 