import React, { useState } from 'react';
import { ChevronDownIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useAppleHealth } from '../../hooks/useAppleHealth';

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface ProgressChartProps {
  title: string;
  data: DataPoint[];
  unit?: string;
  color?: string;
  height?: number;
  enableAppleHealth?: boolean;
  appleHealthDataType?: 'weight' | 'steps' | 'calories';
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  title,
  data,
  unit = '',
  color = 'bg-primary-500',
  height = 200,
  enableAppleHealth = false,
  appleHealthDataType
}) => {
  const { isAuthorized, healthMetrics } = useAppleHealth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Получаем данные из Apple Health если нужно
  const getAppleHealthData = (): DataPoint[] => {
    if (!enableAppleHealth || !isAuthorized || !healthMetrics || !appleHealthDataType) {
      return data;
    }

    switch (appleHealthDataType) {
      case 'weight':
        return healthMetrics.weight.map((w: any) => ({
          date: w.date.toString(),
          value: w.value,
          label: `${w.value}${w.unit}`
        }));
      case 'steps':
        return healthMetrics.steps.map((s: any) => ({
          date: s.date.toString(),
          value: s.value,
          label: `${s.value} шагов`
        }));
      case 'calories':
        return healthMetrics.calories.map((c: any) => ({
          date: c.date.toString(),
          value: c.value,
          label: `${c.value} ккал`
        }));
      default:
        return data;
    }
  };

  const chartData = getAppleHealthData();
  const isUsingAppleHealth = enableAppleHealth && isAuthorized && healthMetrics && appleHealthDataType;
  
  const periods = [
    { id: 'week', label: 'Неделя' },
    { id: 'month', label: 'Месяц' },
    { id: 'year', label: 'Год' },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));
  const range = maxValue - minValue || 1;

  const getBarHeight = (value: number) => {
    return ((value - minValue) / range) * 80 + 10; // 10-90% height range
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {isUsingAppleHealth && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 rounded-full">
                <HeartIcon className="h-3 w-3 text-red-600" />
                <span className="text-xs font-medium text-red-600">Health</span>
              </div>
            )}
          </div>
        <div className="relative">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="appearance-none bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {periods.map(period => (
              <option key={period.id} value={period.id}>
                {period.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 w-8">
          <span>{maxValue}{unit}</span>
          <span>{Math.round((maxValue + minValue) / 2)}{unit}</span>
          <span>{minValue}{unit}</span>
        </div>

        {/* Chart area */}
        <div className="ml-10 h-full flex items-end justify-between space-x-1">
          {chartData.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div
                className={`w-full ${color} rounded-t-sm transition-all duration-300 hover:opacity-80 relative group-hover:scale-105`}
                style={{ height: `${getBarHeight(point.value)}%` }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {point.value}{unit}
                    {point.label && <div className="text-gray-300">{point.label}</div>}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                {formatDate(point.date)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{maxValue}{unit}</div>
          <div className="text-xs text-gray-500">Максимум</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length)}{unit}
          </div>
          <div className="text-xs text-gray-500">Среднее</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {chartData.length > 1 ? `+${Math.round(((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100)}%` : '0%'}
          </div>
          <div className="text-xs text-gray-500">Рост</div>
        </div>
      </div>
    </div>
  );
}; 