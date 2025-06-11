import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const useChat = (userId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);

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
      const response = await aiService.sendChatMessage({
        user_id: userId,
        session_id: sessionId,
        message: text.trim(),
        attachments: []
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
  }, [userId, sessionId, isLoading]);

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