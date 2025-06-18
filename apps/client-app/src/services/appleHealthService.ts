// Apple Health Integration Service
// Использует HealthKit API через веб-интерфейс

interface HealthKitPermissions {
  read: HealthDataType[];
  write?: HealthDataType[];
}

export type HealthDataType = 
  | 'steps'
  | 'distance'
  | 'activeEnergyBurned'
  | 'basalEnergyBurned'
  | 'heartRate'
  | 'bodyMass'
  | 'height'
  | 'bodyFatPercentage'
  | 'leanBodyMass'
  | 'workouts'
  | 'sleepAnalysis'
  | 'restingHeartRate'
  | 'vo2Max'
  | 'bloodPressure'
  | 'bloodGlucose';

export interface HealthKitDataPoint {
  value: number;
  unit: string;
  date: Date;
  source: string;
  metadata?: Record<string, any>;
}

export interface WorkoutData {
  id: string;
  type: WorkoutType;
  startDate: Date;
  endDate: Date;
  duration: number; // minutes
  totalEnergyBurned?: number; // calories
  totalDistance?: number; // meters
  averageHeartRate?: number;
  maxHeartRate?: number;
  metadata?: {
    indoorWorkout?: boolean;
    swimmingLocationType?: string;
    elevation?: number;
  };
}

export type WorkoutType = 
  | 'running'
  | 'walking'
  | 'cycling'
  | 'swimming'
  | 'strength'
  | 'yoga'
  | 'pilates'
  | 'dancing'
  | 'boxing'
  | 'climbing'
  | 'rowing'
  | 'crossTraining'
  | 'other';

export interface HealthMetrics {
  steps: HealthKitDataPoint[];
  calories: HealthKitDataPoint[];
  weight: HealthKitDataPoint[];
  heartRate: HealthKitDataPoint[];
  workouts: WorkoutData[];
  sleep: SleepData[];
  bodyComposition: {
    bodyFat?: HealthKitDataPoint[];
    leanMass?: HealthKitDataPoint[];
  };
}

export interface SleepData {
  startDate: Date;
  endDate: Date;
  value: number; // hours
  stage: 'inBed' | 'asleep' | 'awake' | 'core' | 'deep' | 'rem';
}

class AppleHealthService {
  private isHealthKitAvailable = false;
  private permissions: HealthKitPermissions = {
    read: [
      'steps',
      'distance',
      'activeEnergyBurned',
      'heartRate',
      'bodyMass',
      'bodyFatPercentage',
      'workouts',
      'sleepAnalysis',
      'restingHeartRate'
    ]
  };

  constructor() {
    this.checkAvailability();
  }

  /**
   * Проверяет доступность HealthKit
   */
  private checkAvailability(): void {
    // Проверяем наличие HealthKit API
    if (typeof window !== 'undefined') {
      // @ts-ignore - HealthKit API может быть недоступен в типах
      this.isHealthKitAvailable = !!(window.webkit?.messageHandlers?.healthKit);
    }
  }

  /**
   * Запрашивает разрешения для доступа к данным Health
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!this.isHealthKitAvailable) {
        console.warn('HealthKit недоступен на этом устройстве');
        return false;
      }

      // Для веб-версии используем заглушку
      // В реальном iOS приложении здесь будет вызов нативного API
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Health permissions requested');
          resolve(true);
        }, 1000);
      });

    } catch (error) {
      console.error('Ошибка запроса разрешений HealthKit:', error);
      return false;
    }
  }

  /**
   * Получает данные о шагах за указанный период
   */
  async getStepsData(startDate: Date, endDate: Date): Promise<HealthKitDataPoint[]> {
    try {
      if (!this.isHealthKitAvailable) {
        return this.getMockStepsData(startDate, endDate);
      }

      // Реальный вызов HealthKit API
      // В production здесь будет нативный мост
      return this.getMockStepsData(startDate, endDate);

    } catch (error) {
      console.error('Ошибка получения данных о шагах:', error);
      return [];
    }
  }

  /**
   * Получает данные о калориях за указанный период
   */
  async getCaloriesData(startDate: Date, endDate: Date): Promise<HealthKitDataPoint[]> {
    try {
      if (!this.isHealthKitAvailable) {
        return this.getMockCaloriesData(startDate, endDate);
      }

      return this.getMockCaloriesData(startDate, endDate);

    } catch (error) {
      console.error('Ошибка получения данных о калориях:', error);
      return [];
    }
  }

  /**
   * Получает данные о весе
   */
  async getWeightData(startDate: Date, endDate: Date): Promise<HealthKitDataPoint[]> {
    try {
      if (!this.isHealthKitAvailable) {
        return this.getMockWeightData(startDate, endDate);
      }

      return this.getMockWeightData(startDate, endDate);

    } catch (error) {
      console.error('Ошибка получения данных о весе:', error);
      return [];
    }
  }

  /**
   * Получает данные о тренировках
   */
  async getWorkoutsData(startDate: Date, endDate: Date): Promise<WorkoutData[]> {
    try {
      if (!this.isHealthKitAvailable) {
        return this.getMockWorkoutsData(startDate, endDate);
      }

      return this.getMockWorkoutsData(startDate, endDate);

    } catch (error) {
      console.error('Ошибка получения данных о тренировках:', error);
      return [];
    }
  }

  /**
   * Получает данные о сне
   */
  async getSleepData(startDate: Date, endDate: Date): Promise<SleepData[]> {
    try {
      if (!this.isHealthKitAvailable) {
        return this.getMockSleepData(startDate, endDate);
      }

      return this.getMockSleepData(startDate, endDate);

    } catch (error) {
      console.error('Ошибка получения данных о сне:', error);
      return [];
    }
  }

  /**
   * Получает данные о сердечном ритме
   */
  async getHeartRateData(startDate: Date, endDate: Date): Promise<HealthKitDataPoint[]> {
    try {
      if (!this.isHealthKitAvailable) {
        return this.getMockHeartRateData(startDate, endDate);
      }

      return this.getMockHeartRateData(startDate, endDate);

    } catch (error) {
      console.error('Ошибка получения данных о пульсе:', error);
      return [];
    }
  }

  /**
   * Получает полный набор метрик здоровья
   */
  async getHealthMetrics(startDate: Date, endDate: Date): Promise<HealthMetrics> {
    try {
      const [steps, calories, weight, heartRate, workouts, sleep] = await Promise.all([
        this.getStepsData(startDate, endDate),
        this.getCaloriesData(startDate, endDate),
        this.getWeightData(startDate, endDate),
        this.getHeartRateData(startDate, endDate),
        this.getWorkoutsData(startDate, endDate),
        this.getSleepData(startDate, endDate)
      ]);

      return {
        steps,
        calories,
        weight,
        heartRate,
        workouts,
        sleep,
        bodyComposition: {
          bodyFat: [],
          leanMass: []
        }
      };

    } catch (error) {
      console.error('Ошибка получения метрик здоровья:', error);
      throw error;
    }
  }

  /**
   * Синхронизирует данные с сервером
   */
  async syncWithServer(metrics: HealthMetrics): Promise<boolean> {
    try {
      // Здесь будет вызов API для сохранения данных на сервере
      console.log('Синхронизация с сервером:', metrics);
      
      // Имитация API вызова
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;

    } catch (error) {
      console.error('Ошибка синхронизации:', error);
      return false;
    }
  }

  // Mock данные для демонстрации
  private getMockStepsData(startDate: Date, endDate: Date): HealthKitDataPoint[] {
    const data: HealthKitDataPoint[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      data.push({
        value: Math.floor(Math.random() * 5000) + 8000, // 8000-13000 шагов
        unit: 'steps',
        date,
        source: 'Apple Health',
        metadata: {
          device: 'iPhone',
          confidence: 'high'
        }
      });
    }
    
    return data;
  }

  private getMockCaloriesData(startDate: Date, endDate: Date): HealthKitDataPoint[] {
    const data: HealthKitDataPoint[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      data.push({
        value: Math.floor(Math.random() * 800) + 400, // 400-1200 калорий
        unit: 'kcal',
        date,
        source: 'Apple Health'
      });
    }
    
    return data;
  }

  private getMockWeightData(startDate: Date, endDate: Date): HealthKitDataPoint[] {
    const data: HealthKitDataPoint[] = [];
    let currentWeight = 78.5;
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i += 3) { // Замеры каждые 3 дня
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Постепенное снижение веса с вариациями
      currentWeight += (Math.random() - 0.7) * 0.3;
      
      data.push({
        value: Math.round(currentWeight * 10) / 10,
        unit: 'kg',
        date,
        source: 'Apple Health'
      });
    }
    
    return data;
  }

  private getMockWorkoutsData(startDate: Date, endDate: Date): WorkoutData[] {
    const workouts: WorkoutData[] = [];
    const workoutTypes: WorkoutType[] = ['running', 'strength', 'cycling', 'swimming', 'yoga'];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      if (Math.random() > 0.6) { // 40% шанс тренировки в день
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const startTime = new Date(date);
        startTime.setHours(Math.floor(Math.random() * 12) + 8); // 8-20 часов
        
        const duration = Math.floor(Math.random() * 60) + 30; // 30-90 минут
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + duration);
        
        workouts.push({
          id: `workout_${i}_${Date.now()}`,
          type: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
          startDate: startTime,
          endDate: endTime,
          duration,
          totalEnergyBurned: Math.floor(Math.random() * 400) + 200,
          totalDistance: Math.floor(Math.random() * 8000) + 2000,
          averageHeartRate: Math.floor(Math.random() * 60) + 120,
          maxHeartRate: Math.floor(Math.random() * 40) + 160
        });
      }
    }
    
    return workouts;
  }

  private getMockSleepData(startDate: Date, endDate: Date): SleepData[] {
    const data: SleepData[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const sleepStart = new Date(date);
      sleepStart.setHours(22 + Math.floor(Math.random() * 3)); // 22-01 время сна
      
      const sleepDuration = 6 + Math.random() * 3; // 6-9 часов
      const sleepEnd = new Date(sleepStart);
      sleepEnd.setHours(sleepEnd.getHours() + sleepDuration);
      
      data.push({
        startDate: sleepStart,
        endDate: sleepEnd,
        value: sleepDuration,
        stage: 'asleep'
      });
    }
    
    return data;
  }

  private getMockHeartRateData(startDate: Date, endDate: Date): HealthKitDataPoint[] {
    const data: HealthKitDataPoint[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Утренний пульс покоя
      data.push({
        value: Math.floor(Math.random() * 20) + 60, // 60-80 bpm
        unit: 'bpm',
        date,
        source: 'Apple Health',
        metadata: {
          type: 'resting'
        }
      });
    }
    
    return data;
  }

  /**
   * Проверяет статус доступности
   */
  isAvailable(): boolean {
    return this.isHealthKitAvailable;
  }

  /**
   * Получает информацию о поддерживаемых типах данных
   */
  getSupportedDataTypes(): HealthDataType[] {
    return this.permissions.read;
  }
}

// Экспортируем singleton instance
export const appleHealthService = new AppleHealthService(); 