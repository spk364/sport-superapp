import React, { useEffect, useRef } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  TrophyIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Header } from '../components/common/Header';
import { AIAssistantWidget } from '../components/common/AIAssistantWidget';
import { MyCoachWidget } from '../components/common/MyCoachWidget';
import { DashboardCalendar } from '../components/dashboard/DashboardCalendar';
import { useAppStore } from '../store';

export const Dashboard: React.FC = () => {
  const user = useAppStore((state) => state.user);
  const subscription = useAppStore((state) => state.subscription);
  const homeTasks = useAppStore((state) => state.homeTasks);
  const workouts = useAppStore((state) => state.workouts);
  const startQuestionnaire = useAppStore((state) => state.startQuestionnaire);
  const loadMockWorkouts = useAppStore((state) => state.loadMockWorkouts);
  
  const hasInitialized = useRef(false);

  // Load mock workouts once on component mount
  useEffect(() => {
    if (!hasInitialized.current && workouts.length === 0) {
      console.log('Loading mock workouts for calendar display...');
      loadMockWorkouts();
      hasInitialized.current = true;
    }
  }, [workouts.length, loadMockWorkouts]);

  const upcomingWorkouts = workouts
    .filter(w => w.status === 'scheduled' && new Date(w.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  const pendingTasks = homeTasks.filter(task => !task.completed);
  const completedTasks = homeTasks.filter(task => task.completed);

  const isSubscriptionExpiringSoon = subscription && 
    new Date(subscription.endDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  const getProfileCompleteness = () => {
    if (!user) return 100; // If no user, don't show banner
    
    const fields = [
      user.preferences?.age,
      user.preferences?.gender,
      user.client_profile?.goals?.length,
      user.client_profile?.fitness_level,
      user.client_profile?.equipment_available?.length,
      user.client_profile?.body_metrics?.height,
      user.client_profile?.body_metrics?.weight,
    ];
    
    const completedFields = fields.filter(field => field !== undefined && field !== null && field !== 0).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const isProfileIncomplete = getProfileCompleteness() < 80;

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



  const todayWorkout = workouts.find(workout => {
    const today = new Date();
    const workoutDate = new Date(workout.date);
    return (
      workoutDate.getDate() === today.getDate() &&
      workoutDate.getMonth() === today.getMonth() &&
      workoutDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Главная" 
        showNotifications={true}
        showChat={true}
      />
      
      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Profile Completion Banner */}
        {isProfileIncomplete && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Заполните профиль для лучших результатов
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Ваш профиль заполнен на {getProfileCompleteness()}%. Заполните анкету для персонализированных тренировок.
                </p>
                <button
                  onClick={startQuestionnaire}
                  className="mt-2 text-sm font-medium text-blue-800 underline hover:text-blue-900"
                >
                  Заполнить анкету
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Today's Workout */}
        {todayWorkout && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary-600" />
                Сегодняшняя тренировка
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{todayWorkout.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(todayWorkout.date).toLocaleDateString('ru-RU', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })} в {new Date(todayWorkout.date).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-xs text-gray-500">{todayWorkout.location}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {todayWorkout.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Coach Widget */}
        <MyCoachWidget />

        {/* AI Assistant Widget */}
        <AIAssistantWidget />

        {/* Upcoming Workouts */}
        {upcomingWorkouts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-primary-600" />
                Ближайшие тренировки
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {upcomingWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{workout.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(workout.date).toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })} в {new Date(workout.date).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">{workout.location} • {workout.duration} мин</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {workout.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2 text-orange-600" />
                Домашние задания
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {pendingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <p className="text-xs text-orange-600">
                      Срок: {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {task.type}
                    </span>
                  </div>
                </div>
              ))}
              {pendingTasks.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  Еще {pendingTasks.length - 3} заданий...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Calendar */}
        <DashboardCalendar />

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
      </div>
    </div>
  );
};