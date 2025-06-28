import { useState, useCallback, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { User } from '../types';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Chat history storage utilities
const CHAT_HISTORY_KEY = 'ai_trainer_chat_history';
const MAX_STORED_MESSAGES = 100; // Increased limit for better conversation context
const CHAT_SESSION_KEY = 'ai_trainer_chat_session';

interface ChatSession {
  sessionId: string;
  userId: string;
  startTime: string;
  lastActivity: string;
  messageCount: number;
}

const saveChatHistory = (userId: string, messages: Message[]) => {
  try {
    const chatData = {
      userId,
      messages: messages.slice(-MAX_STORED_MESSAGES), // Keep only recent messages
      lastUpdated: new Date().toISOString(),
      version: '1.0' // For future migration compatibility
    };
    localStorage.setItem(`${CHAT_HISTORY_KEY}_${userId}`, JSON.stringify(chatData));
  } catch (error) {
    console.warn('Failed to save chat history:', error);
  }
};

const loadChatHistory = (userId: string): Message[] => {
  try {
    const stored = localStorage.getItem(`${CHAT_HISTORY_KEY}_${userId}`);
    if (!stored) return [];
    
    const chatData = JSON.parse(stored);
    if (chatData.userId !== userId) return [];
    
    // Convert timestamp strings back to Date objects
    return chatData.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.warn('Failed to load chat history:', error);
    return [];
  }
};

const saveSession = (session: ChatSession) => {
  try {
    localStorage.setItem(`${CHAT_SESSION_KEY}_${session.userId}`, JSON.stringify(session));
  } catch (error) {
    console.warn('Failed to save session:', error);
  }
};

const loadSession = (userId: string): ChatSession | null => {
  try {
    const stored = localStorage.getItem(`${CHAT_SESSION_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load session:', error);
    return null;
  }
};

export const useChat = (userId: string, user?: User | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  // Load chat history and session on initialization
  useEffect(() => {
    if (userId && !isInitialized) {
      const history = loadChatHistory(userId);
      const session = loadSession(userId);
      
      if (history.length > 0) {
        console.log(`Loaded ${history.length} messages from chat history`);
        setMessages(history);
      }
      
      if (session) {
        setCurrentSession(session);
        console.log(`Resuming session: ${session.sessionId}`);
      } else {
        // Create new session
        const newSession: ChatSession = {
          sessionId,
          userId,
          startTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messageCount: history.length
        };
        setCurrentSession(newSession);
        saveSession(newSession);
      }
      
      setIsInitialized(true);
    }
  }, [userId, isInitialized, sessionId]);

  // Save chat history and update session whenever messages change
  useEffect(() => {
    if (userId && messages.length > 0 && isInitialized && currentSession) {
      saveChatHistory(userId, messages);
      
      // Update session activity
      const updatedSession: ChatSession = {
        ...currentSession,
        lastActivity: new Date().toISOString(),
        messageCount: messages.length
      };
      setCurrentSession(updatedSession);
      saveSession(updatedSession);
    }
  }, [userId, messages, isInitialized, currentSession]);

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
    // Only add welcome message if there's no chat history
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: welcomeText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  const clearChatHistory = useCallback(() => {
    if (userId) {
      try {
        // Clear chat history
        localStorage.removeItem(`${CHAT_HISTORY_KEY}_${userId}`);
        
        // Clear session
        localStorage.removeItem(`${CHAT_SESSION_KEY}_${userId}`);
        
        // Create new session
        const newSession: ChatSession = {
          sessionId: `session-${Date.now()}`,
          userId,
          startTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messageCount: 0
        };
        setCurrentSession(newSession);
        saveSession(newSession);
        
        // Clear messages
        setMessages([]);
        
        console.log('Chat history and session cleared, new session created');
      } catch (error) {
        console.warn('Failed to clear chat history:', error);
      }
    }
  }, [userId]);

  return {
    messages,
    isLoading,
    sendMessage,
    initializeChat,
    clearChatHistory,
    hasHistory: messages.length > 1, // More than just welcome message
    currentSession,
    sessionInfo: currentSession ? {
      duration: currentSession ? Math.round((new Date().getTime() - new Date(currentSession.startTime).getTime()) / 1000 / 60) : 0, // minutes
      messageCount: currentSession.messageCount,
      lastActivity: currentSession.lastActivity
    } : null
  };
}; 