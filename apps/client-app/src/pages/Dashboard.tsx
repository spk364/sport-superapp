import React from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  TrophyIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Header } from '../components/common/Header';
import { useAppStore } from '../store';

export const Dashboard: React.FC = () => {
  const { user, subscription, homeTasks, workouts } = useAppStore();

  const upcomingWorkouts = workouts
    .filter(w => w.status === 'scheduled' && new Date(w.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  const pendingTasks = homeTasks.filter(task => !task.completed);
  const completedTasks = homeTasks.filter(task => task.completed);

  const isSubscriptionExpiringSoon = subscription && 
    new Date(subscription.endDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  const stats = [
    {
      title: 'Тренировки',
      value: workouts.filter(w => w.status === 'completed').length,
      subtitle: 'завершено',
      icon: TrophyIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Домашние задания',
      value: completedTasks.length,
      subtitle: 'выполнено',
      icon: CheckCircleIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Прогресс',
      value: '85%',
      subtitle: 'к цели',
      icon: ClockIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Главная" />
      
      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Subscription Alert */}
        {isSubscriptionExpiringSoon && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-orange-800">
                  Скоро истекает абонемент
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  Ваш абонемент истекает {new Date(subscription.endDate).toLocaleDateString('ru-RU')}
                </p>
                <button className="mt-2 text-sm font-medium text-orange-800 underline">
                  Продлить сейчас
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-4 text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${stat.bgColor} mb-2`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Workouts */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary-600" />
              Ближайшие тренировки
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {upcomingWorkouts.length > 0 ? (
              upcomingWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{workout.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(workout.date).toLocaleDateString('ru-RU', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })} в {new Date(workout.date).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">{workout.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {workout.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Нет запланированных тренировок</p>
              </div>
            )}
          </div>
        </div>

        {/* Home Tasks */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2 text-accent-600" />
              Домашние задания
              {pendingTasks.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {pendingTasks.length}
                </span>
              )}
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {pendingTasks.length > 0 ? (
              pendingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <p className="text-xs text-gray-500">
                      До {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <button className="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200">
                    Выполнить
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-500">Все задания выполнены! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-lg text-center">
            <div className="text-lg font-semibold">Записать заметку</div>
            <div className="text-sm opacity-90">О тренировке или самочувствии</div>
          </button>
          <button className="bg-gradient-to-r from-accent-500 to-accent-600 text-white p-4 rounded-lg text-center">
            <div className="text-lg font-semibold">Чат с AI</div>
            <div className="text-sm opacity-90">Задать вопрос помощнику</div>
          </button>
        </div>
      </div>
    </div>
  );
}; 