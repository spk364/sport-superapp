import React, { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  StarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { Header } from '../components/common/Header';
import { PaymentPage } from './PaymentPage';
import { PaymentHistory } from '../components/payment/PaymentHistory';
import { useAppStore } from '../store';
import { SubscriptionPlan } from '../services/subscriptionService';

export const SubscriptionManagement: React.FC = () => {
  const user = useAppStore((state) => state.user);
  const subscription = useAppStore((state) => state.subscription);
  const subscriptionPlans = useAppStore((state) => state.subscriptionPlans);
  const subscriptionHistory = useAppStore((state) => state.subscriptionHistory);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const fetchSubscriptionPlans = useAppStore((state) => state.fetchSubscriptionPlans);
  const renewSubscription = useAppStore((state) => state.renewSubscription);
  const updateSubscriptionSettings = useAppStore((state) => state.updateSubscriptionSettings);
  const cancelSubscription = useAppStore((state) => state.cancelSubscription);
  
  const [activeTab, setActiveTab] = useState<'current' | 'plans' | 'history'>('current');
  const [autoRenewalEnabled, setAutoRenewalEnabled] = useState(subscription?.autoRenewal ?? false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    if (subscriptionPlans.length === 0) {
      fetchSubscriptionPlans();
    }
  }, [subscriptionPlans.length, fetchSubscriptionPlans]);

  useEffect(() => {
    if (subscription) {
      setAutoRenewalEnabled(subscription.autoRenewal);
    }
  }, [subscription]);

  const handleAutoRenewalToggle = async () => {
    if (!subscription) return;
    
    const newValue = !autoRenewalEnabled;
    setAutoRenewalEnabled(newValue);
    
    try {
      await updateSubscriptionSettings(subscription.id, { autoRenewal: newValue });
    } catch (error) {
      // Revert on error
      setAutoRenewalEnabled(!newValue);
    }
  };

  const handleRenewSubscription = async (planId?: string) => {
    try {
      if (subscription) {
        // Existing subscription - renew or switch plan
        await renewSubscription(subscription.id, planId);
      } else {
        // No subscription - create new one
        await handleCreateSubscription(planId);
      }
    } catch (error) {
      console.error('Failed to process subscription:', error);
    }
  };

  const handleCreateSubscription = async (planId?: string) => {
    if (!planId) {
      console.error('Plan ID is required for creating subscription');
      return;
    }

    const selectedPlan = subscriptionPlans.find(plan => plan.id === planId);
    if (!selectedPlan) {
      console.error('Selected plan not found');
      return;
    }

    // Show payment page for new subscription
    setSelectedPlanForPayment(selectedPlan);
    setShowPaymentPage(true);
  };

  const handlePaymentSuccess = (newSubscription: any) => {
    // Update the store with the new subscription
    const { setSubscription, addNotification } = useAppStore.getState();
    setSubscription(newSubscription);

    // Add success notification
    addNotification({
      id: `new_subscription_${Date.now()}`,
      title: 'Абонемент активирован',
      message: `Ваш ${newSubscription.name} успешно активирован!`,
      type: 'achievement',
      read: false,
      date: new Date(),
    });

    // Close payment page and switch to current plan tab
    setShowPaymentPage(false);
    setSelectedPlanForPayment(null);
    setActiveTab('current');
  };

  const handlePaymentCancel = () => {
    setShowPaymentPage(false);
    setSelectedPlanForPayment(null);
  };

  const handleCancelSubscription = async () => {
    console.log('🚫 handleCancelSubscription called');
    if (!subscription) {
      console.log('❌ No subscription found');
      return;
    }
    
    console.log('📋 Subscription to cancel:', subscription);
    console.log('📝 Cancel reason:', cancelReason);
    
    try {
      console.log('⏳ Calling cancelSubscription action...');
      await cancelSubscription(subscription.id, cancelReason);
      console.log('✅ cancelSubscription completed');
      setShowCancelDialog(false);
      setCancelReason('');
      console.log('🔄 Dialog closed and reason cleared');
    } catch (error) {
      console.error('❌ Failed to cancel subscription:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'expired':
        return 'Истёк';
      case 'cancelled':
        return 'Отменён';
      case 'pending':
        return 'Ожидает оплаты';
      default:
        return status;
    }
  };

  const renderCurrentSubscription = () => {
    if (!subscription || subscription.status === 'cancelled') {
      const isCancelled = subscription?.status === 'cancelled';
      return (
        <div className="text-center py-12">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {isCancelled ? 'Абонемент отменен' : 'Нет активного абонемента'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {isCancelled 
              ? 'Ваш абонемент был отменен. Выберите новый план для продолжения тренировок'
              : 'Выберите подходящий план для начала тренировок'
            }
          </p>
          <button
            onClick={() => setActiveTab('plans')}
            className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            {isCancelled ? 'Выбрать новый план' : 'Выбрать план'}
          </button>
        </div>
      );
    }

    const daysUntilExpiry = Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const sessionsRemaining = subscription.sessionsIncluded && subscription.sessionsUsed !== undefined
      ? subscription.sessionsIncluded - subscription.sessionsUsed
      : null;

    return (
      <div className="space-y-6">
        {/* Subscription Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{subscription.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {subscription.price.toLocaleString()} {subscription.currency}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
              {getStatusText(subscription.status)}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Действует до</p>
                <p className="text-sm text-gray-600">
                  {new Date(subscription.endDate).toLocaleDateString('ru-RU')}
                </p>
                {daysUntilExpiry > 0 && (
                  <p className="text-xs text-gray-500">
                    Осталось {daysUntilExpiry} дней
                  </p>
                )}
              </div>
            </div>

            {sessionsRemaining !== null && (
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Осталось занятий</p>
                  <p className="text-sm text-gray-600">
                    {sessionsRemaining} из {subscription.sessionsIncluded}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auto-renewal Settings */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Настройки абонемента</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ArrowPathIcon className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Автопродление</p>
                <p className="text-sm text-gray-500">
                  Автоматически продлевать абонемент при истечении
                </p>
              </div>
            </div>
            <button
              onClick={handleAutoRenewalToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                autoRenewalEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              disabled={isLoading}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoRenewalEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          {subscription.status === 'active' && daysUntilExpiry <= 30 && (
            <button
              onClick={() => handleRenewSubscription()}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Продлить абонемент
            </button>
          )}
          
          {subscription.status === 'expired' && (
            <button
              onClick={() => handleRenewSubscription()}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Возобновить абонемент
            </button>
          )}
          
          {subscription.status === 'active' && (
            <button
              onClick={() => {
                console.log('🔴 Cancel subscription button clicked');
                setShowCancelDialog(true);
              }}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              <XCircleIcon className="h-5 w-5 mr-2" />
              Отменить абонемент
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSubscriptionPlans = () => {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Выберите план</h3>
          <p className="text-sm text-gray-500 mt-1">
            Выберите подходящий план для ваших тренировок
          </p>
        </div>

        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${
              plan.isPopular ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  <StarIcon className="h-3 w-3 mr-1" />
                  Популярный
                </span>
              </div>
            )}

            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {plan.price.toLocaleString()} {plan.currency}
                </p>
                {plan.sessionsIncluded && (
                  <p className="text-sm text-gray-600 mt-1">
                    {plan.sessionsIncluded} занятий
                  </p>
                )}
              </div>
              
              <button
                onClick={() => {
                  console.log('Button clicked for plan:', plan.id);
                  console.log('Current subscription status:', subscription?.status);
                  if (subscription && subscription.status !== 'cancelled') {
                    // Active subscription - direct renewal/switch
                    handleRenewSubscription(plan.id);
                  } else {
                    // No subscription or cancelled subscription - go to payment page
                    setSelectedPlanForPayment(plan);
                    setShowPaymentPage(true);
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  plan.isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Загрузка...' : (subscription && subscription.status !== 'cancelled' ? 'Переключиться' : 'Выбрать')}
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  // Show payment page if selected
  if (showPaymentPage && selectedPlanForPayment) {
    return (
      <PaymentPage
        selectedPlan={selectedPlanForPayment}
        onPaymentSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Управление абонементом" />
      
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex space-x-8">
          {[
            { id: 'current', label: 'Текущий план', icon: CreditCardIcon },
            { id: 'plans', label: 'Планы', icon: StarIcon },
            { id: 'history', label: 'История', icon: ClockIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-6 max-w-md mx-auto pb-24">
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-500 mt-2">Загрузка...</p>
          </div>
        )}
        
        {!isLoading && (
          <>
            {activeTab === 'current' && renderCurrentSubscription()}
            {activeTab === 'plans' && renderSubscriptionPlans()}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <PaymentHistory userId={user?.id || 'demo_user'} />
                
                {/* Recent Subscription History */}
                {subscriptionHistory.length > 0 && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Последние операции
                    </h3>
                    <div className="space-y-3">
                      {subscriptionHistory.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.date).toLocaleDateString('ru-RU')} • {item.paymentMethod}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {item.amount.toLocaleString()} {item.currency}
                            </p>
                            <p className={`text-xs ${
                              item.status === 'completed' ? 'text-green-600' : 
                              item.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {item.status === 'completed' ? 'Выполнено' : 
                               item.status === 'failed' ? 'Ошибка' : 'В процессе'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Cancel Subscription Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Отменить абонемент
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Вы уверены, что хотите отменить абонемент? Это действие нельзя отменить.
            </p>
            
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Причина отмены (необязательно)"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none"
              rows={3}
            />
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  console.log('✅ Confirm cancellation button clicked');
                  handleCancelSubscription();
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={isLoading}
              >
                Отменить абонемент
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};