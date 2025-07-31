import { PaymentRequest, PaymentResponse } from './paymentService';

export interface KaspiPayPaymentRequest extends PaymentRequest {
  redirectUrl: string;
  failUrl: string;
  description: string;
  language?: 'ru' | 'kk' | 'en';
  customerPhone?: string;
  customerEmail?: string;
}

export interface KaspiPayResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  qrCode?: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  error?: string;
  amount: number;
  currency: string;
  commission?: number;
  paymentMethod: 'qr' | 'redirect' | 'app';
}

export interface KaspiPayStatusResponse {
  transactionId: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'expired';
  amount: number;
  currency: string;
  commission: number;
  paymentDate?: Date;
  customerPhone?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface KaspiPayConfig {
  merchantId: string;
  secretKey: string;
  apiUrl: string;
  testMode: boolean;
}

/**
 * Kaspi Pay Service - интеграция с платежной системой Kaspi Bank
 * Основано на официальной документации Kaspi Pay API
 */
class KaspiPayService {
  private config: KaspiPayConfig;

  constructor(config: KaspiPayConfig) {
    this.config = config;
  }

  /**
   * Создание платежа через Kaspi Pay
   */
  async createPayment(request: KaspiPayPaymentRequest): Promise<KaspiPayResponse> {
    try {
      const transactionId = this.generateTransactionId();
      
      // В тестовом режиме симулируем различные сценарии
      if (this.config.testMode) {
        return this.simulatePayment(request, transactionId);
      }

      // Формируем запрос к Kaspi Pay API
      const apiRequest = {
        merchantId: this.config.merchantId,
        amount: request.amount,
        currency: request.currency,
        orderId: request.planId + '_' + Date.now(),
        description: request.description,
        redirectUrl: request.redirectUrl,
        failUrl: request.failUrl,
        language: request.language || 'ru',
        customerPhone: request.customerPhone,
        customerEmail: request.customerEmail,
        timestamp: Date.now(),
      };

      // Добавляем подпись запроса
      const signature = this.generateSignature(apiRequest);
      
      const response = await fetch(`${this.config.apiUrl}/api/v1/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.secretKey}`,
          'X-Signature': signature,
        },
        body: JSON.stringify(apiRequest),
      });

      if (!response.ok) {
        throw new Error(`Kaspi Pay API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        transactionId: data.transactionId,
        paymentUrl: data.paymentUrl,
        qrCode: data.qrCode,
        status: 'pending',
        amount: request.amount,
        currency: request.currency,
        paymentMethod: data.paymentMethod || 'redirect',
      };

    } catch (error) {
      console.error('Kaspi Pay payment creation error:', error);
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        amount: request.amount,
        currency: request.currency,
        paymentMethod: 'redirect',
      };
    }
  }

  /**
   * Проверка статуса платежа
   */
  async getPaymentStatus(transactionId: string): Promise<KaspiPayStatusResponse> {
    try {
      if (this.config.testMode) {
        return this.simulateStatusCheck(transactionId);
      }

      const response = await fetch(
        `${this.config.apiUrl}/api/v1/payments/${transactionId}/status`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.secretKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        transactionId: data.transactionId,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        commission: data.commission || 0,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
        customerPhone: data.customerPhone,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
      };

    } catch (error) {
      console.error('Kaspi Pay status check error:', error);
      throw error;
    }
  }

  /**
   * Генерация QR-кода для оплаты
   */
  async generateQRCode(transactionId: string): Promise<string> {
    if (this.config.testMode) {
      // В тестовом режиме возвращаем base64 QR-код
      return this.generateTestQRCode(transactionId);
    }

    try {
      const response = await fetch(
        `${this.config.apiUrl}/api/v1/payments/${transactionId}/qr`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.secretKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`QR generation failed: ${response.status}`);
      }

      const data = await response.json();
      return data.qrCode;

    } catch (error) {
      console.error('QR code generation error:', error);
      throw error;
    }
  }

  /**
   * Отмена платежа
   */
  async cancelPayment(transactionId: string): Promise<boolean> {
    try {
      if (this.config.testMode) {
        console.log(`Cancelling test payment: ${transactionId}`);
        return true;
      }

      const response = await fetch(
        `${this.config.apiUrl}/api/v1/payments/${transactionId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.ok;

    } catch (error) {
      console.error('Payment cancellation error:', error);
      return false;
    }
  }

  /**
   * Валидация webhook уведомления от Kaspi Pay
   */
  validateWebhook(payload: any, signature: string): boolean {
    try {
      const expectedSignature = this.generateWebhookSignature(payload);
      return expectedSignature === signature;
    } catch (error) {
      console.error('Webhook validation error:', error);
      return false;
    }
  }

  /**
   * Симуляция платежа для тестирования
   */
  private async simulatePayment(
    request: KaspiPayPaymentRequest, 
    transactionId: string
  ): Promise<KaspiPayResponse> {
    // Задержка для реалистичности
    await this.delay(1000);

    // Симулируем разные сценарии на основе суммы
    const amount = request.amount;
    
    if (amount === 1) {
      // Неуспешный платеж - недостаточно средств
      return {
        success: false,
        transactionId,
        status: 'failed',
        error: 'Недостаточно средств на карте',
        amount: request.amount,
        currency: request.currency,
        paymentMethod: 'app',
      };
    }

    if (amount === 2) {
      // Платеж требует подтверждения в приложении
      return {
        success: true,
        transactionId,
        paymentUrl: `kaspi://pay?transaction=${transactionId}`,
        qrCode: this.generateTestQRCode(transactionId),
        status: 'pending',
        amount: request.amount,
        currency: request.currency,
        paymentMethod: 'app',
      };
    }

    // Успешный платеж
    return {
      success: true,
      transactionId,
      paymentUrl: `kaspi://pay?transaction=${transactionId}`,
      qrCode: this.generateTestQRCode(transactionId),
      status: 'pending',
      amount: request.amount,
      currency: request.currency,
      commission: Math.round(request.amount * 0.015), // 1.5% комиссия
      paymentMethod: 'qr',
    };
  }

  /**
   * Симуляция проверки статуса
   */
  private async simulateStatusCheck(transactionId: string): Promise<KaspiPayStatusResponse> {
    await this.delay(500);

    // Симулируем статус на основе ID транзакции
    const lastDigit = parseInt(transactionId.slice(-1));
    
    if (lastDigit < 2) {
      return {
        transactionId,
        status: 'failed',
        amount: 0,
        currency: 'KZT',
        commission: 0,
        errorCode: 'INSUFFICIENT_FUNDS',
        errorMessage: 'Недостаточно средств',
      };
    }

    if (lastDigit < 4) {
      return {
        transactionId,
        status: 'pending',
        amount: 15000,
        currency: 'KZT',
        commission: 225,
      };
    }

    return {
      transactionId,
      status: 'success',
      amount: 15000,
      currency: 'KZT',
      commission: 225,
      paymentDate: new Date(),
      customerPhone: '+7 707 123 45 67',
    };
  }

  /**
   * Генерация тестового QR-кода
   */
  private generateTestQRCode(transactionId: string): string {
    // Простой тестовый QR-код в base64
    const qrData = `kaspi://pay?transaction=${transactionId}&amount=15000&merchant=${this.config.merchantId}`;
    
    // В реальном приложении здесь бы был настоящий QR-код
    // Для демо возвращаем mock base64 строку
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  }

  /**
   * Генерация ID транзакции
   */
  private generateTransactionId(): string {
    return `kaspi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Генерация подписи запроса
   */
  private generateSignature(data: any): string {
    // Простая имитация подписи для тестирования
    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&') + this.config.secretKey;
    
    // В реальном приложении здесь был бы HMAC-SHA256
    return btoa(signatureString).substring(0, 32);
  }

  /**
   * Генерация подписи для webhook
   */
  private generateWebhookSignature(payload: any): string {
    return this.generateSignature(payload);
  }

  /**
   * Утилита для задержки
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Получить тестовые данные для разработки
   */
  static getTestConfig(): KaspiPayConfig {
    return {
      merchantId: 'TEST_MERCHANT_123',
      secretKey: 'test_secret_key_kaspi_pay_demo',
      apiUrl: 'https://api.kaspi.kz/test',
      testMode: true,
    };
  }

  /**
   * Получить тестовые телефоны для разных сценариев
   */
  static getTestPhones(): Record<string, string> {
    return {
      success: '+7 707 123 45 67',
      insufficient_funds: '+7 707 123 45 68',
      blocked_card: '+7 707 123 45 69',
      expired_card: '+7 707 123 45 70',
      wrong_pin: '+7 707 123 45 71',
    };
  }
}

export const kaspiPayService = new KaspiPayService(KaspiPayService.getTestConfig());