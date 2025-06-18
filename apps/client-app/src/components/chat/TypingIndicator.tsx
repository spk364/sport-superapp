import React from 'react';

interface TypingIndicatorProps {
  withContext?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ withContext = false }) => {
  return (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white border border-gray-200">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-xs text-gray-500">
            {withContext ? 'Анализирует контекст...' : 'Тренер печатает...'}
          </span>
          {withContext && (
            <span className="text-xs">🧠</span>
          )}
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}; 