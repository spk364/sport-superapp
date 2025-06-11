import React from 'react';
import { 
  HeartIcon, 
  TrophyIcon, 
  ClockIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  onAction: (text: string) => void;
}

const quickActions = [
  {
    id: 'workout-plan',
    text: 'Составь план тренировок',
    icon: ClockIcon,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'nutrition',
    text: 'Помощь с питанием',
    icon: HeartIcon,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'goals',
    text: 'Постановка целей',
    icon: TrophyIcon,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 'motivation',
    text: 'Нужна мотивация',
    icon: UserIcon,
    color: 'bg-purple-100 text-purple-600',
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  return (
    <div className="px-4 py-3 bg-white border-t border-gray-200">
      <p className="text-sm text-gray-500 mb-3">Быстрые действия:</p>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.text)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${action.color} hover:opacity-80 transition-opacity`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-medium">{action.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}; 