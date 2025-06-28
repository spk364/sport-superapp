import React, { useState } from 'react';
import {
  ChartBarIcon,
  TrophyIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Header } from '../components/common/Header';
import { ProgressChart } from '../components/progress/ProgressChart';
import { WorkoutMetrics } from '../components/progress/WorkoutMetrics';
import { GoalsAchievements } from '../components/progress/GoalsAchievements';
import { DetailedAnalytics } from '../components/progress/DetailedAnalytics';
import { TrainingPlan } from '../components/progress/TrainingPlan';

export const Progress: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'goals' | 'analytics' | 'plan'>('overview');

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: ChartBarIcon },
    { id: 'metrics', label: 'Метрики', icon: DocumentChartBarIcon },
    { id: 'goals', label: 'Цели', icon: TrophyIcon },
    { id: 'analytics', label: 'Аналитика', icon: SparklesIcon },
    { id: 'plan', label: 'План', icon: CalendarIcon },
  ];

  // Mock данные для графиков
  const weightData = [
    { date: '2024-01-01', value: 82 },
    { date: '2024-01-08', value: 81.8 },
    { date: '2024-01-15', value: 81.5 },
    { date: '2024-01-22', value: 81.2 },
    { date: '2024-01-29', value: 80.8 },
    { date: '2024-02-05', value: 80.5 },
    { date: '2024-02-12', value: 80.3 },
  ];

  const workoutsData = [
    { date: '2024-01-01', value: 3, label: 'Неделя 1' },
    { date: '2024-01-08', value: 4, label: 'Неделя 2' },
    { date: '2024-01-15', value: 3, label: 'Неделя 3' },
    { date: '2024-01-22', value: 5, label: 'Неделя 4' },
    { date: '2024-01-29', value: 4, label: 'Неделя 5' },
    { date: '2024-02-05', value: 4, label: 'Неделя 6' },
  ];

  const caloriesData = [
    { date: '2024-01-01', value: 1200 },
    { date: '2024-01-08', value: 1400 },
    { date: '2024-01-15', value: 1100 },
    { date: '2024-01-22', value: 1600 },
    { date: '2024-01-29', value: 1350 },
    { date: '2024-02-05', value: 1450 },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Быстрая статистика */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrophyIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Тренировок</span>
          </div>
          <div className="text-2xl font-bold">47</div>
          <div className="text-sm opacity-80">+8 за месяц</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ChartBarIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Прогресс</span>
          </div>
          <div className="text-2xl font-bold">85%</div>
          <div className="text-sm opacity-80">к цели</div>
        </div>
      </div>

      {/* Графики прогресса */}
      <ProgressChart
        title="Изменение веса"
        data={weightData}
        unit="кг"
        color="bg-blue-500"
        height={180}
        enableAppleHealth={true}
        appleHealthDataType="weight"
      />

      <ProgressChart
        title="Тренировки в неделю"
        data={workoutsData}
        unit=" тр."
        color="bg-green-500"
        height={180}
      />

      <ProgressChart
        title="Сожжено калорий"
        data={caloriesData}
        unit=" кал"
        color="bg-orange-500"
        height={180}
        enableAppleHealth={true}
        appleHealthDataType="calories"
      />

      {/* Краткий обзор целей */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Активные цели</h3>
          <button
            onClick={() => setActiveTab('goals')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Все цели →
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Сбросить 5 кг</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
              <span className="text-sm font-medium">60%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Подтянуться 15 раз</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '80%' }} />
              </div>
              <span className="text-sm font-medium">80%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'metrics':
        return <WorkoutMetrics />;
      case 'goals':
        return <GoalsAchievements />;
      case 'analytics':
        return <DetailedAnalytics />;
      case 'plan':
        return <TrainingPlan />;
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Прогресс и аналитика" />
      
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 overflow-x-auto">
        <div className="flex space-x-1 max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-6 max-w-md mx-auto pb-24">
        {renderContent()}
      </main>
    </div>
  );
}; 