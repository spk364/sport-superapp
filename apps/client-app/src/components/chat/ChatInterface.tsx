import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { QuickActions } from './QuickActions';
import { Questionnaire } from '../questionnaire';
import { useChat } from '../../hooks/useChat';

export const ChatInterface: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAppStore((state) => state.user);
  const isQuestionnaireActive = useAppStore((state) => state.isQuestionnaireActive);
  const setQuestionnaireActive = useAppStore((state) => state.setQuestionnaireActive);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  
  const { messages, isLoading, sendMessage, initializeChat } = useChat(user?.id || '', user);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeText = `Привет${user?.firstName ? `, ${user.firstName}` : ''}! 👋 Я ваш виртуальный тренер. Готов помочь с тренировками, питанием и достижением ваших фитнес-целей. О чём хотите поговорить?`;
    initializeChat(welcomeText);
  }, [user?.firstName, initializeChat]);

  // Handle questionnaire activation
  useEffect(() => {
    if (isQuestionnaireActive && messages.length > 0) {
      // Show questionnaire instead of sending a message
      setShowQuestionnaire(true);
      setQuestionnaireActive(false);
    }
  }, [isQuestionnaireActive, messages.length, setQuestionnaireActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Check if user is asking for questionnaire
      const message = inputValue.toLowerCase().trim();
      if (message.includes('анкет') || message.includes('заполнить') || message.includes('профиль') || 
          message.includes('questionnaire') || message.includes('вопрос')) {
        setShowQuestionnaire(true);
        setInputValue('');
        return;
      }
      
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleQuickAction = (text: string) => {
    // Check if quick action should trigger questionnaire
    if (text.includes('анкет') || text.includes('профиль')) {
      setShowQuestionnaire(true);
      return;
    }
    sendMessage(text);
  };

  const handleQuestionnaireComplete = async (answers: Record<string, any>) => {
    console.log('Questionnaire completed with answers:', answers);
    setShowQuestionnaire(false);
    
    try {
      // Update user profile with answers
      console.log('Updating user profile...');
      await updateUserProfile(answers);
      console.log('User profile updated successfully');
      
      // Send a confirmation message
      const confirmationMessage = "Отлично! Анкета заполнена. Теперь я могу предоставить вам персонализированные рекомендации по тренировкам и питанию.";
      sendMessage(confirmationMessage);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      
      // Show error message to user
      const errorMessage = "Произошла ошибка при сохранении анкеты. Пожалуйста, попробуйте еще раз.";
      sendMessage(errorMessage);
    }
  };

  const handleQuestionnaireClose = () => {
    setShowQuestionnaire(false);
  };

  // Show questionnaire overlay if active
  if (showQuestionnaire) {
    return (
      <Questionnaire 
        onComplete={handleQuestionnaireComplete}
        onClose={handleQuestionnaireClose}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Виртуальный тренер</h1>
            <p className="text-sm text-gray-500">Всегда готов помочь</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <QuickActions onAction={handleQuickAction} />

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Напишите сообщение..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}; 