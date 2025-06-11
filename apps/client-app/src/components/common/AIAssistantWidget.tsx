import React from 'react';
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';

export const AIAssistantWidget: React.FC = () => {
  const { setCurrentPage, user } = useAppStore();

  const suggestions = [
    'Составь план тренировок',
    'Помощь с питанием',
    'Мотивационные советы',
    'Анализ прогресса'
  ];

  const handleOpenChat = () => {
    setCurrentPage('chat');
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">ИИ Тренер</h3>
            <p className="text-blue-100 text-sm">Ваш персональный помощник</p>
          </div>
        </div>
        <button
          onClick={handleOpenChat}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-blue-100 text-sm mb-3">
          Привет{user?.firstName ? `, ${user.firstName}` : ''}! Я готов помочь вам с:
        </p>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-200 rounded-full"></div>
              <span className="text-blue-100">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleOpenChat}
        className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <span>Начать общение</span>
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}; 