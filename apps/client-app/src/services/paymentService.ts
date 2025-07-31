import { Payment } from '../types';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'kaspi' | 'halyk' | 'sber' | 'apple_pay' | 'google_pay';
  name: string;
  icon: string;
  enabled: boolean;
  processingTime: number; // seconds
}

export interface CardDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
  subscriptionId?: string;
  planId: string;
  cardDetails?: CardDetails;
  returnUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentUrl?: string;
  error?: string;
  receipt?: PaymentReceipt;
}

export interface PaymentReceipt {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  date: Date;
  paymentMethod: string;
  planName: string;
  status: string;
  transactionId: string;
}

export interface PaymentSimulationOptions {
  shouldFail?: boolean;
  failureReason?: string;
  processingDelay?: number;
}

class PaymentService {
  private apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  /**
   * Get available payment methods for the region
   */
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'card',
        type: 'card',
        name: 'Банковская карта',
        icon: '💳',
        enabled: true,
        processingTime: 2,
      },
      {
        id: 'kaspi',
        type: 'kaspi',
        name: 'Kaspi Pay',
        icon: '🔴',
        enabled: true,
        processingTime: 3,
      },
      {
        id: 'halyk',
        type: 'halyk',
        name: 'Halyk Bank',
        icon: '🟢',
        enabled: true,
        processingTime: 4,
      },
      {
        id: 'sber',
        type: 'sber',
        name: 'Сбербанк',
        icon: '🟢',
        enabled: true,
        processingTime: 3,
      },
      {
        id: 'apple_pay',
        type: 'apple_pay',
        name: 'Apple Pay',
        icon: '🍎',
        enabled: true,
        processingTime: 1,
      },
      {
        id: 'google_pay',
        type: 'google_pay',
        name: 'Google Pay',
        icon: '🟡',
        enabled: true,
        processingTime: 1,
      },
    ];
  }

  /**
   * Process payment for subscription
   */
  async processPayment(
    request: PaymentRequest,
    simulationOptions?: PaymentSimulationOptions
  ): Promise<PaymentResponse> {
    try {
      // Get payment method details
      const paymentMethod = this.getPaymentMethods().find(pm => pm.id === request.paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      // Simulate processing delay
      const processingTime = simulationOptions?.processingDelay || paymentMethod.processingTime;
      await this.delay(processingTime * 1000);

      // Simulate payment failure for testing
      if (simulationOptions?.shouldFail) {
        return {
          success: false,
          paymentId: `failed_${Date.now()}`,
          status: 'failed',
          error: simulationOptions.failureReason || 'Payment failed - insufficient funds',
        };
      }

      // Validate card details if card payment
      if (request.paymentMethodId === 'card' && request.cardDetails) {
        const validationError = this.validateCardDetails(request.cardDetails);
        if (validationError) {
          return {
            success: false,
            paymentId: `validation_failed_${Date.now()}`,
            status: 'failed',
            error: validationError,
          };
        }
      }

      // Generate successful payment response
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transactionId = `txn_${Date.now()}`;

      const receipt: PaymentReceipt = {
        id: `receipt_${Date.now()}`,
        paymentId,
        amount: request.amount,
        currency: request.currency,
        date: new Date(),
        paymentMethod: paymentMethod.name,
        planName: this.getPlanNameById(request.planId),
        status: 'completed',
        transactionId,
      };

      // For digital wallets and some bank methods, simulate redirect flow
      if (['kaspi', 'halyk', 'sber'].includes(request.paymentMethodId)) {
        return {
          success: true,
          paymentId,
          status: 'pending',
          paymentUrl: `${this.apiBaseUrl}/payment/redirect/${paymentId}?method=${request.paymentMethodId}`,
          receipt,
        };
      }

      // Direct payment success (cards, mobile wallets)
      return {
        success: true,
        paymentId,
        status: 'completed',
        receipt,
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        paymentId: `error_${Date.now()}`,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown payment error',
      };
    }
  }

  /**
   * Validate card details
   */
  private validateCardDetails(cardDetails: CardDetails): string | null {
    // Basic card number validation (simplified Luhn algorithm)
    if (!this.isValidCardNumber(cardDetails.cardNumber)) {
      return 'Неверный номер карты';
    }

    // CVV validation
    if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      return 'Неверный CVV код';
    }

    // Expiry date validation
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expiryYear = parseInt(cardDetails.expiryYear);
    const expiryMonth = parseInt(cardDetails.expiryMonth);

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return 'Карта истекла';
    }

    // Cardholder name validation
    if (!cardDetails.cardholderName.trim()) {
      return 'Введите имя держателя карты';
    }

    return null;
  }

  /**
   * Simple card number validation (Luhn algorithm)
   */
  private isValidCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // Basic length check
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      return false;
    }

    // Test card numbers for development
    const testCards = [
      '4111111111111111', // Visa
      '5555555555554444', // MasterCard
      '378282246310005',  // American Express
      '4000000000000002', // Declined card
    ];

    if (testCards.includes(cleanNumber)) {
      return true;
    }

    // Simplified Luhn check
    let sum = 0;
    let alternate = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cleanNumber.charAt(i));
      
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Get payment status by payment ID
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      // Simulate API call delay
      await this.delay(500);

      // For demo purposes, simulate different payment statuses
      if (paymentId.includes('failed')) {
        return {
          success: false,
          paymentId,
          status: 'failed',
          error: 'Payment failed',
        };
      }

      if (paymentId.includes('pending')) {
        return {
          success: true,
          paymentId,
          status: 'pending',
        };
      }

      return {
        success: true,
        paymentId,
        status: 'completed',
      };
    } catch (error) {
      return {
        success: false,
        paymentId,
        status: 'failed',
        error: 'Failed to check payment status',
      };
    }
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userId: string): Promise<Payment[]> {
    try {
      // Simulate API call
      await this.delay(1000);

      // Return mock payment history
      return this.getMockPaymentHistory();
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  /**
   * Generate payment receipt URL
   */
  generateReceiptUrl(paymentId: string): string {
    return `${this.apiBaseUrl}/receipts/${paymentId}`;
  }

  /**
   * Mock payment history for testing
   */
  private getMockPaymentHistory(): Payment[] {
    const now = new Date();
    return [
      {
        id: 'pay_001',
        amount: 15000,
        currency: 'KZT',
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        type: 'subscription',
        status: 'completed',
        description: 'Месячный план - Январь 2024',
        receipt: 'receipt_001',
      },
      {
        id: 'pay_002',
        amount: 40000,
        currency: 'KZT',
        date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        type: 'subscription',
        status: 'completed',
        description: 'Квартальный план - Октябрь 2023',
        receipt: 'receipt_002',
        subscriptionId: 'sub_quarterly_001',
      },
      {
        id: 'pay_003',
        amount: 5000,
        currency: 'KZT',
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        type: 'single_session',
        status: 'completed',
        description: 'Дополнительная тренировка',
        receipt: 'receipt_003',
      },
    ];
  }

  /**
   * Get plan name by ID
   */
  private getPlanNameById(planId: string): string {
    const planNames: Record<string, string> = {
      monthly: 'Месячный план',
      quarterly: 'Квартальный план',
      yearly: 'Годовой план',
    };
    return planNames[planId] || 'Неизвестный план';
  }

  /**
   * Utility function to simulate delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simulate payment failure for testing
   */
  async simulatePaymentFailure(reason: string = 'Insufficient funds'): Promise<PaymentResponse> {
    return {
      success: false,
      paymentId: `sim_fail_${Date.now()}`,
      status: 'failed',
      error: reason,
    };
  }

  /**
   * Test different card scenarios
   */
  getTestCardNumbers(): Record<string, string> {
    return {
      'visa_success': '4111111111111111',
      'mastercard_success': '5555555555554444',
      'amex_success': '378282246310005',
      'declined': '4000000000000002',
      'insufficient_funds': '4000000000000119',
      'expired': '4000000000000069',
      'invalid_cvv': '4000000000000127',
    };
  }
}

export const paymentService = new PaymentService();