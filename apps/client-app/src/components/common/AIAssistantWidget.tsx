import React from 'react';
import { 
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';

export const AIAssistantWidget: React.FC = () => {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const user = useAppStore((state) => state.user);

  const handleOpenChat = () => {
    setCurrentPage('chat');
  };

  return (
    <div 
      onClick={handleOpenChat}
      className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm p-4 text-white cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-3">
        <div className="bg-white/20 rounded-full p-3">
          <SparklesIcon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            AI Тренер
          </h3>
          <p className="text-blue-100 text-sm">
            {user?.firstName ? `Привет, ${user.firstName}!` : 'Привет!'} Готов помочь с тренировками, питанием и достижением целей.
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-blue-100 text-sm">
          Нажмите для начала чата
        </span>
        <div className="bg-white/20 rounded-full p-1">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}; 