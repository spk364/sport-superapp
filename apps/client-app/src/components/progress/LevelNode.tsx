import React from 'react';
import { CheckIcon, StarIcon, LockClosedIcon } from '@heroicons/react/24/solid';

interface LevelNodeProps {
  status: 'completed' | 'current' | 'locked';
  level: number;
  name: string;
}

export const LevelNode: React.FC<LevelNodeProps> = ({ status, level, name }) => {
  const statusConfig = {
    completed: {
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: <CheckIcon className="w-8 h-8" />,
      ringColor: 'ring-green-300',
    },
    current: {
      bgColor: 'bg-blue-500 animate-pulse',
      textColor: 'text-white',
      icon: <StarIcon className="w-8 h-8" />,
      ringColor: 'ring-blue-300',
    },
    locked: {
      bgColor: 'bg-gray-300',
      textColor: 'text-gray-500',
      icon: <LockClosedIcon className="w-8 h-8" />,
      ringColor: 'ring-gray-200',
    },
  };

  const { bgColor, textColor, icon, ringColor } = statusConfig[status];

  return (
    <div className="relative z-10 flex flex-col items-center group">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center ${bgColor} ${textColor} ring-4 ${ringColor} transition-all duration-300 group-hover:ring-8`}
      >
        {icon}
      </div>
      <div className="mt-3 text-center">
        <h4
          className={`font-bold text-lg ${
            status === 'locked' ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          {name}
        </h4>
        <p
          className={`text-sm ${
            status === 'locked' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Уровень {level}
        </p>
      </div>
    </div>
  );
}; 