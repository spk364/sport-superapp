// Базовые типы для прогресса и аналитики

export interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'flexibility' | 'other';
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'strength' | 'endurance' | 'consistency' | 'progress' | 'special';
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface WorkoutStats {
  total: number;
  completed: number;
  cancelled: number;
  missed: number;
}

export interface DurationStats {
  total: number; // в минутах
  average: number;
  longest: number;
  shortest: number;
}

export interface IntensityStats {
  average: number; // 1-10
  high: number; // количество высокоинтенсивных тренировок
  medium: number;
  low: number;
}

export interface CalorieStats {
  total: number;
  average: number;
  best: number;
}

export interface ConsistencyStats {
  streak: number; // текущая серия
  longestStreak: number;
  weeklyAverage: number;
}

export interface BodyMetrics {
  weight: Array<{ date: string; value: number }>;
  bodyFat?: Array<{ date: string; value: number }>;
  muscle?: Array<{ date: string; value: number }>;
}

export interface AnalyticsData {
  period: 'week' | 'month' | 'quarter' | 'year';
  workouts: WorkoutStats;
  duration: DurationStats;
  intensity: IntensityStats;
  calories: CalorieStats;
  consistency: ConsistencyStats;
  bodyMetrics: BodyMetrics;
}

export interface MetricItem {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    period: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export interface ProgressSummary {
  totalWorkouts: number;
  totalDuration: number; // в минутах
  averageIntensity: number; // 1-10
  caloriesBurned: number;
  weeklyFrequency: number;
  longestStreak: number;
}

// Типы для Chart компонента
export interface ChartProps {
  title: string;
  data: DataPoint[];
  unit?: string;
  color?: string;
  height?: number;
}

// Периоды для аналитики
export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year';

// Активные метрики для детального анализа
export type ActiveMetric = 'workouts' | 'duration' | 'calories' | 'consistency';

// Табы для страницы прогресса
export type ProgressTab = 'overview' | 'metrics' | 'goals' | 'analytics' | 'plan';

// Типы целей
export type GoalType = 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'flexibility' | 'other';

// Статусы целей
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

// Редкость достижений
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

// Категории достижений
export type AchievementCategory = 'strength' | 'endurance' | 'consistency' | 'progress' | 'special';

// Направления трендов
export type TrendDirection = 'up' | 'down' | 'neutral'; 