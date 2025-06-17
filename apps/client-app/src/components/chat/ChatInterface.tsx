import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { QuickActions } from './QuickActions';
import { Questionnaire } from '../questionnaire';

export const ChatInterface: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Store state and actions
  const user = useAppStore((state) => state.user);
  const chatMessages = useAppStore((state) => state.chatMessages);
  const chatLoading = useAppStore((state) => state.chatLoading);
  const chatSession = useAppStore((state) => state.chatSession);
  const chatInitialized = useAppStore((state) => state.chatInitialized);
  const isQuestionnaireActive = useAppStore((state) => state.isQuestionnaireActive);
  const setQuestionnaireActive = useAppStore((state) => state.setQuestionnaireActive);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const initializeChat = useAppStore((state) => state.initializeChat);
  const sendChatMessage = useAppStore((state) => state.sendChatMessage);
  const clearChatHistory = useAppStore((state) => state.clearChatHistory);

  // Initialize chat when component mounts
  useEffect(() => {
    if (user?.id && !chatInitialized) {
      console.log('Initializing chat for user:', user.id);
      initializeChat(user.id);
    }
  }, [user?.id, chatInitialized, initializeChat]);

  // Create user profile context
  const createUserProfileContext = () => {
    if (!user) return undefined;

    return {
      age: user.preferences?.age,
      gender: user.preferences?.gender,
      height: user.client_profile?.body_metrics?.height,
      weight: user.client_profile?.body_metrics?.weight,
      goals: user.client_profile?.goals,
      fitness_level: user.client_profile?.fitness_level,
      equipment: user.client_profile?.equipment_available,
      limitations: user.client_profile?.limitations,
      nutrition_goal: user.preferences?.nutrition_goal,
      food_preferences: user.preferences?.food_preferences,
      allergies: user.preferences?.allergies,
    };
  };

  const hasHistory = chatMessages.length > 1;
  const sessionInfo = chatSession ? {
    duration: Math.round((new Date().getTime() - new Date(chatSession.startTime).getTime()) / 1000 / 60), // minutes
    messageCount: chatSession.messageCount,
    lastActivity: chatSession.lastActivity
  } : null;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Handle questionnaire activation
  useEffect(() => {
    if (isQuestionnaireActive && chatMessages.length > 0) {
      // Show questionnaire instead of sending a message
      setShowQuestionnaire(true);
      setQuestionnaireActive(false);
    }
  }, [isQuestionnaireActive, chatMessages.length, setQuestionnaireActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && user?.id) {
      // Check if user is asking for questionnaire
      const message = inputValue.toLowerCase().trim();
      if (message.includes('анкет') || message.includes('заполнить') || message.includes('профиль') || 
          message.includes('questionnaire') || message.includes('вопрос')) {
        setShowQuestionnaire(true);
        setInputValue('');
        return;
      }
      
      const userProfile = createUserProfileContext();
      sendChatMessage(user.id, inputValue, userProfile);
      setInputValue('');
    }
  };

  const handleQuickAction = (text: string) => {
    // Check if quick action should trigger questionnaire
    if (text.includes('анкет') || text.includes('профиль')) {
      setShowQuestionnaire(true);
      return;
    }
    if (user?.id) {
      const userProfile = createUserProfileContext();
      sendChatMessage(user.id, text, userProfile);
    }
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
      if (user?.id) {
        const confirmationMessage = "Отлично! Анкета заполнена. Теперь я могу предоставить вам персонализированные рекомендации по тренировкам и питанию.";
        const userProfile = createUserProfileContext();
        sendChatMessage(user.id, confirmationMessage, userProfile);
      }
    } catch (error) {
      console.error('Failed to update user profile:', error);
      
      // Show error message to user
      if (user?.id) {
        const errorMessage = "Произошла ошибка при сохранении анкеты. Пожалуйста, попробуйте еще раз.";
        const userProfile = createUserProfileContext();
        sendChatMessage(user.id, errorMessage, userProfile);
      }
    }
  };

  const handleQuestionnaireClose = () => {
    setShowQuestionnaire(false);
  };

  const handleClearHistory = () => {
    if (user?.id) {
      clearChatHistory(user.id);
    }
    setShowClearDialog(false);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Виртуальный тренер</h1>
              <p className="text-sm text-gray-500">
                {hasHistory ? 'Продолжаем разговор' : 'Всегда готов помочь'}
              </p>
            </div>
          </div>
          
          {/* Clear History Button */}
          {hasHistory && (
            <button
              onClick={() => setShowClearDialog(true)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              title="Очистить историю чата"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* History Continuation Indicator */}
        {hasHistory && sessionInfo && (
          <div className="mt-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              📚 История чата загружена • {sessionInfo.messageCount} сообщений 
              {sessionInfo.duration > 0 && ` • Сессия: ${sessionInfo.duration} мин`}
            </p>
          </div>
        )}
      </div>

      {/* Clear History Confirmation Dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Очистить историю чата?
            </h3>
            <p className="text-gray-600 mb-4">
              Вся история разговора будет удалена. Это действие нельзя отменить.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearDialog(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatMessages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {chatLoading && <TypingIndicator />}
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
              disabled={chatLoading}
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
            disabled={!inputValue.trim() || chatLoading}
            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}; 