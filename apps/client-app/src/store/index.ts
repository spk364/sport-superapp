import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Workout, Progress, Subscription, SubscriptionHistory, HomeTask, Note, Goal, Notification } from '../types';
import { aiService, ConversationMessage } from '../services/aiService';
import { subscriptionService, SubscriptionPlan } from '../services/subscriptionService';

// Date serialization helpers for localStorage
const dateReviver = (key: string, value: any) => {
  // Convert string dates back to Date objects
  if (typeof value === 'string') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (dateRegex.test(value)) {
      return new Date(value);
    }
  }
  // Handle dismissedAlerts Set
  if (key === 'dismissedAlerts' && Array.isArray(value)) {
    return new Set(value);
  }
  return value;
};

const dateReplacer = (key: string, value: any) => {
  // Convert Date objects to ISO strings for storage
  if (value instanceof Date) {
    return value.toISOString();
  }
  // Handle dismissedAlerts Set
  if (key === 'dismissedAlerts' && value instanceof Set) {
    return Array.from(value);
  }
  return value;
};

// Persistence configuration
const persistConfig = {
  name: 'app-store',
  storage: createJSONStorage(() => localStorage, {
    reviver: dateReviver,
    replacer: dateReplacer,
  }),
  // Only persist important user data
  partialize: (state: AppState) => ({
    user: state.user,
    subscription: state.subscription,
    subscriptionHistory: state.subscriptionHistory,
    isAuthenticated: state.isAuthenticated,
    notifications: state.notifications,
    dismissedAlerts: state.dismissedAlerts,
    homeTasks: state.homeTasks,
    notes: state.notes,
    goals: state.goals,
    unreadCount: state.unreadCount,
  }),
};

// Mock workout data for calendar display
const createMockWorkouts = (): Workout[] => {
  const today = new Date();
  const workouts: Workout[] = [];
  
  // Simple, safe workout generation
  const workoutTemplates = [
    { name: 'Силовая тренировка', type: 'strength' as const },
    { name: 'Кардио тренировка', type: 'cardio' as const },
    { name: 'Растяжка', type: 'flexibility' as const },
    { name: 'Тренировка верха тела', type: 'strength' as const },
    { name: 'HIIT тренировка', type: 'cardio' as const },
    { name: 'Йога', type: 'flexibility' as const },
  ];
  
  const locations = ['Спортзал', 'Домашняя тренировка', 'Парк', 'Фитнес-центр'];
  const trainer = { id: '1', name: 'AI Тренер', avatar: '/avatars/ai-trainer.jpg' };
  
  // Create workouts for the past and future weeks
  for (let i = -7; i <= 14; i++) {
    // Skip some days
    if (i % 3 === 1) continue;
    
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Add 1 workout per day
    const templateIndex = Math.abs(i) % workoutTemplates.length;
    const template = workoutTemplates[templateIndex];
    const locationIndex = Math.abs(i) % locations.length;
    const location = locations[locationIndex];
    
    // Set workout time
    const workoutDate = new Date(date);
    workoutDate.setHours(10 + (Math.abs(i) % 3), 0, 0, 0);
    
    // Determine status based on date
    let status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
    if (workoutDate < today) {
      const statusPattern = Math.abs(i) % 10;
      if (statusPattern < 8) status = 'completed';
      else if (statusPattern < 9) status = 'missed';
      else status = 'cancelled';
    } else {
      status = 'scheduled';
    }
    
    const workout: Workout = {
      id: `workout-${i}`,
      name: template.name,
      type: template.type,
      date: workoutDate,
      duration: 45 + (Math.abs(i) % 6) * 5,
      location,
      trainer,
      description: `${template.name} с фокусом на развитие`,
      status,
      exercises: [
        {
          id: `ex-${i}-1`,
          name: template.type === 'strength' ? 'Приседания' : template.type === 'cardio' ? 'Бег на месте' : 'Растяжка ног',
          sets: template.type === 'flexibility' ? 1 : 3,
          reps: template.type === 'flexibility' ? '30 сек' : '12-15',
          weight: template.type === 'strength' ? 20 : undefined,
          restTime: template.type === 'flexibility' ? 0 : 60,
        }
      ]
    };
    
    workouts.push(workout);
  }
  
  return workouts;
};

// Chat message interface
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Chat session interface  
export interface ChatSession {
  sessionId: string;
  userId: string;
  startTime: string;
  lastActivity: string;
  messageCount: number;
}

// Chat history storage utilities
const CHAT_HISTORY_KEY = 'ai_trainer_chat_history';
const MAX_STORED_MESSAGES = 100;
const CHAT_SESSION_KEY = 'ai_trainer_chat_session';
const SESSION_INACTIVITY_TIMEOUT_HOURS = 4; // Reset session after 4 hours of inactivity

// Helper function to build conversation context
const buildConversationContext = (
  messages: ChatMessage[], 
  currentMessage: string,
  userProfile?: any,
  sessionInfo?: ChatSession
): ConversationMessage[] => {
  const context: ConversationMessage[] = [];
  
  // Add system message with user profile and session context
  if (userProfile || sessionInfo) {
    let systemPrompt = "Ты виртуальный фитнес-тренер и нутрициолог. ";
    
    if (userProfile) {
      systemPrompt += `Профиль пользователя: `;
      if (userProfile.age) systemPrompt += `возраст ${userProfile.age} лет, `;
      if (userProfile.gender) systemPrompt += `пол ${userProfile.gender}, `;
      if (userProfile.height && userProfile.weight) {
        systemPrompt += `рост ${userProfile.height}см, вес ${userProfile.weight}кг, `;
      }
      if (userProfile.goals?.length) {
        systemPrompt += `цели: ${userProfile.goals.join(', ')}, `;
      }
      if (userProfile.fitness_level) {
        systemPrompt += `уровень подготовки: ${userProfile.fitness_level}, `;
      }
      if (userProfile.equipment?.length) {
        systemPrompt += `доступное оборудование: ${userProfile.equipment.join(', ')}, `;
      }
      if (userProfile.limitations?.length) {
        systemPrompt += `ограничения: ${userProfile.limitations.join(', ')}, `;
      }
      if (userProfile.nutrition_goal) {
        systemPrompt += `цель по питанию: ${userProfile.nutrition_goal}, `;
      }
    }
    
    if (sessionInfo) {
      const sessionDuration = Math.round((new Date().getTime() - new Date(sessionInfo.startTime).getTime()) / (1000 * 60));
      systemPrompt += `Текущая сессия: ${sessionDuration} минут, ${sessionInfo.messageCount} сообщений. `;
    }
    
    systemPrompt += "Отвечай персонализированно, учитывая контекст всего разговора и профиль пользователя. Будь дружелюбным, мотивирующим и профессиональным.";
    
    context.push({
      role: 'system',
      content: systemPrompt.trim()
    });
  }
  
  // Add recent conversation history (last 8 messages to keep context manageable)
  const recentMessages = messages
    .slice(-8)
    .filter(msg => msg.id !== 'welcome' && msg.text.trim()) // Filter out welcome and empty messages
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.text,
      timestamp: msg.timestamp.toISOString()
    }));
  
  context.push(...recentMessages);
  
  // Add current message
  context.push({
    role: 'user' as const,
    content: currentMessage,
    timestamp: new Date().toISOString()
  });
  
  return context;
};

const saveChatHistory = (userId: string, messages: ChatMessage[]) => {
  try {
    const chatData = {
      userId,
      messages: messages.slice(-MAX_STORED_MESSAGES),
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(`${CHAT_HISTORY_KEY}_${userId}`, JSON.stringify(chatData));
  } catch (error) {
    console.warn('Failed to save chat history:', error);
  }
};

const loadChatHistory = (userId: string): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(`${CHAT_HISTORY_KEY}_${userId}`);
    if (!stored) return [];
    
    const chatData = JSON.parse(stored);
    if (chatData.userId !== userId) return [];
    
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

interface AppState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  
  // Navigation
  currentPage: string;
  
  // Workouts
  workouts: Workout[];
  selectedWorkout: Workout | null;
  
  // Progress
  progressData: Progress[];
  
  // Subscription & Payments
  subscription: Subscription | null;
  subscriptionPlans: SubscriptionPlan[];
  subscriptionHistory: SubscriptionHistory[];
  dismissedAlerts: Set<string>;
  
  // Tasks & Notes
  homeTasks: HomeTask[];
  notes: Note[];
  
  // Goals
  goals: Goal[];
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Chat
  chatMessages: ChatMessage[];
  chatSession: ChatSession | null;
  chatLoading: boolean;
  chatInitialized: boolean;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  isQuestionnaireActive: boolean;
  
  // Actions
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setCurrentPage: (page: string) => void;
  setWorkouts: (workouts: Workout[]) => void;
  setSelectedWorkout: (workout: Workout | null) => void;
  loadMockWorkouts: () => void;
  fetchWorkouts: (userId?: string) => Promise<void>;
  addProgressEntry: (progress: Progress) => void;
  setSubscription: (subscription: Subscription | null) => void;
  fetchSubscription: (userId: string) => Promise<void>;
  fetchSubscriptionPlans: () => Promise<void>;
  renewSubscription: (subscriptionId: string, planId?: string) => Promise<void>;
  updateSubscription: (subscription: Subscription) => void;
  addSubscriptionHistory: (historyItem: Omit<SubscriptionHistory, 'id'>) => void;
  updateSubscriptionSettings: (subscriptionId: string, updates: { autoRenewal?: boolean; paymentMethod?: string }) => Promise<void>;
  cancelSubscription: (subscriptionId: string, reason?: string) => Promise<void>;
  dismissAlert: (alertType: string) => void;
  clearDismissedAlerts: () => void;
  showSuccessNotification: (message: string, type?: 'purchase' | 'renewal' | 'general') => void;
  addHomeTask: (task: HomeTask) => void;
  completeHomeTask: (taskId: string) => void;
  addNote: (note: Note) => void;
  addGoal: (goal: Goal) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  addTestNotifications: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  startQuestionnaire: () => void;
  setQuestionnaireActive: (isActive: boolean) => void;
  updateUserProfile: (answers: Record<string, any>) => Promise<void>;
  
  // Chat actions
  initializeChat: (userId: string) => void;
  sendChatMessage: (userId: string, message: string, userProfile?: any) => Promise<void>;
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: (userId: string) => void;
  setChatLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  currentPage: 'dashboard',
  workouts: [],
  selectedWorkout: null,
  progressData: [],
      subscription: null,
    subscriptionPlans: [],
    subscriptionHistory: [],
    dismissedAlerts: new Set(),
  homeTasks: [
    {
      id: 'task-1',
      title: 'Выполнить кардио тренировку',
      description: 'Пробежка или быстрая ходьба 30 минут',
      type: 'exercise',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // В течение 2 дней
      completed: false,
    },
    {
      id: 'task-2', 
      title: 'Прочитать статью о питании',
      description: 'Изучить основы здорового питания для набора массы',
      type: 'reading',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // В течение 3 дней
      completed: false,
    },
    {
      id: 'task-3',
      title: 'Растяжка после тренировки',
      description: 'Выполнить комплекс упражнений на растяжку',
      type: 'recovery',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Завтра
      completed: false,
    },
    {
      id: 'task-4',
      title: 'Планирование питания',
      description: 'Составить план питания на неделю',
      type: 'nutrition',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // В течение 5 дней
      completed: false,
    }
  ],
  notes: [],
  goals: [],
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isQuestionnaireActive: false,
  chatMessages: [],
  chatSession: null,
  chatLoading: false,
  chatInitialized: false,

  // Actions
  fetchUser: async () => {
    const state = get();
    // Prevent multiple simultaneous calls
    if (state.isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      const user = await aiService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch user, using mock user:', error);
      
      // Create a mock user for demo purposes when API is not available
      const mockUser: User = {
        id: '9ff91fd7-1da3-4a37-8550-38902251e578',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'client',
        is_active: true,
        phone: '+7 (900) 123-45-67',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar: '',
        preferences: {
          age: 30,
          gender: 'Мужской',
          nutrition_goal: 'Набор мышечной массы',
          food_preferences: ['Мясо', 'Молочные продукты'],
          allergies: []
        },
        client_profile: {
          id: 'demo-profile-001',
          goals: ['Набор мышечной массы'],
          fitness_level: 'Продвинутый (тренируюсь более года)',
          equipment_available: ['Собственный вес', 'Штанга', 'Тренажерный зал'],
          limitations: [],
          body_metrics: {
            height: 191,
            weight: 97
          }
        }
      };
      
      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setWorkouts: (workouts) => set({ workouts }),
  
  setSelectedWorkout: (workout) => set({ selectedWorkout: workout }),
  
  loadMockWorkouts: () => {
    const mockWorkouts = createMockWorkouts();
    set({ workouts: mockWorkouts });
  },

  fetchWorkouts: async (userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const today = new Date();
      const dateFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const dateTo = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days ahead
      
      const workoutsData = await aiService.getWorkouts({
        client_id: userId,
        date_from: dateFrom.toISOString(),
        date_to: dateTo.toISOString()
      });
      
      // Convert API response to frontend Workout format
      const workouts: Workout[] = workoutsData.map((w: any) => ({
        id: w.id,
        name: w.name,
        type: w.type,
        date: new Date(w.date),
        duration: w.duration,
        location: w.location,
        description: w.description,
        status: w.status,
        trainer: w.trainer,
        exercises: w.exercises || []
      }));
      
      set({ workouts, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch workouts, falling back to mock data:', error);
      // Fallback to mock data if API fails
      const mockWorkouts = createMockWorkouts();
      set({ workouts: mockWorkouts, isLoading: false });
    }
  },
  
  addProgressEntry: (progress) => set((state) => ({
    progressData: [...state.progressData, progress]
  })),
  
  setSubscription: (subscription) => set({ subscription }),

  fetchSubscription: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const subscription = await subscriptionService.getCurrentSubscription(userId);
      set({ subscription, isLoading: false });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch subscription',
        isLoading: false 
      });
    }
  },

  fetchSubscriptionPlans: async () => {
    try {
      const plans = await subscriptionService.getSubscriptionPlans();
      set({ subscriptionPlans: plans });
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch subscription plans' });
    }
  },

  renewSubscription: async (subscriptionId, planId) => {
    try {
      set({ isLoading: true, error: null });
      const { subscription } = await subscriptionService.renewSubscription(subscriptionId, planId);
      set({ subscription, isLoading: false });
      
      // Add success notification
      const { addNotification } = get();
      addNotification({
        id: `renewal_${Date.now()}`,
        title: 'Абонемент продлён',
        message: `Ваш абонемент успешно продлён до ${new Date(subscription.endDate).toLocaleDateString('ru-RU')}`,
        type: 'general',
        read: false,
        date: new Date(),
      });
    } catch (error) {
      console.error('Error renewing subscription:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to renew subscription',
        isLoading: false 
      });
    }
  },

  updateSubscriptionSettings: async (subscriptionId, updates) => {
    try {
      set({ isLoading: true, error: null });
      const subscription = await subscriptionService.updateSubscription(subscriptionId, updates);
      set({ subscription, isLoading: false });
      
      // Add success notification
      const { addNotification } = get();
      addNotification({
        id: `settings_${Date.now()}`,
        title: 'Настройки обновлены',
        message: 'Настройки абонемента успешно обновлены',
        type: 'general',
        read: false,
        date: new Date(),
      });
    } catch (error) {
      console.error('Error updating subscription settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update subscription settings',
        isLoading: false 
      });
    }
  },

  cancelSubscription: async (subscriptionId, reason) => {
    console.log('🚫 Starting subscription cancellation:', { subscriptionId, reason });
    try {
      set({ isLoading: true, error: null });
      console.log('⏳ Calling subscription service...');
      const result = await subscriptionService.cancelSubscription(subscriptionId, reason);
      console.log('✅ Subscription service response:', result);
      
      // Update subscription status to cancelled
      const { subscription } = get();
      if (subscription && subscription.id === subscriptionId) {
        console.log('📝 Updating subscription status to cancelled');
        set({ 
          subscription: { ...subscription, status: 'cancelled' as const },
          isLoading: false 
        });
      } else {
        console.log('⚠️ No subscription found to update');
        set({ isLoading: false });
      }
      
      // Add notification
      const { addNotification } = get();
      console.log('🔔 Adding cancellation notification');
      addNotification({
        id: `cancellation_${Date.now()}`,
        title: 'Абонемент отменён',
        message: 'Ваш абонемент был успешно отменён',
        type: 'general',
        read: false,
        date: new Date(),
      });
      
      console.log('🎉 Subscription cancellation completed successfully');
    } catch (error) {
      console.error('❌ Error canceling subscription:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
        isLoading: false 
      });
    }
  },

  dismissAlert: (alertType) => {
    console.log('🏪 Store: Dismissing alert:', alertType);
    set((state) => {
      const newDismissedAlerts = new Set(Array.from(state.dismissedAlerts).concat([alertType]));
      console.log('🏪 Store: New dismissedAlerts:', Array.from(newDismissedAlerts));
      return {
        dismissedAlerts: newDismissedAlerts
      };
    });
  },

  clearDismissedAlerts: () => set({ dismissedAlerts: new Set() }),

  // Update subscription directly
  updateSubscription: (subscription: Subscription) => {
    set({ subscription });
  },

  // Add subscription history entry
  addSubscriptionHistory: (historyItem: Omit<SubscriptionHistory, 'id'>) => {
    const newHistoryItem: SubscriptionHistory = {
      ...historyItem,
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    set((state) => ({
      subscriptionHistory: [newHistoryItem, ...state.subscriptionHistory],
    }));
  },

  // Show success notification and navigate to home
  showSuccessNotification: (message: string, type: 'purchase' | 'renewal' | 'general' = 'general') => {
    const notificationTypes = {
      purchase: 'achievement' as const,
      renewal: 'achievement' as const, 
      general: 'general' as const,
    };

    // Add notification
    get().addNotification({
      id: `notif_${Date.now()}`,
      title: type === 'purchase' ? '🎉 Покупка успешна!' : type === 'renewal' ? '🔄 Подписка обновлена!' : 'Успех!',
      message,
      type: notificationTypes[type],
      read: false,
      date: new Date(),
    });

    // Navigate to home
    get().setCurrentPage('dashboard');
  },
  
  addHomeTask: (task) => set((state) => ({
    homeTasks: [...state.homeTasks, task]
  })),
  
  completeHomeTask: (taskId) => set((state) => ({
    homeTasks: state.homeTasks.map(task =>
      task.id === taskId
        ? { ...task, completed: true, completedAt: new Date() }
        : task
    )
  })),
  
  addNote: (note) => set((state) => ({
    notes: [...state.notes, note]
  })),
  
  addGoal: (goal) => set((state) => ({
    goals: [...state.goals, goal]
  })),
  
  updateGoalProgress: (goalId, progress) => set((state) => ({
    goals: state.goals.map(goal =>
      goal.id === goalId ? { ...goal, progress } : goal
    )
  })),
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification],
    unreadCount: state.unreadCount + 1
  })),
  
  markNotificationAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  
  clearNotifications: () => set({
    notifications: [],
    unreadCount: 0
  }),
  
  // Add some test notifications for demo
  addTestNotifications: () => {
    const testNotifications: Notification[] = [
      {
        id: 'test-1',
        type: 'workout_reminder',
        title: 'Время тренировки!',
        message: 'Ваша тренировка "Силовая тренировка" начинается через 15 минут',
        date: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false
      },
      {
        id: 'test-2',
        type: 'achievement',
        title: 'Новое достижение!',
        message: 'Поздравляем! Вы выполнили 10 тренировок подряд',
        date: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false
      },
      {
        id: 'test-3',
        type: 'program_update',
        title: 'Обновление программы',
        message: 'Ваша программа тренировок была обновлена тренером',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true
      },
      {
        id: 'test-4',
        type: 'payment_due',
        title: 'Напоминание об оплате',
        message: 'Ваша подписка истекает через 3 дня. Продлите её сейчас',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: false
      },
      {
        id: 'test-5',
        type: 'general',
        title: 'Новые функции!',
        message: 'Теперь вы можете отслеживать прогресс в новом разделе аналитики',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true
      }
    ];
    
    set((state) => ({
      notifications: [...testNotifications, ...state.notifications],
      unreadCount: state.unreadCount + testNotifications.filter(n => !n.read).length
    }));
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  startQuestionnaire: () => set({ 
    isQuestionnaireActive: true, 
    currentPage: 'chat' 
  }),
  
  setQuestionnaireActive: (isActive) => set({ isQuestionnaireActive: isActive }),
  
  updateUserProfile: async (answers) => {
    set({ isLoading: true, error: null });
    try {
      // Update user profile with questionnaire answers
      const updatedUser = await aiService.updateUserProfile(answers);
      set({ 
        user: updatedUser, 
        isQuestionnaireActive: false,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Failed to update user profile:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Chat actions
  initializeChat: (userId) => {
    const state = get();
    if (state.chatInitialized) return; // Already initialized
    
    // Load chat history
    const history = loadChatHistory(userId);
    
    // Load or create session
    let session = loadSession(userId);
    const now = new Date();
    
    // Check if we need to reset the session due to inactivity
    if (session) {
      const lastActivity = new Date(session.lastActivity);
      const hoursInactive = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
      
      // Reset session if inactive for more than the timeout period
      if (hoursInactive > SESSION_INACTIVITY_TIMEOUT_HOURS) {
        console.log(`Resetting chat session due to ${Math.round(hoursInactive * 10) / 10} hours of inactivity (timeout: ${SESSION_INACTIVITY_TIMEOUT_HOURS}h)`);
        session = {
          sessionId: `session-${Date.now()}`,
          userId: userId,
          startTime: now.toISOString(),
          lastActivity: now.toISOString(),
          messageCount: history.length
        };
        saveSession(session);
      } else {
        // Update last activity to current time
        session = {
          ...session,
          lastActivity: now.toISOString()
        };
        saveSession(session);
      }
    }
    
    // Create new session if none exists
    if (!session) {
      session = {
        sessionId: `session-${Date.now()}`,
        userId: userId,
        startTime: now.toISOString(),
        lastActivity: now.toISOString(),
        messageCount: history.length
      };
      saveSession(session);
    }
    
    console.log(`Chat initialized: ${history.length} messages loaded, session: ${session.sessionId}`);
    
    set({ 
      chatMessages: history,
      chatSession: session,
      chatInitialized: true 
    });
    
    // Add welcome message if no history
    if (history.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: 'Привет! 👋 Я ваш виртуальный тренер. Готов помочь с тренировками, питанием и достижением ваших фитнес-целей. О чём хотите поговорить?',
        sender: 'ai',
        timestamp: new Date()
      };
      
      set((state) => ({
        chatMessages: [welcomeMessage]
      }));
    }
  },
  
  sendChatMessage: async (userId, message, userProfile) => {
    set({ chatLoading: true });
    try {
      const state = get();
      const chatSession = state.chatSession;
      if (!chatSession) throw new Error('Chat session not initialized');
      
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: message,
        sender: 'user',
        timestamp: new Date()
      };
      
      // Add user message
      set((state) => ({
        chatMessages: [...state.chatMessages, userMessage]
      }));
      
      // Build comprehensive conversation context
      const conversationHistory = buildConversationContext(
        state.chatMessages,
        message,
        userProfile,
        chatSession
      );
      
      console.log(`Sending message with context: ${conversationHistory.length} messages (system + history + current)`);
      console.log('Context preview:', {
        systemPrompt: conversationHistory[0]?.role === 'system' ? conversationHistory[0].content.substring(0, 100) + '...' : 'None',
        historyMessages: conversationHistory.filter(msg => msg.role !== 'system').length - 1, // Exclude current message
        userProfile: userProfile ? Object.keys(userProfile).filter(key => userProfile[key]).join(', ') : 'None'
      });
      
      // Add loading message for long queries
      const isHistoryQuery = message.toLowerCase().includes('когда') || message.toLowerCase().includes('спрашивал');
      if (isHistoryQuery) {
        console.log('🔍 History query detected - may take longer due to RAG processing');
      }
      
      // Call AI service with conversation context
      const response = await aiService.sendChatMessage({
        user_id: userId,
        session_id: chatSession.sessionId,
        message: message,
        conversation_history: conversationHistory,
        attachments: [],
        user_profile: userProfile,
        context_settings: {
          include_recent_messages: 8,
          include_session_summary: true,
          max_context_tokens: 3000
        }
      });
      
      console.log(`🔍 DEBUG: API call made with user_id: ${userId}, session_id: ${chatSession.sessionId}`);
      console.log(`🔍 DEBUG: Response received:`, { 
        response_length: response.response_text?.length || 0,
        used_rag: response.used_rag || false,
        timestamp: response.timestamp 
      });
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: response.response_text,
        sender: 'ai',
        timestamp: new Date(response.timestamp)
      };
      
      // Add AI message
      set((state) => ({
        chatMessages: [...state.chatMessages, aiMessage]
      }));
      
      // Update session with current activity
      const updatedSession = {
        ...chatSession,
        messageCount: state.chatMessages.length + 2,
        lastActivity: new Date().toISOString()
      };
      set({ chatSession: updatedSession });
      saveSession(updatedSession);
      saveChatHistory(userId, [...state.chatMessages, userMessage, aiMessage]);
      
    } catch (error) {
      console.error('Failed to send chat message:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: 'Извините, произошла ошибка. Попробуйте ещё раз.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      set((state) => ({
        chatMessages: [...state.chatMessages, errorMessage]
      }));
    } finally {
      set({ chatLoading: false });
    }
  },
  
  addChatMessage: (message) => set((state) => {
    const newMessages = [...state.chatMessages, message];
    
    // Auto-save to localStorage if we have a session
    if (state.chatSession) {
      saveChatHistory(state.chatSession.userId, newMessages);
      
      // Update session
      const updatedSession = {
        ...state.chatSession,
        lastActivity: new Date().toISOString(),
        messageCount: newMessages.length
      };
      saveSession(updatedSession);
      
      return {
        chatMessages: newMessages,
        chatSession: updatedSession
      };
    }
    
    return { chatMessages: newMessages };
  }),
  
  clearChatHistory: (userId) => {
    try {
      // Clear localStorage
      localStorage.removeItem(`${CHAT_HISTORY_KEY}_${userId}`);
      localStorage.removeItem(`${CHAT_SESSION_KEY}_${userId}`);
      
      // Create new session
      const newSession: ChatSession = {
        sessionId: `session-${Date.now()}`,
        userId: userId,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: 0
      };
      saveSession(newSession);
      
      // Reset chat state
      set({ 
        chatMessages: [],
        chatSession: newSession
      });
      
      console.log('Chat history cleared, new session created');
    } catch (error) {
      console.warn('Failed to clear chat history:', error);
    }
  },
  
  setChatLoading: (loading) => set({ chatLoading: loading }),
    }),
    persistConfig
  )
); 