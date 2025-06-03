import React, { useState } from 'react';
import {
  ChartBarIcon,
  ScaleIcon,
  TrophyIcon,
  CameraIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Header } from '../components/common/Header';
import { useAppStore } from '../store';

export const Progress: React.FC = () => {
  const { progressData, goals } = useAppStore();
  const [activeTab, setActiveTab] = useState<'metrics' | 'goals' | 'photos'>('metrics');

  const latestProgress = progressData[progressData.length - 1];

  const tabs = [
    { id: 'metrics', name: 'Показатели', icon: ChartBarIcon },
    { id: 'goals', name: 'Цели', icon: TrophyIcon },
    { id: 'photos', name: 'Фото', icon: CameraIcon },
  ];

  const renderMetrics = () => (
    <div className="space-y-6">
      {/* Weight Progress */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ScaleIcon className="h-5 w-5 mr-2 text-primary-600" />
            Вес
          </h3>
          <button className="text-primary-600 text-sm font-medium">
            Добавить запись
          </button>
        </div>
        
        {latestProgress?.weight ? (
          <div className="space-y-3">
            <div className="text-3xl font-bold text-gray-900">
              {latestProgress.weight} кг
            </div>
            <div className="text-sm text-gray-600">
              Последнее обновление: {new Date(latestProgress.date).toLocaleDateString('ru-RU')}
            </div>
            
            {/* Mock chart placeholder */}
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">График изменения веса</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ScaleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Добавьте первую запись веса</p>
          </div>
        )}
      </div>

      {/* Body Measurements */}
      {latestProgress?.measurements && (
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Замеры тела</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(latestProgress.measurements).map(([key, value]) => {
              if (!value) return null;
              const labels: any = {
                chest: 'Грудь',
                waist: 'Талия',
                hips: 'Бёдра',
                biceps: 'Бицепс',
                thigh: 'Бедро',
              };
              
              return (
                <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">{value} см</div>
                  <div className="text-sm text-gray-600">{labels[key]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strength Metrics */}
      {latestProgress?.strengthMetrics && (
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Силовые показатели</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(latestProgress.strengthMetrics).map(([key, value]) => {
              if (!value) return null;
              const labels: any = {
                benchPress: 'Жим лёжа',
                squat: 'Приседания',
                deadlift: 'Становая тяга',
                pullUps: 'Подтягивания',
              };
              
              return (
                <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {value} {key === 'pullUps' ? 'раз' : 'кг'}
                  </div>
                  <div className="text-sm text-gray-600">{labels[key]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-4">
      {goals.length > 0 ? (
        goals.map((goal) => (
          <div key={goal.id} className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{goal.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                goal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {goal.status === 'completed' ? 'Достигнуто' :
                 goal.status === 'active' ? 'Активно' : 'Приостановлено'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Прогресс</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Цель до {new Date(goal.targetDate).toLocaleDateString('ru-RU')}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <TrophyIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет активных целей</h3>
          <p className="text-gray-600 mb-4">Поставьте свою первую цель!</p>
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Добавить цель
          </button>
        </div>
      )}
    </div>
  );

  const renderPhotos = () => (
    <div className="space-y-4">
      <div className="text-center py-12">
        <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Фото прогресса</h3>
        <p className="text-gray-600 mb-4">Добавляйте фото для отслеживания визуального прогресса</p>
        <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Добавить фото
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Прогресс" />
      
      <div className="px-4 py-6 pb-24">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'metrics' && renderMetrics()}
        {activeTab === 'goals' && renderGoals()}
        {activeTab === 'photos' && renderPhotos()}
      </div>
    </div>
  );
}; 