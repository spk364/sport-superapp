import { paymentService } from '../services/paymentService';

/**
 * Payment Testing Scenarios for Development
 * These functions help test different payment flows and edge cases
 */

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  cardNumber?: string;
  expectation: 'success' | 'failure';
  failureReason?: string;
}

export const paymentTestScenarios: TestScenario[] = [
  {
    id: 'visa_success',
    name: 'Успешная оплата Visa',
    description: 'Тестовая карта Visa для успешных платежей',
    cardNumber: '4111 1111 1111 1111',
    expectation: 'success',
  },
  {
    id: 'mastercard_success',
    name: 'Успешная оплата MasterCard',
    description: 'Тестовая карта MasterCard для успешных платежей',
    cardNumber: '5555 5555 5555 4444',
    expectation: 'success',
  },
  {
    id: 'amex_success',
    name: 'Успешная оплата American Express',
    description: 'Тестовая карта AmEx для успешных платежей',
    cardNumber: '3782 822463 10005',
    expectation: 'success',
  },
  {
    id: 'declined_card',
    name: 'Отклонённая карта',
    description: 'Карта, которая будет отклонена банком',
    cardNumber: '4000 0000 0000 0002',
    expectation: 'failure',
    failureReason: 'Карта отклонена банком',
  },
  {
    id: 'insufficient_funds',
    name: 'Недостаточно средств',
    description: 'Карта с недостаточным балансом',
    cardNumber: '4000 0000 0000 0119',
    expectation: 'failure',
    failureReason: 'Недостаточно средств на карте',
  },
  {
    id: 'expired_card',
    name: 'Истёкшая карта',
    description: 'Карта с истёкшим сроком действия',
    cardNumber: '4000 0000 0000 0069',
    expectation: 'failure',
    failureReason: 'Срок действия карты истёк',
  },
  {
    id: 'invalid_cvv',
    name: 'Неверный CVV',
    description: 'Карта с неправильным CVV кодом',
    cardNumber: '4000 0000 0000 0127',
    expectation: 'failure',
    failureReason: 'Неверный CVV код',
  },
];

export const digitalWalletScenarios = [
  {
    id: 'kaspi_success',
    name: 'Kaspi Pay - Успешно',
    description: 'Успешная оплата через Kaspi Pay',
    expectation: 'success',
  },
  {
    id: 'halyk_redirect',
    name: 'Halyk Bank - С редиректом',
    description: 'Оплата через Halyk Bank с переходом на банковскую страницу',
    expectation: 'success',
  },
  {
    id: 'apple_pay_success',
    name: 'Apple Pay - Быстрая оплата',
    description: 'Мгновенная оплата через Apple Pay',
    expectation: 'success',
  },
];

/**
 * Utility functions for testing payment flows
 */
export class PaymentTestUtils {
  /**
   * Get test card numbers for different scenarios
   */
  static getTestCards() {
    return paymentService.getTestCardNumbers();
  }

  /**
   * Simulate payment failure for testing error handling
   */
  static async simulatePaymentFailure(reason?: string) {
    return paymentService.simulatePaymentFailure(reason);
  }

  /**
   * Get mock payment for testing UI components
   */
  static getMockPayment(scenario: TestScenario) {
    return {
      id: `test_${scenario.id}_${Date.now()}`,
      amount: 15000,
      currency: 'KZT',
      date: new Date(),
      type: 'subscription' as const,
      status: scenario.expectation === 'success' ? 'completed' as const : 'failed' as const,
      description: `Тест: ${scenario.name}`,
      receipt: scenario.expectation === 'success' ? `receipt_${scenario.id}` : undefined,
    };
  }

  /**
   * Fill form with test card data
   */
  static getTestCardDetails(scenarioId: string) {
    const scenario = paymentTestScenarios.find(s => s.id === scenarioId);
    if (!scenario?.cardNumber) return null;

    return {
      cardNumber: scenario.cardNumber,
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'TEST USER',
    };
  }

  /**
   * Log payment test scenario for debugging
   */
  static logTestScenario(scenario: TestScenario, result: any) {
    console.group(`💳 Payment Test: ${scenario.name}`);
    console.log('Description:', scenario.description);
    console.log('Card Number:', scenario.cardNumber);
    console.log('Expected:', scenario.expectation);
    console.log('Result:', result);
    console.groupEnd();
  }

  /**
   * Validate test environment setup
   */
  static validateTestEnvironment() {
    const issues: string[] = [];

    // Check if running in development
    if (process.env.NODE_ENV === 'production') {
      issues.push('Payment testing should not be used in production');
    }

    // Check required environment variables
    if (!process.env.REACT_APP_API_URL) {
      issues.push('REACT_APP_API_URL is not set');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}

/**
 * Demo script for testing payment flows
 */
export const runPaymentDemoScript = () => {
  console.log('🚀 Payment System Demo Script');
  console.log('============================');
  
  const validation = PaymentTestUtils.validateTestEnvironment();
  if (!validation.isValid) {
    console.warn('⚠️ Test environment issues:', validation.issues);
  }

  console.log('\n📋 Available Test Scenarios:');
  paymentTestScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`);
    console.log(`   Card: ${scenario.cardNumber}`);
    console.log(`   Expected: ${scenario.expectation}`);
    console.log('');
  });

  console.log('🔗 Digital Wallet Scenarios:');
  digitalWalletScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name} (${scenario.expectation})`);
  });

  console.log('\n💡 How to test:');
  console.log('1. Go to Subscription Management → Plans');
  console.log('2. Click "Выбрать" on any plan');
  console.log('3. Choose payment method (card or digital wallet)');
  console.log('4. For cards: Use test card numbers above');
  console.log('5. Watch the payment flow and results');
  
  console.log('\n🛠️ Available Test Utils:');
  console.log('- PaymentTestUtils.getTestCards()');
  console.log('- PaymentTestUtils.simulatePaymentFailure()');
  console.log('- PaymentTestUtils.getMockPayment()');
  console.log('- PaymentTestUtils.getTestCardDetails()');
};

// Auto-run demo script in development
if (process.env.NODE_ENV === 'development') {
  // Run after a delay to let the app initialize
  setTimeout(() => {
    if (window.location.pathname.includes('subscription')) {
      runPaymentDemoScript();
    }
  }, 2000);
}