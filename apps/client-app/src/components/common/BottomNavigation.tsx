import React from 'react';
import {
  HomeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CreditCardIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CreditCardIcon as CreditCardIconSolid,
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
    name: 'Календарь', 
    page: 'calendar', 
    icon: CalendarDaysIcon, 
    activeIcon: CalendarDaysIconSolid 
  },
  { 
    name: 'Прогресс', 
    page: 'progress', 
    icon: ChartBarIcon, 
    activeIcon: ChartBarIconSolid 
  },
  { 
    name: 'Оплата', 
    page: 'payments', 
    icon: CreditCardIcon, 
    activeIcon: CreditCardIconSolid 
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigation.map((item) => {
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