import { useState, useEffect, useCallback } from 'react';
import { appleHealthService, HealthMetrics, WorkoutData, HealthKitDataPoint } from '../services/appleHealthService';

interface UseAppleHealthReturn {
  // Состояние
  isAvailable: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Данные
  healthMetrics: HealthMetrics | null;
  lastSyncDate: Date | null;
  
  // Методы
  requestPermissions: () => Promise<boolean>;
  syncHealthData: (startDate?: Date, endDate?: Date) => Promise<void>;
  getWorkouts: (days?: number) => WorkoutData[];
  getStepsToday: () => number;
  getCaloriesToday: () => number;
  getCurrentWeight: () => number | null;
  getAverageHeartRate: () => number | null;
  
  // Утилиты
  refreshData: () => Promise<void>;
  clearData: () => void;
}

export const useAppleHealth = (): UseAppleHealthReturn => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);

  // Инициализация
  useEffect(() => {
    const initializeHealthKit = async () => {
      try {
        const available = appleHealthService.isAvailable();
        setIsAvailable(available);
        
        // Проверяем сохраненные разрешения
        const savedAuth = localStorage.getItem('appleHealthAuthorized');
        if (savedAuth === 'true') {
          setIsAuthorized(true);
          // Автоматически синхронизируем данные при инициализации
          await syncHealthData();
        }
      } catch (err) {
        setError('Ошибка инициализации Apple Health');
        console.error('Health initialization error:', err);
      }
    };

    initializeHealthKit();
  }, []);

  // Запрос разрешений
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const granted = await appleHealthService.requestPermissions();
      setIsAuthorized(granted);
      
      if (granted) {
        localStorage.setItem('appleHealthAuthorized', 'true');
        // Сразу синхронизируем данные после получения разрешений
        await syncHealthData();
      }
      
      return granted;
    } catch (err) {
      setError('Ошибка запроса разрешений');
      console.error('Permission request error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Синхронизация данных
  const syncHealthData = useCallback(async (
    startDate?: Date, 
    endDate?: Date
  ): Promise<void> => {
    if (!isAvailable) {
      setError('Apple Health недоступен');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 дней назад
      const end = endDate || new Date();
      
      const metrics = await appleHealthService.getHealthMetrics(start, end);
      setHealthMetrics(metrics);
      setLastSyncDate(new Date());
      
      // Синхронизируем с сервером
      await appleHealthService.syncWithServer(metrics);
      
    } catch (err) {
      setError('Ошибка синхронизации данных');
      console.error('Sync error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable]);

  // Получение тренировок за последние N дней
  const getWorkouts = useCallback((days: number = 7): WorkoutData[] => {
    if (!healthMetrics?.workouts) return [];
    
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return healthMetrics.workouts.filter(workout => 
      workout.startDate >= cutoffDate
    );
  }, [healthMetrics]);

  // Шаги за сегодня
  const getStepsToday = useCallback((): number => {
    if (!healthMetrics?.steps) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySteps = healthMetrics.steps.find(step => {
      const stepDate = new Date(step.date);
      stepDate.setHours(0, 0, 0, 0);
      return stepDate.getTime() === today.getTime();
    });
    
    return todaySteps?.value || 0;
  }, [healthMetrics]);

  // Калории за сегодня
  const getCaloriesToday = useCallback((): number => {
    if (!healthMetrics?.calories) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCalories = healthMetrics.calories.find(cal => {
      const calDate = new Date(cal.date);
      calDate.setHours(0, 0, 0, 0);
      return calDate.getTime() === today.getTime();
    });
    
    return todayCalories?.value || 0;
  }, [healthMetrics]);

  // Текущий вес
  const getCurrentWeight = useCallback((): number | null => {
    if (!healthMetrics?.weight || healthMetrics.weight.length === 0) return null;
    
    // Сортируем по дате и берем последнее значение
    const sortedWeight = [...healthMetrics.weight].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedWeight[0]?.value || null;
  }, [healthMetrics]);

  // Средний пульс покоя
  const getAverageHeartRate = useCallback((): number | null => {
    if (!healthMetrics?.heartRate || healthMetrics.heartRate.length === 0) return null;
    
    const restingHeartRates = healthMetrics.heartRate.filter(
      hr => hr.metadata?.type === 'resting'
    );
    
    if (restingHeartRates.length === 0) return null;
    
    const average = restingHeartRates.reduce((sum, hr) => sum + hr.value, 0) / restingHeartRates.length;
    return Math.round(average);
  }, [healthMetrics]);

  // Обновление данных
  const refreshData = useCallback(async (): Promise<void> => {
    await syncHealthData();
  }, [syncHealthData]);

  // Очистка данных
  const clearData = useCallback((): void => {
    setHealthMetrics(null);
    setLastSyncDate(null);
    setIsAuthorized(false);
    setError(null);
    localStorage.removeItem('appleHealthAuthorized');
  }, []);

  return {
    // Состояние
    isAvailable,
    isAuthorized,
    isLoading,
    error,
    
    // Данные
    healthMetrics,
    lastSyncDate,
    
    // Методы
    requestPermissions,
    syncHealthData,
    getWorkouts,
    getStepsToday,
    getCaloriesToday,
    getCurrentWeight,
    getAverageHeartRate,
    
    // Утилиты
    refreshData,
    clearData
  };
}; 