import React from 'react';
import {
  HomeIcon,
  QrCodeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  QrCodeIcon as QrCodeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';
import { useAppStore } from '../../store';

const navigation = [
  { 
    name: 'Главная', 
    page: 'dashboard', 
    icon: HomeIcon, 
    activeIcon: HomeIconSolid 
  },
  { 
    name: 'Прогресс', 
    page: 'progress', 
    icon: ChartBarIcon, 
    activeIcon: ChartBarIconSolid 
  },
  { 
    name: 'ИИ Тренер', 
    page: 'chat', 
    icon: ChatBubbleLeftRightIcon, 
    activeIcon: ChatBubbleLeftRightIconSolid 
  },
  { 
    name: 'Профиль', 
    page: 'profile', 
    icon: UserIcon, 
    activeIcon: UserIconSolid 
  },
];

export const BottomNavigation: React.FC = () => {
  const { currentPage, setCurrentPage } = useAppStore();

  const handleScanClick = () => {
    setCurrentPage('qr-scanner');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigation.slice(0, 2).map((item) => {
          const isActive = currentPage === item.page;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}

        <button
          onClick={handleScanClick}
          className="relative -top-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
        >
          <QrCodeIcon className="h-8 w-8" />
        </button>

        {navigation.slice(2).map((item) => {
          const isActive = currentPage === item.page;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}; 