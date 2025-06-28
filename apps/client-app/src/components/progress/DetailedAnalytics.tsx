import React, { useState } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  FireIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  period: 'week' | 'month' | 'quarter' | 'year';
  workouts: {
    total: number;
    completed: number;
    cancelled: number;
    missed: number;
  };
  duration: {
    total: number; // в минутах
    average: number;
    longest: number;
    shortest: number;
  };
  intensity: {
    average: number; // 1-10
    high: number; // количество высокоинтенсивных тренировок
    medium: number;
    low: number;
  };
  calories: {
    total: number;
    average: number;
    best: number;
  };
  consistency: {
    streak: number; // текущая серия
    longestStreak: number;
    weeklyAverage: number;
  };
  bodyMetrics: {
    weight: Array<{ date: string; value: number }>;
    bodyFat?: Array<{ date: string; value: number }>;
    muscle?: Array<{ date: string; value: number }>;
  };
}

interface DetailedAnalyticsProps {
  data?: AnalyticsData;
}

export const DetailedAnalytics: React.FC<DetailedAnalyticsProps> = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeMetric, setActiveMetric] = useState<'workouts' | 'duration' | 'calories' | 'consistency'>('workouts');

  // Mock данные для демонстрации
  const mockData: AnalyticsData = data || {
    period: selectedPeriod,
    workouts: {
      total: 24,
      completed: 20,
      cancelled: 2,
      missed: 2,
    },
    duration: {
      total: 1200, // 20 часов
      average: 60,
      longest: 90,
      shortest: 30,
    },
    intensity: {
      average: 7.2,
      high: 8,
      medium: 12,
      low: 4,
    },
    calories: {
      total: 8400,
      average: 420,
      best: 650,
    },
    consistency: {
      streak: 5,
      longestStreak: 12,
      weeklyAverage: 3.8,
    },
    bodyMetrics: {
      weight: [
        { date: '2024-01-01', value: 82 },
        { date: '2024-01-08', value: 81.5 },
        { date: '2024-01-15', value: 81.2 },
        { date: '2024-01-22', value: 80.8 },
        { date: '2024-01-29', value: 80.5 },
      ],
    },
  };

  const periods = [
    { id: 'week', label: 'Неделя' },
    { id: 'month', label: 'Месяц' },
    { id: 'quarter', label: 'Квартал' },
    { id: 'year', label: 'Год' },
  ];

  const metrics = [
    { id: 'workouts', label: 'Тренировки', icon: CalendarIcon },
    { id: 'duration', label: 'Время', icon: ClockIcon },
    { id: 'calories', label: 'Калории', icon: FireIcon },
    { id: 'consistency', label: 'Постоянство', icon: ChartBarIcon },
  ];

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${remainingMinutes}м`;
    }
    return `${remainingMinutes}м`;
  };

  const getCompletionRate = () => {
    const rate = (mockData.workouts.completed / mockData.workouts.total) * 100;
    return Math.round(rate);
  };

  const getIntensityDistribution = () => {
    const total = mockData.intensity.high + mockData.intensity.medium + mockData.intensity.low;
    return {
      high: Math.round((mockData.intensity.high / total) * 100),
      medium: Math.round((mockData.intensity.medium / total) * 100),
      low: Math.round((mockData.intensity.low / total) * 100),
    };
  };

  const getWeightTrend = () => {
    const weights = mockData.bodyMetrics.weight;
    if (weights.length < 2) return { direction: 'neutral', change: 0 };
    
    const first = weights[0].value;
    const last = weights[weights.length - 1].value;
    const change = last - first;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      change: Math.abs(change),
    };
  };

  const renderOverview = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-2 mb-2">
          <CalendarIcon className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-600">Завершённость</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{getCompletionRate()}%</div>
        <div className="text-xs text-gray-500">
          {mockData.workouts.completed} из {mockData.workouts.total}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-2 mb-2">
          <ClockIcon className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-gray-600">Среднее время</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{mockData.duration.average}м</div>
        <div className="text-xs text-gray-500">за тренировку</div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-2 mb-2">
          <FireIcon className="h-5 w-5 text-orange-600" />
          <span className="text-sm font-medium text-gray-600">Калории/день</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {Math.round(mockData.calories.total / 30)}
        </div>
        <div className="text-xs text-gray-500">в среднем</div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-2 mb-2">
          <ChartBarIcon className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-gray-600">Серия</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{mockData.consistency.streak}</div>
        <div className="text-xs text-gray-500">дней подряд</div>
      </div>
    </div>
  );

  const renderDetailedMetric = () => {
    switch (activeMetric) {
      case 'workouts':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Анализ тренировок</h3>
            
            {/* Статус тренировок */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="text-md font-medium text-gray-900 mb-3">Статус тренировок</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Завершено</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(mockData.workouts.completed / mockData.workouts.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{mockData.workouts.completed}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Отменено</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(mockData.workouts.cancelled / mockData.workouts.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{mockData.workouts.cancelled}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Пропущено</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-500 h-2 rounded-full"
                        style={{ width: `${(mockData.workouts.missed / mockData.workouts.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{mockData.workouts.missed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Распределение интенсивности */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="text-md font-medium text-gray-900 mb-3">Распределение интенсивности</h4>
              <div className="space-y-3">
                {Object.entries(getIntensityDistribution()).map(([level, percentage]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {level === 'high' ? 'Высокая' : level === 'medium' ? 'Средняя' : 'Низкая'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            level === 'high' ? 'bg-red-500' : 
                            level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'duration':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Анализ времени</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <div className="text-2xl font-bold text-gray-900">{formatDuration(mockData.duration.total)}</div>
                <div className="text-sm text-gray-600">Общее время</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <div className="text-2xl font-bold text-green-600">{formatDuration(mockData.duration.longest)}</div>
                <div className="text-sm text-gray-600">Самая долгая</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <div className="text-2xl font-bold text-blue-600">{formatDuration(mockData.duration.average)}</div>
                <div className="text-sm text-gray-600">В среднем</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <div className="text-2xl font-bold text-orange-600">{formatDuration(mockData.duration.shortest)}</div>
                <div className="text-sm text-gray-600">Самая короткая</div>
              </div>
            </div>
          </div>
        );

      case 'calories':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Анализ калорий</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">Прогресс по калориям</span>
                  <span className="text-lg font-bold text-gray-900">{mockData.calories.total.toLocaleString()}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-orange-600">{mockData.calories.total.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Всего</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600">{mockData.calories.average}</div>
                    <div className="text-xs text-gray-600">Среднее</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">{mockData.calories.best}</div>
                    <div className="text-xs text-gray-600">Рекорд</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'consistency':
        const weightTrend = getWeightTrend();
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Анализ постоянства</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <ArrowPathIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Текущая серия</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{mockData.consistency.streak} дней</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                              <div className="flex items-center justify-center space-x-1 mb-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Рекорд серии</span>
              </div>
                <div className="text-2xl font-bold text-green-600">{mockData.consistency.longestStreak} дней</div>
              </div>
            </div>

            {/* Изменение веса */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="text-md font-medium text-gray-900 mb-3">Изменение веса</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Тенденция</span>
                <div className="flex items-center space-x-2">
                  {weightTrend.direction === 'up' ? (
                    <ArrowTrendingUpIcon className="h-5 w-5 text-red-500" />
                  ) : weightTrend.direction === 'down' ? (
                    <ArrowTrendingDownIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-0.5 bg-gray-400" />
                  )}
                  <span className={`text-lg font-bold ${
                    weightTrend.direction === 'down' ? 'text-green-600' : 
                    weightTrend.direction === 'up' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {weightTrend.change > 0 ? `${weightTrend.direction === 'up' ? '+' : '-'}${weightTrend.change}кг` : 'Стабильно'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Детальная аналитика</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {periods.map(period => (
            <option key={period.id} value={period.id}>
              {period.label}
            </option>
          ))}
        </select>
      </div>

      {/* Overview Cards */}
      {renderOverview()}

      {/* Metric Selector */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setActiveMetric(metric.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeMetric === metric.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <metric.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Detailed Metric Analysis */}
      {renderDetailedMetric()}
    </div>
  );
}; 