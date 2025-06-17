import React, { useState } from 'react';
import {
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Header } from '../components/common/Header';
import { TrainingPlan } from '../components/progress/TrainingPlan';
import { useAppStore } from '../store';

export const Progress: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'plan'>('stats');
  const progressData = useAppStore((state) => state.progressData);
  const goals = useAppStore((state) => state.goals);

  const tabs = [
    { id: 'stats', label: 'Статистика', icon: ChartBarIcon },
    { id: 'plan', label: 'План', icon: CalendarIcon },
  ];

  // Mock data for development
  const mockStats = [
    {
      title: 'Всего тренировок',
      value: 42,
      change: '+12 за месяц',
      trend: 'up',
      icon: TrophyIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Сожжено калорий',
      value: 12450,
      change: '+850 за неделю',
      trend: 'up',
      icon: FireIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Время тренировок',
      value: '84ч 30м',
      change: '+6ч за месяц',
      trend: 'up',
      icon: ChartBarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const renderStatsTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4">
        {mockStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-green-600">
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Goals */}
      {goals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Цели</h2>
          </div>
          <div className="p-4 space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{goal.title}</h3>
                  <span className="text-sm text-gray-600">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">График прогресса</h2>
        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">График будет добавлен в следующих версиях</p>
        </div>
      </div>
    </div>
  );

  const renderPlanTab = () => (
    <TrainingPlan />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Прогресс" />
      
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex space-x-8 max-w-md mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'stats' | 'plan')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-6 max-w-md mx-auto">
        {activeTab === 'stats' ? renderStatsTab() : renderPlanTab()}
      </main>
    </div>
  );
}; 