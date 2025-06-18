import React, { useState } from 'react';
import {
  TrophyIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  FireIcon,
  HeartIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Goal {
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

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'strength' | 'endurance' | 'consistency' | 'progress' | 'special';
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface GoalsAchievementsProps {
  goals?: Goal[];
  achievements?: Achievement[];
}

export const GoalsAchievements: React.FC<GoalsAchievementsProps> = ({ 
  goals = [], 
  achievements = [] 
}) => {
  const [activeTab, setActiveTab] = useState<'goals' | 'achievements'>('goals');

  // Mock данные для демонстрации
  const mockGoals: Goal[] = goals.length > 0 ? goals : [
    {
      id: '1',
      title: 'Сбросить 5 кг',
      description: 'Снизить вес до 75 кг к концу месяца',
      type: 'weight_loss',
      targetValue: 75,
      currentValue: 78,
      unit: 'кг',
      targetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'active',
      progress: 60,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Подтянуться 15 раз',
      description: 'Увеличить количество подтягиваний',
      type: 'strength',
      targetValue: 15,
      currentValue: 12,
      unit: 'раз',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      progress: 80,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Бегать 5 км',
      description: 'Пробежать 5 км без остановки',
      type: 'endurance',
      targetValue: 5,
      currentValue: 5,
      unit: 'км',
      targetDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'completed',
      progress: 100,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
  ];

  const mockAchievements: Achievement[] = achievements.length > 0 ? achievements : [
    {
      id: '1',
      title: 'Первая тренировка',
      description: 'Завершили свою первую тренировку',
      icon: '🏃‍♂️',
      category: 'progress',
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      rarity: 'common',
    },
    {
      id: '2',
      title: 'Неделя подряд',
      description: 'Тренировались 7 дней подряд',
      icon: '🔥',
      category: 'consistency',
      unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      rarity: 'rare',
    },
    {
      id: '3',
      title: 'Силач',
      description: 'Подняли свой собственный вес',
      icon: '💪',
      category: 'strength',
      unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      rarity: 'epic',
    },
    {
      id: '4',
      title: 'Марафонец',
      description: 'Пробежали 42 км за месяц',
      icon: '🏃‍♂️',
      category: 'endurance',
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      rarity: 'legendary',
    },
  ];

  const getGoalTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'weight_loss': return FireIcon;
      case 'muscle_gain': return BoltIcon;
      case 'strength': return TrophyIcon;
      case 'endurance': return HeartIcon;
      case 'flexibility': return StarIcon;
      default: return CheckCircleIcon;
    }
  };

  const getGoalTypeColor = (type: Goal['type']) => {
    switch (type) {
      case 'weight_loss': return 'text-red-600 bg-red-100';
      case 'muscle_gain': return 'text-blue-600 bg-blue-100';
      case 'strength': return 'text-purple-600 bg-purple-100';
      case 'endurance': return 'text-green-600 bg-green-100';
      case 'flexibility': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
    }
  };

  const getRarityBadge = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      case 'epic': return 'bg-purple-500 text-white';
      case 'legendary': return 'bg-yellow-500 text-white';
    }
  };

  const formatTimeLeft = (targetDate: Date) => {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Просрочено';
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Завтра';
    return `${days} дней`;
  };

  const renderGoals = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Мои цели</h2>
        <button className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-4 w-4" />
          <span>Добавить цель</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockGoals.map((goal) => {
          const IconComponent = getGoalTypeIcon(goal.type);
          const colorClasses = getGoalTypeColor(goal.type);
          
          return (
            <div key={goal.id} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-primary-500">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${colorClasses}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                </div>
                
                {goal.status === 'completed' ? (
                  <CheckCircleIconSolid className="h-6 w-6 text-green-500" />
                ) : goal.status === 'cancelled' ? (
                  <XCircleIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <ClockIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>

              <div className="space-y-3">
                {/* Прогресс */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Прогресс</span>
                    <span className="font-medium">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        goal.status === 'completed' ? 'bg-green-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-center text-sm font-medium text-gray-600 mt-1">
                    {goal.progress}%
                  </div>
                </div>

                {/* Информация о сроках */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {goal.status === 'completed' ? 'Завершено' : 'Осталось'}
                  </span>
                  <span className={`font-medium ${
                    goal.status === 'completed' 
                      ? 'text-green-600' 
                      : formatTimeLeft(goal.targetDate) === 'Просрочено'
                        ? 'text-red-600'
                        : 'text-gray-900'
                  }`}>
                    {goal.status === 'completed' 
                      ? goal.targetDate.toLocaleDateString('ru-RU')
                      : formatTimeLeft(goal.targetDate)
                    }
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Достижения</h2>
        <div className="text-sm text-gray-500">{mockAchievements.length} из 50</div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockAchievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`rounded-lg p-4 border-2 ${getRarityColor(achievement.rarity)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-3xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityBadge(achievement.rarity)}`}>
                    {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="capitalize">{achievement.category}</span>
                  <span>•</span>
                  <span>{achievement.unlockedAt.toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
              <div className="flex space-x-1">
                {[...Array(achievement.rarity === 'legendary' ? 5 : achievement.rarity === 'epic' ? 4 : achievement.rarity === 'rare' ? 3 : 2)].map((_, i) => (
                  <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Статистика достижений */}
      <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика достижений</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-500">
              {mockAchievements.filter(a => a.rarity === 'common').length}
            </div>
            <div className="text-xs text-gray-600">Обычные</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {mockAchievements.filter(a => a.rarity === 'rare').length}
            </div>
            <div className="text-xs text-gray-600">Редкие</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {mockAchievements.filter(a => a.rarity === 'epic').length}
            </div>
            <div className="text-xs text-gray-600">Эпические</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {mockAchievements.filter(a => a.rarity === 'legendary').length}
            </div>
            <div className="text-xs text-gray-600">Легендарные</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'goals'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Цели
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'achievements'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Достижения
        </button>
      </div>

      {activeTab === 'goals' ? renderGoals() : renderAchievements()}
    </div>
  );
}; 