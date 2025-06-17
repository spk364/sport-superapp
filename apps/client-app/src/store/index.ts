import { create } from 'zustand';
import { User, Workout, Progress, Subscription, HomeTask, Note, Goal, Notification } from '../types';
import { aiService } from '../services/aiService';

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
  
  // Tasks & Notes
  homeTasks: HomeTask[];
  notes: Note[];
  
  // Goals
  goals: Goal[];
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
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
  addHomeTask: (task: HomeTask) => void;
  completeHomeTask: (taskId: string) => void;
  addNote: (note: Note) => void;
  addGoal: (goal: Goal) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  startQuestionnaire: () => void;
  setQuestionnaireActive: (isActive: boolean) => void;
  updateUserProfile: (answers: Record<string, any>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  currentPage: 'dashboard',
  workouts: [],
  selectedWorkout: null,
  progressData: [],
  subscription: null,
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
        id: 'demo-user-001',
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
})); 