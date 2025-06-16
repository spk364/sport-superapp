import React from 'react';
import {
  UserCircleIcon,
  Cog8ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useAppStore } from '../store';
import { Header } from '../components/common/Header';

export const Profile: React.FC = () => {
  const { user, subscription, workouts, setUser } = useAppStore();

  const handleLogout = () => {
    // In a real app, you'd also call an API to invalidate the session/token
    setUser(null);
  };

  const completedWorkouts = workouts.filter(w => w.status === 'completed').length;

  const menuItems = [
    { name: 'Уведомления', icon: BellIcon, page: 'notifications' },
    { name: 'Настройки', icon: Cog8ToothIcon, page: 'settings' },
    { name: 'Помощь и поддержка', icon: QuestionMarkCircleIcon, page: 'help' },
    { name: 'Политика конфиденциальности', icon: ShieldCheckIcon, page: 'privacy' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Профиль" />
      
      <div className="px-4 py-6 space-y-6">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
          {user?.avatar ? (
            <img src={user.avatar} alt="User Avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <UserCircleIcon className="w-16 h-16 text-gray-300" />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-500">Завершено тренировок</p>
            <p className="text-2xl font-bold text-gray-900">{completedWorkouts}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-500">Абонемент</p>
            <p className={`text-2xl font-bold ${subscription?.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
              {subscription?.status === 'active' ? 'Активен' : 'Неактивен'}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-lg shadow-sm">
          {menuItems.map((item, index) => (
            <button
              key={item.page}
              className={`w-full flex items-center justify-between p-4 text-left ${index < menuItems.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-6 w-6 text-gray-500" />
                <span className="text-gray-800">{item.name}</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="bg-white rounded-lg shadow-sm">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-4 text-red-600"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 