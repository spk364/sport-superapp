import React, { useEffect, useState } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Subscription, Notification } from '../../types';
import { useAppStore } from '../../store';

interface SubscriptionNotificationsProps {
  subscription: Subscription | null;
}

export const SubscriptionNotifications: React.FC<SubscriptionNotificationsProps> = ({
  subscription,
}) => {
  const notifications = useAppStore((state) => state.notifications);
  const addNotification = useAppStore((state) => state.addNotification);
  const markNotificationAsRead = useAppStore((state) => state.markNotificationAsRead);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check for subscription-related notifications
  useEffect(() => {
    if (!subscription) return;

    const now = new Date();
    const timeSinceLastCheck = lastChecked ? now.getTime() - lastChecked.getTime() : 0;
    
    // Only check every 10 minutes to avoid spam
    if (timeSinceLastCheck < 10 * 60 * 1000) return;

    setLastChecked(now);

    const endDate = new Date(subscription.endDate);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Check for expiring subscription (7 days before)
    if (subscription.status === 'active' && daysUntilExpiry === 7) {
      const existingNotification = notifications.find(
        n => n.title.includes('истекает через 7 дней') && !n.read
      );

      if (!existingNotification) {
        addNotification({
          id: `expiry_7days_${now.getTime()}`,
          title: 'Абонемент истекает через 7 дней',
          message: `Ваш ${subscription.name} истекает ${endDate.toLocaleDateString('ru-RU')}. Не забудьте продлить!`,
          type: 'payment_due',
          read: false,
          date: now,
        });
      }
    }

    // Check for expiring subscription (3 days before)
    if (subscription.status === 'active' && daysUntilExpiry === 3) {
      const existingNotification = notifications.find(
        n => n.title.includes('истекает через 3 дня') && !n.read
      );

      if (!existingNotification) {
        addNotification({
          id: `expiry_3days_${now.getTime()}`,
          title: 'Абонемент истекает через 3 дня',
          message: `Срочно продлите ваш ${subscription.name}, который истекает ${endDate.toLocaleDateString('ru-RU')}!`,
          type: 'payment_due',
          read: false,
          date: now,
        });
      }
    }

    // Check for expired subscription
    if (subscription.status === 'expired') {
      const existingNotification = notifications.find(
        n => n.title.includes('Абонемент истёк') && !n.read
      );

      if (!existingNotification) {
        addNotification({
          id: `expired_${now.getTime()}`,
          title: 'Абонемент истёк',
          message: `Ваш ${subscription.name} истёк ${endDate.toLocaleDateString('ru-RU')}. Продлите для продолжения тренировок.`,
          type: 'payment_due',
          read: false,
          date: now,
        });
      }
    }

    // Check for low sessions
    if (
      subscription.sessionsIncluded &&
      subscription.sessionsUsed !== undefined &&
      subscription.status === 'active'
    ) {
      const remainingSessions = subscription.sessionsIncluded - subscription.sessionsUsed;
      const sessionUsagePercent = (subscription.sessionsUsed / subscription.sessionsIncluded) * 100;

      if (remainingSessions === 2 && sessionUsagePercent >= 75) {
        const existingNotification = notifications.find(
          n => n.title.includes('Осталось 2 занятия') && !n.read
        );

        if (!existingNotification) {
          addNotification({
            id: `sessions_low_${now.getTime()}`,
            title: 'Осталось 2 занятия',
            message: `У вас осталось всего 2 занятия из ${subscription.sessionsIncluded}. Рекомендуем приобрести дополнительные занятия.`,
            type: 'payment_due',
            read: false,
            date: now,
          });
        }
      }

      if (remainingSessions === 0) {
        const existingNotification = notifications.find(
          n => n.title.includes('Занятия закончились') && !n.read
        );

        if (!existingNotification) {
          addNotification({
            id: `sessions_depleted_${now.getTime()}`,
            title: 'Занятия закончились',
            message: 'Все включённые занятия использованы. Купите дополнительные занятия или новый пакет.',
            type: 'payment_due',
            read: false,
            date: now,
          });
        }
      }
    }

    // Check for auto-renewal disabled
    if (
      subscription.status === 'active' &&
      !subscription.autoRenewal &&
      daysUntilExpiry <= 5 &&
      daysUntilExpiry > 0
    ) {
      const existingNotification = notifications.find(
        n => n.title.includes('Автопродление отключено') && !n.read
      );

      if (!existingNotification) {
        addNotification({
          id: `auto_renewal_disabled_${now.getTime()}`,
          title: 'Автопродление отключено',
          message: 'Включите автопродление, чтобы не прерывать тренировки после истечения абонемента.',
          type: 'general',
          read: false,
          date: now,
        });
      }
    }
  }, [subscription, notifications, addNotification, lastChecked]);

  const subscriptionNotifications = notifications.filter(
    n => 
      n.title.toLowerCase().includes('абонемент') ||
      n.title.toLowerCase().includes('занятия') ||
      n.title.toLowerCase().includes('автопродление') ||
      n.title.toLowerCase().includes('истек')
  );

  if (subscriptionNotifications.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <BellIcon className="h-5 w-5 mr-2 text-blue-600" />
          Уведомления об абонементе
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {subscriptionNotifications.slice(0, 5).map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markNotificationAsRead}
          />
        ))}
      </div>
      
      {subscriptionNotifications.length > 5 && (
        <div className="px-4 py-3 border-t border-gray-200 text-center">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
            Показать все уведомления ({subscriptionNotifications.length})
          </button>
        </div>
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'payment_due':
        return ExclamationTriangleIcon;
      case 'achievement':
        return CheckCircleIcon;
      case 'workout_reminder':
        return ClockIcon;
      case 'program_update':
        return BellIcon;
      default:
        return BellIcon;
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'payment_due':
        return 'text-red-600';
      case 'achievement':
        return 'text-green-600';
      case 'workout_reminder':
        return 'text-orange-600';
      case 'program_update':
        return 'text-blue-600';
      default:
        return 'text-blue-600';
    }
  };

  const Icon = getIcon();

  return (
    <div className={`px-4 py-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-6 w-6 mt-0.5 ${getIconColor()}`} />
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
            {notification.title}
          </h3>
          <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {notification.date.toLocaleString('ru-RU')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              title="Отметить как прочитанное"
            >
              <CheckCircleIcon className="h-5 w-5 text-gray-400 hover:text-green-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};