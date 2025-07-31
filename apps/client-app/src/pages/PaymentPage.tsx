import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Header } from '../components/common/Header';
import { PaymentMethodSelector } from '../components/payment/PaymentMethodSelector';
import { CardPaymentForm } from '../components/payment/CardPaymentForm';
import { PaymentProcessor } from '../components/payment/PaymentProcessor';
import { KaspiPaymentForm } from '../components/payment/KaspiPaymentForm';
import { useAppStore } from '../store';
import { 
  paymentService, 
  PaymentMethod, 
  CardDetails, 
  PaymentResponse 
} from '../services/paymentService';
import { SubscriptionPlan } from '../services/subscriptionService';
import { PaymentTestUtils } from '../utils/paymentTestScenarios';
import { Subscription } from '../types';

interface PaymentPageProps {
  selectedPlan: SubscriptionPlan;
  onPaymentSuccess: (subscription: any) => void;
  onCancel: () => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  selectedPlan,
  onPaymentSuccess,
  onCancel,
}) => {
  const user = useAppStore((state) => state.user);
  const addNotification = useAppStore((state) => state.addNotification);
  const updateSubscription = useAppStore((state) => state.updateSubscription);
  const addSubscriptionHistory = useAppStore((state) => state.addSubscriptionHistory);
  const showSuccessNotification = useAppStore((state) => state.showSuccessNotification);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<'method' | 'details' | 'processing' | 'kaspi'>('method');

  useEffect(() => {
    setPaymentMethods(paymentService.getPaymentMethods());
    
    // Log test scenarios in development
    if (process.env.NODE_ENV === 'development') {
      console.log('💳 Payment Test Cards Available:', PaymentTestUtils.getTestCards());
    }
  }, []);

  const validateCardDetails = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cardDetails.cardNumber.trim()) {
      newErrors.cardNumber = 'Введите номер карты';
    } else if (cardDetails.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Неверный номер карты';
    }

    if (!cardDetails.cardholderName.trim()) {
      newErrors.cardholderName = 'Введите имя держателя карты';
    }

    if (!cardDetails.expiryMonth) {
      newErrors.expiryMonth = 'Введите месяц';
    } else if (parseInt(cardDetails.expiryMonth) < 1 || parseInt(cardDetails.expiryMonth) > 12) {
      newErrors.expiryMonth = 'Неверный месяц';
    }

    if (!cardDetails.expiryYear) {
      newErrors.expiryYear = 'Введите год';
    } else if (cardDetails.expiryYear.length !== 4) {
      newErrors.expiryYear = 'Введите полный год';
    }

    if (!cardDetails.cvv) {
      newErrors.cvv = 'Введите CVV код';
    } else if (cardDetails.cvv.length < 3) {
      newErrors.cvv = 'CVV должен содержать 3-4 цифры';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethodId(methodId);
    setErrors({});
    
    if (methodId === 'card') {
      setCurrentStep('details');
    } else if (methodId === 'kaspi') {
      setCurrentStep('kaspi');
    } else {
      setCurrentStep('processing');
      processPayment(methodId);
    }
  };

  const handleCardPayment = () => {
    if (!validateCardDetails()) {
      return;
    }
    
    setCurrentStep('processing');
    processPayment('card');
  };

  const processPayment = async (methodId: string) => {
    if (!user) {
      addNotification({
        id: `payment_error_${Date.now()}`,
        title: 'Ошибка',
        message: 'Необходимо войти в систему для оплаты',
        type: 'general',
        read: false,
        date: new Date(),
      });
      return;
    }

    setIsProcessing(true);
    setPaymentResponse(null);

    try {
      // Simulate different payment scenarios for testing
      let simulationOptions = undefined;
      
      // Test failure scenarios with specific card numbers
      if (methodId === 'card' && cardDetails.cardNumber.includes('0000 0000 0000 0002')) {
        simulationOptions = {
          shouldFail: true,
          failureReason: 'Карта отклонена банком',
        };
      } else if (methodId === 'card' && cardDetails.cardNumber.includes('0000 0000 0000 0119')) {
        simulationOptions = {
          shouldFail: true,
          failureReason: 'Недостаточно средств на карте',
        };
      }

      const response = await paymentService.processPayment(
        {
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
          paymentMethodId: methodId,
          planId: selectedPlan.id,
          cardDetails: methodId === 'card' ? cardDetails : undefined,
        },
        simulationOptions
      );

      setPaymentResponse(response);
      
      if (response.success && response.status === 'completed') {
        // Create successful subscription
        const newSubscription = {
          id: `sub_${Date.now()}`,
          type: selectedPlan.type,
          name: selectedPlan.name,
          price: selectedPlan.price,
          currency: selectedPlan.currency,
          sessionsIncluded: selectedPlan.sessionsIncluded,
          sessionsUsed: 0,
          startDate: new Date(),
          endDate: new Date(Date.now() + (selectedPlan.duration || 30) * 24 * 60 * 60 * 1000),
          status: 'active' as const,
          autoRenewal: true,
        };

        setTimeout(() => {
          handlePaymentSuccess(newSubscription, methodId, response.paymentId);
        }, 2000);
      }
    } catch (error) {
      setPaymentResponse({
        success: false,
        paymentId: `error_${Date.now()}`,
        status: 'failed',
        error: 'Произошла ошибка при обработке платежа',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setPaymentResponse(null);
    setCurrentStep(selectedMethodId === 'card' ? 'details' : 'method');
  };

  const handlePaymentSuccess = (newSubscription: Subscription, paymentMethod = 'card', transactionId?: string) => {
    console.log('Payment successful, subscription created:', newSubscription);
    
    // Update subscription in store
    updateSubscription(newSubscription);
    
    // Add to history
    addSubscriptionHistory({
      subscriptionId: newSubscription.id,
      type: 'purchase',
      planName: newSubscription.name,
      amount: newSubscription.price,
      currency: newSubscription.currency,
      paymentMethod,
      transactionId,
      date: new Date(),
      status: 'completed',
      description: `Покупка подписки "${newSubscription.name}"`,
    });

    // Show success notification and navigate to home
    showSuccessNotification(
      `Подписка "${newSubscription.name}" успешно активирована!`,
      'purchase'
    );
    
    onPaymentSuccess(newSubscription);
  };

  const handleCancel = () => {
    if (isProcessing) {
      // Prevent canceling during processing
      return;
    }
    onCancel();
  };

  const handleBack = () => {
    if (currentStep === 'details' || currentStep === 'kaspi') {
      setCurrentStep('method');
      setSelectedMethodId(null);
    } else if (currentStep === 'method') {
      onCancel();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Оплата абонемента" />
      
      <div className="px-4 py-6 max-w-md mx-auto pb-24">
        {/* Back Button */}
        {!isProcessing && (
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Назад
          </button>
        )}

        {/* Plan Summary */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ваш заказ
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">План:</span>
              <span className="font-medium">{selectedPlan.name}</span>
            </div>
            
            {selectedPlan.sessionsIncluded && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Тренировки:</span>
                <span className="font-medium">{selectedPlan.sessionsIncluded} занятий</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Период:</span>
              <span className="font-medium">
                {selectedPlan.duration === 30 && '1 месяц'}
                {selectedPlan.duration === 90 && '3 месяца'}
                {selectedPlan.duration === 365 && '1 год'}
                {!selectedPlan.duration && '1 месяц'}
              </span>
            </div>
            
            <hr className="my-3" />
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>К оплате:</span>
              <span className="text-blue-600">
                {selectedPlan.price.toLocaleString()} {selectedPlan.currency}
              </span>
            </div>
          </div>
          
          {/* Features */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Включено:</h3>
            <ul className="space-y-1">
              {selectedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Steps */}
        {currentStep === 'method' && (
          <PaymentMethodSelector
            paymentMethods={paymentMethods}
            selectedMethodId={selectedMethodId}
            onSelectMethod={handleMethodSelect}
            disabled={isProcessing}
          />
        )}

        {currentStep === 'details' && selectedMethodId === 'card' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <CardPaymentForm
              cardDetails={cardDetails}
              onCardDetailsChange={setCardDetails}
              errors={errors}
              disabled={isProcessing}
            />
            
            <button
              onClick={handleCardPayment}
              disabled={isProcessing}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Оплатить {selectedPlan.price.toLocaleString()} {selectedPlan.currency}
            </button>
          </div>
        )}

        {currentStep === 'kaspi' && (
          <KaspiPaymentForm
            amount={selectedPlan.price}
            currency={selectedPlan.currency}
            planName={selectedPlan.name}
            onSuccess={(kaspiResponse) => {
              // Создаем подписку после успешной оплаты через Kaspi
              const newSubscription = {
                id: `sub_${Date.now()}`,
                type: selectedPlan.type,
                name: selectedPlan.name,
                price: selectedPlan.price,
                currency: selectedPlan.currency,
                sessionsIncluded: selectedPlan.sessionsIncluded,
                sessionsUsed: 0,
                startDate: new Date(),
                endDate: new Date(Date.now() + (selectedPlan.duration || 30) * 24 * 60 * 60 * 1000),
                status: 'active' as const,
                autoRenewal: true,
              };
              
              setTimeout(() => {
                handlePaymentSuccess(newSubscription, 'kaspi', kaspiResponse.transactionId);
              }, 1500);
            }}
            onError={(error) => {
              setPaymentResponse({
                success: false,
                paymentId: `kaspi_error_${Date.now()}`,
                status: 'failed',
                error: error,
              });
            }}
            onCancel={handleCancel}
          />
        )}

        {/* Security Info */}
        {!isProcessing && !paymentResponse && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900">
                  Безопасная оплата
                </h3>
                <p className="text-sm text-blue-800 mt-1">
                  Ваши данные защищены SSL-шифрованием. Мы не храним информацию о картах.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Processor Modal */}
      <PaymentProcessor
        isProcessing={isProcessing}
        paymentResponse={paymentResponse}
        onRetry={handleRetry}
        onCancel={handleCancel}
      />
    </div>
  );
};