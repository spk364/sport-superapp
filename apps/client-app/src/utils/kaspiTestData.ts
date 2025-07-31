import { kaspiPayService } from '../services/kaspiPayService';

/**
 * Тестовые данные и сценарии для Kaspi Pay
 * Основаны на официальной документации Kaspi Bank
 */

export interface KaspiTestScenario {
  id: string;
  name: string;
  description: string;
  amount: number;
  phone?: string;
  expectedResult: 'success' | 'failure';
  errorCode?: string;
  processingTime: number; // seconds
}

export const kaspiTestScenarios: KaspiTestScenario[] = [
  {
    id: 'success_standard',
    name: 'Успешная оплата',
    description: 'Стандартная успешная оплата через Kaspi Pay',
    amount: 15000,
    phone: '+7 707 123 45 67',
    expectedResult: 'success',
    processingTime: 5,
  },
  {
    id: 'success_large_amount',
    name: 'Крупная сумма',
    description: 'Успешная оплата крупной суммы',
    amount: 100000,
    phone: '+7 707 123 45 67',
    expectedResult: 'success',
    processingTime: 8,
  },
  {
    id: 'insufficient_funds',
    name: 'Недостаточно средств',
    description: 'Платеж отклонен из-за недостатка средств',
    amount: 1,
    phone: '+7 707 123 45 68',
    expectedResult: 'failure',
    errorCode: 'INSUFFICIENT_FUNDS',
    processingTime: 3,
  },
  {
    id: 'blocked_card',
    name: 'Заблокированная карта',
    description: 'Платеж отклонен - карта заблокирована',
    amount: 5000,
    phone: '+7 707 123 45 69',
    expectedResult: 'failure',
    errorCode: 'CARD_BLOCKED',
    processingTime: 2,
  },
  {
    id: 'expired_card',
    name: 'Истекшая карта',
    description: 'Платеж отклонен - срок действия карты истек',
    amount: 10000,
    phone: '+7 707 123 45 70',
    expectedResult: 'failure',
    errorCode: 'CARD_EXPIRED',
    processingTime: 2,
  },
  {
    id: 'wrong_pin',
    name: 'Неверный PIN',
    description: 'Платеж отклонен - неправильный PIN-код',
    amount: 7500,
    phone: '+7 707 123 45 71',
    expectedResult: 'failure',
    errorCode: 'WRONG_PIN',
    processingTime: 4,
  },
  {
    id: 'timeout',
    name: 'Таймаут операции',
    description: 'Превышено время ожидания подтверждения',
    amount: 20000,
    phone: '+7 707 123 45 72',
    expectedResult: 'failure',
    errorCode: 'TIMEOUT',
    processingTime: 15,
  },
];

export const kaspiErrorCodes = {
  'INSUFFICIENT_FUNDS': 'Недостаточно средств на карте',
  'CARD_BLOCKED': 'Карта заблокирована',
  'CARD_EXPIRED': 'Срок действия карты истек',
  'WRONG_PIN': 'Неверный PIN-код',
  'TIMEOUT': 'Превышено время ожидания',
  'NETWORK_ERROR': 'Ошибка сети',
  'INVALID_AMOUNT': 'Неверная сумма платежа',
  'LIMIT_EXCEEDED': 'Превышен лимит операций',
  'SERVICE_UNAVAILABLE': 'Сервис временно недоступен',
};

/**
 * Коды тестовых карт Kaspi
 */
export const kaspiTestCards = {
  // Успешные платежи
  'success_standard': {
    pan: '4400 4301 0000 0001',
    description: 'Стандартная успешная карта Kaspi Gold',
  },
  'success_premium': {
    pan: '4400 4302 0000 0001',
    description: 'Премиум карта Kaspi Red',
  },
  
  // Ошибки
  'insufficient_funds': {
    pan: '4400 4301 0000 0002',
    description: 'Карта с недостатком средств',
  },
  'blocked_card': {
    pan: '4400 4301 0000 0003',
    description: 'Заблокированная карта',
  },
  'expired_card': {
    pan: '4400 4301 0000 0004',
    description: 'Карта с истекшим сроком действия',
  },
};

/**
 * Генератор тестовых QR-кодов для Kaspi Pay
 */
export class KaspiTestQRGenerator {
  static generate(transactionId: string, amount: number): string {
    const qrData = {
      merchant: 'TEST_MERCHANT_123',
      transaction: transactionId,
      amount: amount,
      currency: 'KZT',
      timestamp: Date.now(),
    };

    // В реальной интеграции здесь был бы настоящий QR-код
    // Для тестирования возвращаем base64 строку с данными
    const qrString = JSON.stringify(qrData);
    return `data:image/png;base64,${btoa(qrString)}`;
  }

  static parse(qrCode: string): any {
    try {
      if (qrCode.startsWith('data:image/png;base64,')) {
        const data = qrCode.replace('data:image/png;base64,', '');
        return JSON.parse(atob(data));
      }
      return null;
    } catch {
      return null;
    }
  }
}

/**
 * Эмулятор webhook уведомлений от Kaspi
 */
export class KaspiWebhookEmulator {
  static async simulateWebhook(transactionId: string, status: string, delay = 3000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const webhookData = {
          transactionId,
          status,
          amount: 15000,
          currency: 'KZT',
          commission: 225,
          timestamp: new Date().toISOString(),
          signature: this.generateSignature(transactionId, status),
        };

        console.log('📨 Kaspi Webhook:', webhookData);
        
        // Эмулируем отправку webhook на сервер
        window.dispatchEvent(new CustomEvent('kaspi-webhook', {
          detail: webhookData
        }));
        
        resolve();
      }, delay);
    });
  }

  private static generateSignature(transactionId: string, status: string): string {
    return btoa(`${transactionId}_${status}_test_signature`);
  }
}

/**
 * Утилиты для тестирования Kaspi Pay
 */
export class KaspiTestUtils {
  /**
   * Получить сценарий по сумме платежа
   */
  static getScenarioByAmount(amount: number): KaspiTestScenario | null {
    return kaspiTestScenarios.find(scenario => scenario.amount === amount) || null;
  }

  /**
   * Получить тестовый телефон для сценария
   */
  static getTestPhone(scenarioId: string): string {
    const scenario = kaspiTestScenarios.find(s => s.id === scenarioId);
    return scenario?.phone || '+7 707 123 45 67';
  }

  /**
   * Проверить, является ли номер телефона тестовым
   */
  static isTestPhone(phone: string): boolean {
    return kaspiTestScenarios.some(scenario => scenario.phone === phone);
  }

  /**
   * Получить описание ошибки по коду
   */
  static getErrorDescription(errorCode: string): string {
    return kaspiErrorCodes[errorCode as keyof typeof kaspiErrorCodes] || 'Неизвестная ошибка';
  }

  /**
   * Валидация суммы для тестирования
   */
  static validateTestAmount(amount: number): { valid: boolean; message?: string } {
    if (amount < 100) {
      return { valid: false, message: 'Минимальная сумма для тестирования: 100 тенге' };
    }
    
    if (amount > 1000000) {
      return { valid: false, message: 'Максимальная сумма для тестирования: 1,000,000 тенге' };
    }

    return { valid: true };
  }

  /**
   * Логирование тестового сценария
   */
  static logTestScenario(scenario: KaspiTestScenario, result: any): void {
    console.group(`🧪 Kaspi Pay Test: ${scenario.name}`);
    console.log('💰 Сумма:', scenario.amount, 'KZT');
    console.log('📱 Телефон:', scenario.phone);
    console.log('⏱️ Время обработки:', scenario.processingTime, 'сек');
    console.log('✅ Ожидаемый результат:', scenario.expectedResult);
    if (scenario.errorCode) {
      console.log('❌ Код ошибки:', scenario.errorCode);
    }
    console.log('📊 Результат:', result);
    console.groupEnd();
  }
}

/**
 * Демо-скрипт для тестирования Kaspi Pay
 */
export const runKaspiTestDemo = (): void => {
  console.log('🚀 Kaspi Pay Test Demo');
  console.log('====================');
  
  console.log('\n📋 Доступные тестовые сценарии:');
  kaspiTestScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name} (${scenario.amount} KZT)`);
    console.log(`   ${scenario.description}`);
    console.log(`   Телефон: ${scenario.phone}`);
    console.log('');
  });

  console.log('💳 Тестовые карты:');
  Object.entries(kaspiTestCards).forEach(([key, card]) => {
    console.log(`${card.pan} - ${card.description}`);
  });

  console.log('\n🎯 Как тестировать:');
  console.log('1. Выберите план подписки');
  console.log('2. Нажмите "Выбрать" → "Kaspi Pay"');
  console.log('3. Используйте суммы из тестовых сценариев');
  console.log('4. Наблюдайте за различными результатами');

  console.log('\n🛠️ Доступные утилиты:');
  console.log('- KaspiTestUtils.getScenarioByAmount(amount)');
  console.log('- KaspiTestUtils.getTestPhone(scenarioId)');
  console.log('- KaspiTestUtils.getErrorDescription(errorCode)');
  console.log('- KaspiWebhookEmulator.simulateWebhook(id, status)');
};

// Автозапуск демо в режиме разработки
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    if (window.location.pathname.includes('subscription') || window.location.pathname.includes('payment')) {
      runKaspiTestDemo();
    }
  }, 2000);
}