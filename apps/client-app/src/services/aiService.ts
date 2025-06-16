import { Coach, User } from '../types';

// API base URL - в production это должен быть URL вашего backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface ChatRequest {
  user_id: string;
  session_id: string;
  message: string;
  attachments?: string[];
}

export interface ChatResponse {
  response_text: string;
  session_id: string;
  timestamp: string;
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
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Ошибка сервера' }));
      throw new Error(error.detail || 'Ошибка при обращении к серверу');
    }

    return response.json();
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
}

export const aiService = new AIService(); 