import React from 'react';
import {
  ClockIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { useAppleHealth } from '../../hooks/useAppleHealth';
import { AppleHealthIntegration } from './AppleHealthIntegration';

interface MetricItem {
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

interface WorkoutMetricsProps {
  data?: {
    totalWorkouts: number;
    totalDuration: number; // в минутах
    averageIntensity: number; // 1-10
    caloriesBurned: number;
    weeklyFrequency: number;
    longestStreak: number;
  };
}

export const WorkoutMetrics: React.FC<WorkoutMetricsProps> = ({ data }) => {
  const {
    isAuthorized,
    healthMetrics,
    getWorkouts,
    getCaloriesToday,
    getCurrentWeight,
    getAverageHeartRate,
  } = useAppleHealth();

  // Вычисляем метрики из Apple Health данных
  const calculateMetricsFromHealth = () => {
    if (!isAuthorized || !healthMetrics) {
      return null;
    }

    const workouts = getWorkouts(30); // последние 30 дней
    const totalCalories = healthMetrics.calories.reduce((sum, cal) => sum + cal.value, 0);
    const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
    const avgHeartRate = getAverageHeartRate();

    return {
      totalWorkouts: workouts.length,
      totalDuration,
      averageIntensity: avgHeartRate ? Math.min(10, Math.max(1, (avgHeartRate - 60) / 10)) : 7.2,
      caloriesBurned: totalCalories,
      weeklyFrequency: workouts.length / 4.3, // 30 дней / 7 дней в неделе
      longestStreak: 12, // TODO: вычислить реальную серию
    };
  };

  // Используем данные из Apple Health или fallback на mock/переданные данные
  const healthData = calculateMetricsFromHealth();
  const metrics = healthData || data || {
    totalWorkouts: 47,
    totalDuration: 2820, // 47 часов
    averageIntensity: 7.2,
    caloriesBurned: 14250,
    weeklyFrequency: 3.8,
    longestStreak: 12,
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}ч ${remainingMinutes}м`;
  };

  const getIntensityLevel = (intensity: number): string => {
    if (intensity >= 8) return 'Высокая';
    if (intensity >= 6) return 'Средняя';
    if (intensity >= 4) return 'Умеренная';
    return 'Низкая';
  };

  const metricsData: MetricItem[] = [
    {
      title: 'Всего тренировок',
      value: metrics.totalWorkouts,
      subtitle: 'за все время',
      trend: {
        direction: 'up',
        value: '+8',
        period: 'за месяц',
      },
      icon: TrophyIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Время тренировок',
      value: formatDuration(metrics.totalDuration),
      subtitle: 'общее время',
      trend: {
        direction: 'up',
        value: '+4ч 20м',
        period: 'за месяц',
      },
      icon: ClockIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Средняя интенсивность',
      value: `${metrics.averageIntensity}/10`,
      subtitle: getIntensityLevel(metrics.averageIntensity),
      trend: {
        direction: 'up',
        value: '+0.3',
        period: 'за месяц',
      },
      icon: BoltIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Сожжено калорий',
      value: metrics.caloriesBurned.toLocaleString(),
      subtitle: 'всего калорий',
      trend: {
        direction: 'up',
        value: '+1,200',
        period: 'за неделю',
      },
      icon: FireIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Частота тренировок',
      value: `${metrics.weeklyFrequency}/нед`,
      subtitle: 'в среднем',
      trend: {
        direction: 'up',
        value: '+0.5',
        period: 'за месяц',
      },
      icon: CalendarDaysIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Рекорд подряд',
      value: `${metrics.longestStreak} дней`,
      subtitle: 'максимальная серия',
      trend: {
        direction: 'neutral',
        value: 'текущий',
        period: 'рекорд',
      },
      icon: ArrowTrendingUpIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-gray-900">Метрики тренировок</h2>
          {isAuthorized && healthData && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 rounded-full">
              <HeartIcon className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-red-600">Apple Health</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {isAuthorized && healthData ? 'Данные из Apple Health' : 'Последние 30 дней'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {metricsData.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-500">{metric.subtitle}</p>
                </div>
              </div>
              
              {metric.trend && (
                <div className="text-right">
                  <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend.direction)}`}>
                    {getTrendIcon(metric.trend.direction)}
                    <span className="text-sm font-medium">{metric.trend.value}</span>
                  </div>
                  <p className="text-xs text-gray-500">{metric.trend.period}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Дополнительная статистика */}
      <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Анализ активности</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((metrics.totalWorkouts / 12) * 10) / 10}
            </div>
            <div className="text-xs text-gray-600">тренировок/месяц</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(metrics.totalDuration / metrics.totalWorkouts)}м
            </div>
            <div className="text-xs text-gray-600">средняя длительность</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(metrics.caloriesBurned / metrics.totalWorkouts)}
            </div>
            <div className="text-xs text-gray-600">калорий/тренировка</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(metrics.weeklyFrequency * 52)}
            </div>
            <div className="text-xs text-gray-600">тренировок/год</div>
          </div>
        </div>
      </div>

      {/* Apple Health Integration */}
      <AppleHealthIntegration />
    </div>
  );
}; 