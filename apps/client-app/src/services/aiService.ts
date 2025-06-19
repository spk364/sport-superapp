import { Coach, User } from '../types';

// API base URL - в production это должен быть URL вашего backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  user_id: string;
  session_id: string;
  message: string;
  conversation_history?: ConversationMessage[];
  attachments?: string[];
  user_profile?: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    goals?: string[];
    fitness_level?: string;
    equipment?: string[];
    limitations?: string[];
    nutrition_goal?: string;
    food_preferences?: string[];
    allergies?: string[];
  };
  context_settings?: {
    include_recent_messages: number; // Number of recent messages to include
    include_session_summary: boolean; // Whether to include session summary
    max_context_tokens: number; // Maximum tokens for context
  };
}

export interface ChatResponse {
  response_text: string;
  session_id: string;
  timestamp: string;
  used_rag?: boolean;
  metadata?: {
    tokens_used: number;
    model: string;
    latency_ms: number;
  };
}

export interface ProgramCreateRequest {
  user_id: string;
  goal: string;
  level: string;
  equipment: string[];
  sessions_per_week: number;
  limitations?: string[];
}

export interface ProgramResponse {
  program_id: string;
  program_structure: any;
  generated_at: string;
  metadata?: any;
}

export interface ProgressAnalysisRequest {
  user_id: string;
  period_start: string;
  period_end: string;
  include_workouts: boolean;
  include_measurements: boolean;
}

export interface ProgressAnalysisResponse {
  analysis_id: string;
  summary: string;
  bottlenecks: string[];
  recommendations: string[];
  achievements: string[];
  generated_at: string;
  metadata?: any;
}

class AIService {
  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased from default to 60 seconds

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Ошибка сервера' }));
        throw new Error(error.detail || 'Ошибка при обращении к серверу');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Время ожидания истекло. Попробуйте еще раз.');
      }
      throw error;
    }
  }

  private async makeGetRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Ошибка сервера' }));
      throw new Error(error.detail || 'Ошибка при обращении к серверу');
    }

    return response.json();
  }

  /**
   * Отправить сообщение в чат с виртуальным тренером
   */
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>('/llm/chat/send', request);
  }

  /**
   * Создать программу тренировок
   */
  async createWorkoutProgram(request: ProgramCreateRequest): Promise<ProgramResponse> {
    return this.makeRequest<ProgramResponse>('/llm/program/create', request);
  }

  /**
   * Анализ прогресса
   */
  async analyzeProgress(request: ProgressAnalysisRequest): Promise<ProgressAnalysisResponse> {
    return this.makeRequest<ProgressAnalysisResponse>('/llm/progress/analyze', request);
  }

  /**
   * Создать уведомление
   */
  async createNotification(type: string, context: any): Promise<any> {
    return this.makeRequest('/llm/notifications/create', {
      user_id: context.user_id,
      type,
      context,
    });
  }

  /**
   * Создать план питания
   */
  async createNutritionPlan(nutritionData: any): Promise<any> {
    return this.makeRequest('/llm/nutrition/create', nutritionData);
  }

  /**
   * Получить информацию о тренере
   */
  async getCoachInfo(userId?: string): Promise<Coach> {
    const endpoint = userId ? `/coach/profile/${userId}` : '/coach/profile';
    return this.makeGetRequest<Coach>(endpoint);
  }

  /**
   * Получить информацию о текущем пользователе
   */
  async getCurrentUser(): Promise<User> {
    return this.makeGetRequest<User>('/users/me');
  }

  /**
   * Обновить профиль пользователя данными из анкеты
   */
  async updateUserProfile(answers: Record<string, any>): Promise<User> {
    return this.makeRequest<User>('/users/profile/update', answers);
  }

  /**
   * Получить список тренировок для календаря
   */
  async getWorkouts(params?: {
    client_id?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.client_id) queryParams.append('client_id', params.client_id);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = `/workouts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeGetRequest<any[]>(endpoint);
  }
}

export const aiService = new AIService(); 