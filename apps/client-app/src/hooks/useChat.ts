import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { User } from '../types';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const useChat = (userId: string, user?: User | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);

  const createUserProfileContext = useCallback(() => {
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
  }, [user]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const userProfile = createUserProfileContext();
      
      console.log('Sending chat with profile context:', userProfile);

      const response = await aiService.sendChatMessage({
        user_id: userId,
        session_id: sessionId,
        message: text.trim(),
        attachments: [],
        user_profile: userProfile
      });

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: response.response_text,
        sender: 'ai',
        timestamp: new Date(response.timestamp),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Извините, произошла ошибка. Попробуйте ещё раз.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, sessionId, isLoading, createUserProfileContext]);

  const initializeChat = useCallback((welcomeText: string) => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: welcomeText,
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    initializeChat,
  };
}; 