# Workout Calendar Implementation

## Overview
Added mock training data to the calendar widget on the main dashboard screen, with both frontend mock data and backend API support.

## Implementation Details

### 1. Frontend Mock Data (Store)
**File**: `apps/client-app/src/store/index.ts`

- **Added `createMockWorkouts()` function**: Creates 3 weeks of varied workout data
- **Added `loadMockWorkouts()` action**: Loads mock data into store
- **Added `fetchWorkouts()` action**: Fetches from API with fallback to mock data

**Mock Data Features**:
- **21 days of workouts**: Past week + current week + next 2 weeks  
- **Variety**: Strength, cardio, flexibility workouts
- **Different trainers**: Александр Петров, Мария Иванова, AI Тренер
- **Realistic statuses**: 
  - Past workouts: 80% completed, 10% missed, 10% cancelled
  - Future workouts: scheduled
- **Locations**: Спортзал, Домашняя тренировка, Парк, Фитнес-центр
- **Duration**: 45-75 minutes per workout
- **Exercises**: Sample exercises for each workout type

### 2. Backend API Endpoint
**File**: `apps/virtual-trainer-app/backend/api/v1/endpoints/workouts.py`

**Endpoints Created**:
- `GET /api/v1/workouts` - Get workouts with filtering
- `POST /api/v1/workouts` - Create new workout  
- `GET /api/v1/workouts/{id}` - Get specific workout
- `PUT /api/v1/workouts/{id}` - Update workout
- `DELETE /api/v1/workouts/{id}` - Delete workout

**Features**:
- **Query parameters**: `client_id`, `date_from`, `date_to`, `status`
- **Mock data generator**: `create_mock_workouts()` function
- **Proper schemas**: `WorkoutResponse`, `WorkoutCreate`, `WorkoutUpdate`
- **Error handling**: Comprehensive error responses

### 3. API Integration  
**File**: `apps/client-app/src/services/aiService.ts`

- **Added `getWorkouts()` method**: Fetches workouts from backend API
- **Query parameter support**: For filtering by date range, client, status
- **Type-safe**: Uses proper TypeScript interfaces

### 4. Dashboard Integration
**File**: `apps/client-app/src/pages/Dashboard.tsx`

- **Auto-load on mount**: Fetches workouts when component loads
- **Uses user ID**: Passes current user ID to API
- **Fallback support**: If API fails, falls back to frontend mock data

## Calendar Display Features

### Visual Status Indicators
- 🟢 **Green dot**: Completed workouts
- 🔵 **Blue dot**: Scheduled workouts  
- 🔴 **Red dot**: Cancelled workouts
- ⚫ **Gray dot**: Missed workouts

### Interactive Features
- **Click on day**: View workout details if there's one workout
- **Multiple workouts**: Shows count (e.g. "+2")
- **Today highlighting**: Current date highlighted in blue
- **Month navigation**: Previous/next month buttons

### Workout Details Modal
When clicking on a workout day:
- **Workout name**: e.g. "Силовая тренировка"
- **Date and time**: Full datetime display
- **Duration**: Workout length in minutes
- **Location**: Where the workout takes place
- **Trainer info**: Trainer name and avatar
- **Description**: Workout focus and details
- **Status**: Current workout status

## Sample Data Examples

### Typical Week Schedule:
```
Monday: Силовая тренировка (60 мин) - Спортзал
Tuesday: Кардио тренировка (45 мин) - Парк  
Wednesday: REST DAY
Thursday: Тренировка ног (50 мин) - Спортзал
Friday: Йога (30 мин) - Домашняя тренировка
Saturday: HIIT тренировка (40 мин) - Фитнес-центр
Sunday: REST DAY
```

### Workout Types:
- **Strength**: Силовая тренировка, Тренировка верха тела, Тренировка ног
- **Cardio**: Кардио тренировка, HIIT тренировка, Бег, Велотренировка  
- **Flexibility**: Растяжка, Йога, Пилатес, Мобильность

## Technical Benefits

✅ **Immediate visual feedback**: Calendar shows workout distribution
✅ **Realistic data**: Varied workout types, trainers, locations
✅ **Status tracking**: Visual progress indication
✅ **API ready**: Backend endpoint ready for real data
✅ **Fallback support**: Works even if backend is down
✅ **Mobile responsive**: Calendar works on all screen sizes
✅ **Interactive**: Click to view workout details

## Next Steps

1. **Real database integration**: Replace mock data with actual DB queries
2. **User-specific data**: Filter workouts by authenticated user
3. **Workout creation**: Add UI to schedule new workouts
4. **Progress tracking**: Track completion rates and streaks
5. **Notifications**: Remind users of upcoming workouts

The calendar now provides a comprehensive view of training schedules with realistic mock data that demonstrates the full functionality! 