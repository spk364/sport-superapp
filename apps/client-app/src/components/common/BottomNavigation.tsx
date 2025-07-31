import React from 'react';
import {
  HomeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  QrCodeIcon,
  UserIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  QrCodeIcon as QrCodeIconSolid,
  UserIcon as UserIconSolid,
  CreditCardIcon as CreditCardIconSolid,
} from '@heroicons/react/24/solid';
import { useAppStore } from '../../store';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Главная',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    id: 'subscription',
    label: 'Абонемент',
    icon: CreditCardIcon,
    activeIcon: CreditCardIconSolid,
  },
  {
    id: 'progress',
    label: 'Прогресс',
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    id: 'calendar',
    label: 'Календарь',
    icon: CalendarDaysIcon,
    activeIcon: CalendarDaysIconSolid,
  },
  {
    id: 'chat',
    label: 'Чат',
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatBubbleLeftRightIconSolid,
  },
  {
    id: 'profile',
    label: 'Профиль',
    icon: UserIcon,
    activeIcon: UserIconSolid,
  },
];

export const BottomNavigation: React.FC = () => {
  const currentPage = useAppStore((state) => state.currentPage);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex justify-around items-center py-3 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center justify-center p-2 min-w-0 flex-1 transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title={item.label}
            >
              <Icon className="h-6 w-6" />
            </button>
          );
        })}
      </div>
    </div>
  );
}; 