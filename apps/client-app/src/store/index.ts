import { create } from 'zustand';
import { User, Workout, Progress, Subscription, HomeTask, Note, Goal, Notification } from '../types';

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
  
  // Actions
  setUser: (user: User | null) => void;
  setCurrentPage: (page: string) => void;
  setWorkouts: (workouts: Workout[]) => void;
  setSelectedWorkout: (workout: Workout | null) => void;
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
  homeTasks: [],
  notes: [],
  goals: [],
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setWorkouts: (workouts) => set({ workouts }),
  
  setSelectedWorkout: (workout) => set({ selectedWorkout: workout }),
  
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
})); 