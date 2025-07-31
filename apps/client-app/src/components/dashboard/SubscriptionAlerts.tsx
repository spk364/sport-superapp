import React from 'react';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  ClockIcon,
  CreditCardIcon,
  CheckCircleIcon,
  BellIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Subscription } from '../../types';
import { useAppStore } from '../../store';

interface SubscriptionAlertsProps {
  subscription: Subscription | null;
  onRenewSubscription?: () => void;
  onManageSubscription?: () => void;
  onDismissAlert?: (alertType: string) => void;
}

export const SubscriptionAlerts: React.FC<SubscriptionAlertsProps> = ({
  subscription,
  onRenewSubscription,
  onManageSubscription,
  onDismissAlert,
}) => {
  const { dismissedAlerts, dismissAlert: storeDismissAlert } = useAppStore();

  const dismissAlert = (alertType: string) => {
    console.log('🚫 Dismissing alert using store:', alertType);
    storeDismissAlert(alertType);
    onDismissAlert?.(alertType);
  };

  if (!subscription || subscription.status === 'cancelled') {
    const isCancelled = subscription?.status === 'cancelled';
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <BellIcon className="h-6 w-6 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              {isCancelled ? 'Оформите новый абонемент' : 'Активируйте абонемент'}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {isCancelled 
                ? 'Ваш абонемент был отменен. Выберите новый план для продолжения тренировок с персональным тренером.'
                : 'Оформите абонемент для получения полного доступа к тренировкам и персональному тренеру.'
              }
            </p>
            <button
              onClick={onManageSubscription}
              className="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium text-blue-800 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              {isCancelled ? 'Выбрать новый план' : 'Выбрать план'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const alerts = [];
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Subscription expired
  if (subscription.status === 'expired' && !dismissedAlerts.has('expired')) {
    alerts.push({
      id: 'expired',
      type: 'error',
      icon: ExclamationTriangleIcon,
      title: 'Абонемент истёк',
      message: `Ваш абонемент истёк ${endDate.toLocaleDateString('ru-RU')}. Продлите для продолжения тренировок.`,
      actions: [
        {
          label: 'Продлить абонемент',
          onClick: onRenewSubscription,
          primary: true,
        },
      ],
    });
  }

  // Subscription expiring soon (within 7 days)
  if (
    subscription.status === 'active' &&
    daysUntilExpiry <= 7 &&
    daysUntilExpiry > 0 &&
    !dismissedAlerts.has('expiring_soon')
  ) {
    alerts.push({
      id: 'expiring_soon',
      type: 'warning',
      icon: ClockIcon,
      title: 'Скоро истекает абонемент',
      message: `Ваш абонемент истекает через ${daysUntilExpiry} ${getDayWord(daysUntilExpiry)} (${endDate.toLocaleDateString('ru-RU')}).`,
      actions: [
        {
          label: 'Продлить сейчас',
          onClick: onRenewSubscription,
          primary: true,
        },
        {
          label: 'Настроить автопродление',
          onClick: onManageSubscription,
          primary: false,
        },
      ],
    });
  }

  // Sessions running low
  if (
    subscription.sessionsIncluded &&
    subscription.sessionsUsed !== undefined &&
    subscription.status === 'active'
  ) {
    const remainingSessions = subscription.sessionsIncluded - subscription.sessionsUsed;
    const sessionUsagePercent = (subscription.sessionsUsed / subscription.sessionsIncluded) * 100;

    if (sessionUsagePercent >= 80 && remainingSessions > 0 && !dismissedAlerts.has('sessions_low')) {
      alerts.push({
        id: 'sessions_low',
        type: 'warning',
        icon: ExclamationTriangleIcon,
        title: 'Заканчиваются занятия',
        message: `Осталось ${remainingSessions} из ${subscription.sessionsIncluded} занятий. Рассмотрите возможность покупки дополнительных занятий.`,
        actions: [
          {
            label: 'Купить занятия',
            onClick: onManageSubscription,
            primary: true,
          },
        ],
      });
    }

    if (remainingSessions === 0 && !dismissedAlerts.has('sessions_depleted')) {
      alerts.push({
        id: 'sessions_depleted',
        type: 'error',
        icon: ExclamationTriangleIcon,
        title: 'Занятия закончились',
        message: 'Все включённые занятия использованы. Купите дополнительные занятия или новый пакет.',
        actions: [
          {
            label: 'Купить занятия',
            onClick: onManageSubscription,
            primary: true,
          },
        ],
      });
    }
  }

  // Payment failed
  if (subscription.status === 'pending' && !dismissedAlerts.has('payment_failed')) {
    alerts.push({
      id: 'payment_failed',
      type: 'error',
      icon: CreditCardIcon,
      title: 'Ошибка оплаты',
      message: 'Не удалось провести оплату абонемента. Проверьте способ оплаты.',
      actions: [
        {
          label: 'Повторить оплату',
          onClick: onManageSubscription,
          primary: true,
        },
      ],
    });
  }

  // Auto-renewal disabled warning (for active subscriptions expiring in 3 days)
  if (
    subscription.status === 'active' &&
    !subscription.autoRenewal &&
    daysUntilExpiry <= 3 &&
    daysUntilExpiry > 0 &&
    !dismissedAlerts.has('auto_renewal_disabled')
  ) {
    alerts.push({
      id: 'auto_renewal_disabled',
      type: 'info',
      icon: ArrowPathIcon,
      title: 'Автопродление отключено',
      message: 'Включите автопродление, чтобы не прерывать тренировки.',
      actions: [
        {
          label: 'Включить автопродление',
          onClick: onManageSubscription,
          primary: false,
        },
      ],
    });
  }

  // Subscription renewed successfully - show only for 10 minutes after activation
  if (subscription.status === 'active' && daysUntilExpiry > 25 && !dismissedAlerts.has('renewed_success')) {
    const tenMinutesAfterStart = new Date(subscription.startDate).getTime() + (10 * 60 * 1000); // 10 minutes after start
    const isVeryNewSubscription = now.getTime() < tenMinutesAfterStart;
    
    console.log('🔍 Subscription activation check:', {
      subscriptionStatus: subscription.status,
      daysUntilExpiry,
      startDate: subscription.startDate,
      tenMinutesAfterStart: new Date(tenMinutesAfterStart).toISOString(),
      currentTime: now.toISOString(),
      isVeryNewSubscription,
      dismissedAlerts: Array.from(dismissedAlerts),
      hasDismissed: dismissedAlerts.has('renewed_success')
    });
    
    if (isVeryNewSubscription) {
      alerts.push({
        id: 'renewed_success',
        type: 'success',
        icon: CheckCircleIcon,
        title: 'Абонемент активирован',
        message: `Ваш ${subscription.name} успешно активирован до ${endDate.toLocaleDateString('ru-RU')}.`,
        actions: [
          {
            label: 'Скрыть',
            onClick: () => {
              console.log('🚫 Hiding subscription activation notification');
              dismissAlert('renewed_success');
              
              // Emergency force hide
              setTimeout(() => {
                window.location.reload();
              }, 200);
            },
            primary: false,
          },
          {
            label: '❌ Удалить навсегда',
            onClick: () => {
              console.log('🚨 EMERGENCY DELETE notification');
              // Multiple methods to ensure it's gone
              dismissAlert('renewed_success');
              
              // Force update store
              const storeData = JSON.parse(localStorage.getItem('app-store') || '{}');
              if (!storeData.state) storeData.state = {};
              storeData.state.dismissedAlerts = ['renewed_success'];
              
              // Also modify subscription date to be older
              if (storeData.state.subscription) {
                const oldDate = new Date();
                oldDate.setHours(oldDate.getHours() - 24); // 24 hours ago
                storeData.state.subscription.startDate = oldDate.toISOString();
              }
              
              localStorage.setItem('app-store', JSON.stringify(storeData));
              console.log('💥 EMERGENCY DELETE completed');
              window.location.reload();
            },
            primary: false,
          },
        ],
      });
    }
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 ${getAlertStyles(alert.type)}`}
        >
          <div className="flex items-start space-x-3">
            <alert.icon className={`h-6 w-6 mt-0.5 ${getIconStyles(alert.type)}`} />
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${getTitleStyles(alert.type)}`}>
                {alert.title}
              </h3>
              <p className={`text-sm mt-1 ${getMessageStyles(alert.type)}`}>
                {alert.message}
              </p>
              {alert.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {alert.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        action.primary
                          ? getButtonStyles(alert.type)
                          : getSecondaryButtonStyles(alert.type)
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className={`p-1 rounded-full transition-colors ${getDismissButtonStyles(alert.type)}`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

function getDayWord(days: number): string {
  if (days === 1) return 'день';
  if (days >= 2 && days <= 4) return 'дня';
  return 'дней';
}

function getAlertStyles(type: string): string {
  switch (type) {
    case 'error':
      return 'bg-red-50 border-red-200';
    case 'warning':
      return 'bg-orange-50 border-orange-200';
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'info':
      return 'bg-blue-50 border-blue-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
}

function getIconStyles(type: string): string {
  switch (type) {
    case 'error':
      return 'text-red-600';
    case 'warning':
      return 'text-orange-600';
    case 'success':
      return 'text-green-600';
    case 'info':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}

function getTitleStyles(type: string): string {
  switch (type) {
    case 'error':
      return 'text-red-800';
    case 'warning':
      return 'text-orange-800';
    case 'success':
      return 'text-green-800';
    case 'info':
      return 'text-blue-800';
    default:
      return 'text-gray-800';
  }
}

function getMessageStyles(type: string): string {
  switch (type) {
    case 'error':
      return 'text-red-700';
    case 'warning':
      return 'text-orange-700';
    case 'success':
      return 'text-green-700';
    case 'info':
      return 'text-blue-700';
    default:
      return 'text-gray-700';
  }
}

function getButtonStyles(type: string): string {
  switch (type) {
    case 'error':
      return 'text-red-800 bg-red-100 hover:bg-red-200';
    case 'warning':
      return 'text-orange-800 bg-orange-100 hover:bg-orange-200';
    case 'success':
      return 'text-green-800 bg-green-100 hover:bg-green-200';
    case 'info':
      return 'text-blue-800 bg-blue-100 hover:bg-blue-200';
    default:
      return 'text-gray-800 bg-gray-100 hover:bg-gray-200';
  }
}

function getSecondaryButtonStyles(type: string): string {
  switch (type) {
    case 'error':
      return 'text-red-700 border border-red-300 hover:bg-red-50';
    case 'warning':
      return 'text-orange-700 border border-orange-300 hover:bg-orange-50';
    case 'success':
      return 'text-green-700 border border-green-300 hover:bg-green-50';
    case 'info':
      return 'text-blue-700 border border-blue-300 hover:bg-blue-50';
    default:
      return 'text-gray-700 border border-gray-300 hover:bg-gray-50';
  }
}

function getDismissButtonStyles(type: string): string {
  switch (type) {
    case 'error':
      return 'hover:bg-red-100 text-red-600';
    case 'warning':
      return 'hover:bg-orange-100 text-orange-600';
    case 'success':
      return 'hover:bg-green-100 text-green-600';
    case 'info':
      return 'hover:bg-blue-100 text-blue-600';
    default:
      return 'hover:bg-gray-100 text-gray-600';
  }
}