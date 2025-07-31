import { Subscription, Payment } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'unlimited';
  price: number;
  currency: string;
  sessionsIncluded?: number;
  duration?: number; // in days
  features: string[];
  isPopular?: boolean;
  description?: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethod: string;
  autoRenewal?: boolean;
}

export interface UpdateSubscriptionRequest {
  autoRenewal?: boolean;
  paymentMethod?: string;
}

export interface SubscriptionUsageResponse {
  subscription: Subscription;
  usage: {
    sessionsUsed: number;
    sessionsRemaining: number;
    daysRemaining: number;
    usagePercentage: number;
  };
}

class SubscriptionService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header when auth is implemented
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Ошибка сервера' }));
      throw new Error(error.detail || 'Ошибка при обращении к серверу');
    }

    return response.json();
  }

  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await this.makeRequest<{ plans: SubscriptionPlan[] }>('/subscriptions/plans');
      return response.plans;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      // Return mock data for development
      return this.getMockPlans();
    }
  }

  /**
   * Get current user subscription
   */
  async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    try {
      const response = await this.makeRequest<{ subscription: Subscription | null }>(`/subscriptions/current/${userId}`);
      return response.subscription;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      // Return mock subscription for development
      return this.getMockSubscription();
    }
  }

  /**
   * Get subscription usage details
   */
  async getSubscriptionUsage(userId: string): Promise<SubscriptionUsageResponse | null> {
    try {
      const response = await this.makeRequest<SubscriptionUsageResponse>(`/subscriptions/usage/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching subscription usage:', error);
      return null;
    }
  }

  /**
   * Create new subscription
   */
  async createSubscription(userId: string, request: CreateSubscriptionRequest): Promise<{ subscription: Subscription; paymentUrl?: string }> {
    try {
      const response = await this.makeRequest<{ subscription: Subscription; paymentUrl?: string }>('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ userId, ...request }),
      });
      return response;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription settings
   */
  async updateSubscription(subscriptionId: string, updates: UpdateSubscriptionRequest): Promise<Subscription> {
    try {
      const response = await this.makeRequest<{ subscription: Subscription }>(`/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return response.subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      // Return mock updated subscription for development
      console.log(`Mock: Updating subscription ${subscriptionId} with:`, updates);
      const mockSubscription = this.getMockSubscription();
      if (mockSubscription) {
        return {
          ...mockSubscription,
          ...updates,
          id: subscriptionId,
        };
      }
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<{ success: boolean }> {
    try {
      const response = await this.makeRequest<{ success: boolean }>(`/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      return response;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      // Return mock success for development
      console.log(`Mock: Canceling subscription ${subscriptionId} with reason: ${reason || 'No reason provided'}`);
      return { success: true };
    }
  }

  /**
   * Renew subscription
   */
  async renewSubscription(subscriptionId: string, planId?: string): Promise<{ subscription: Subscription; paymentUrl?: string }> {
    try {
      const response = await this.makeRequest<{ subscription: Subscription; paymentUrl?: string }>(`/subscriptions/${subscriptionId}/renew`, {
        method: 'POST',
        body: JSON.stringify({ planId }),
      });
      return response;
    } catch (error) {
      console.error('Error renewing subscription:', error);
      // Return mock renewed subscription for development
      console.log(`Mock: Renewing subscription ${subscriptionId} with plan: ${planId || 'current plan'}`);
      const mockSubscription = this.getMockSubscription();
      if (mockSubscription) {
        const renewedDate = new Date();
        renewedDate.setMonth(renewedDate.getMonth() + 1); // Add 1 month
        return {
          subscription: {
            ...mockSubscription,
            id: subscriptionId,
            status: 'active' as const,
            endDate: renewedDate,
            startDate: new Date(),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(userId: string): Promise<Payment[]> {
    try {
      const response = await this.makeRequest<{ payments: Payment[] }>(`/payments/${userId}`);
      return response.payments;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  /**
   * Process payment for subscription
   */
  async processPayment(subscriptionId: string, paymentMethod: string): Promise<{ success: boolean; paymentUrl?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; paymentUrl?: string }>(`/payments/process`, {
        method: 'POST',
        body: JSON.stringify({ subscriptionId, paymentMethod }),
      });
      return response;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Mock data for development
   */
  private getMockPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'monthly',
        name: 'Месячный план',
        type: 'monthly',
        price: 15000,
        currency: 'KZT',
        sessionsIncluded: 8,
        duration: 30,
        features: [
          '8 персональных тренировок',
          'AI помощник 24/7',
          'Индивидуальная программа',
          'Трекинг прогресса',
        ],
      },
      {
        id: 'quarterly',
        name: 'Квартальный план',
        type: 'quarterly',
        price: 40000,
        currency: 'KZT',
        sessionsIncluded: 24,
        duration: 90,
        isPopular: true,
        features: [
          '24 персональные тренировки',
          'AI помощник 24/7',
          'Индивидуальная программа',
          'Трекинг прогресса',
          'Скидка 11%',
        ],
      },
      {
        id: 'yearly',
        name: 'Годовой план',
        type: 'yearly',
        price: 144000,
        currency: 'KZT',
        sessionsIncluded: 96,
        duration: 365,
        features: [
          '96 персональных тренировок',
          'AI помощник 24/7',
          'Индивидуальная программа',
          'Трекинг прогресса',
          'Скидка 20%',
          'Приоритетная поддержка',
        ],
      },
    ];
  }

  private getMockSubscription(): Subscription {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 15); // 15 days ago
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 15); // 15 days from now

    return {
      id: 'sub_123',
      type: 'monthly',
      name: 'Месячный план',
      price: 15000,
      currency: 'KZT',
      sessionsIncluded: 8,
      sessionsUsed: 6,
      startDate,
      endDate,
      status: 'active',
      autoRenewal: true,
    };
  }
}

export const subscriptionService = new SubscriptionService();