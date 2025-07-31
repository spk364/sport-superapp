import React from 'react';
import { useAppStore } from '../../store';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Виджет для тестирования персистентности данных
 * Показывается только в режиме разработки
 */
export const PersistenceTestWidget: React.FC = () => {
  const { subscription, subscriptionHistory, user, addTestNotifications, clearNotifications, notifications, unreadCount } = useAppStore();

  // Показывать только в dev режиме
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const hasSubscription = !!subscription;
  const hasHistory = subscriptionHistory.length > 0;
  const hasUser = !!user;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-2 mb-3">
        <InformationCircleIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          🧪 Тест персистентности (dev only)
        </h3>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center space-x-2">
          {hasUser ? (
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
          )}
          <span className={hasUser ? 'text-green-700' : 'text-yellow-700'}>
            Пользователь: {hasUser ? '✓ Сохранен' : '⚠ Не найден'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasSubscription ? (
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
          )}
          <span className={hasSubscription ? 'text-green-700' : 'text-yellow-700'}>
            Подписка: {hasSubscription ? '✓ Сохранена' : '⚠ Не найдена'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasHistory ? (
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
          )}
          <span className={hasHistory ? 'text-green-700' : 'text-yellow-700'}>
            История: {hasHistory ? `✓ ${subscriptionHistory.length} записей` : '⚠ Пуста'}
          </span>
        </div>

        {hasSubscription && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
            <p><strong>Подписка:</strong> {subscription.name}</p>
            <p><strong>Статус:</strong> {subscription.status}</p>
            <p><strong>До:</strong> {new Date(subscription.endDate).toLocaleDateString('ru-RU')}</p>
          </div>
        )}

        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
          <p className="text-blue-800">
            💡 <strong>Тест:</strong> Обновите страницу (F5) и проверьте что данные остались
          </p>
        </div>

        <div className="mt-2 p-2 bg-green-50 rounded text-xs">
          <p className="text-green-800">
            ✅ <strong>Исправлено V3:</strong> DismissedAlerts теперь сохраняются в localStorage
          </p>
          <p className="text-green-700 mt-1">
            • Achievement уведомления показываются только 1 минуту<br/>
            • SubscriptionAlerts показываются только 1 час<br/>
            • Закрытые уведомления не повторяются даже после F5<br/>
            • DismissedAlerts сохраняются между сессиями<br/>
            • Set типы корректно сериализуются в localStorage
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <button 
              onClick={() => {
                localStorage.removeItem('shown-notifications');
                window.location.reload();
              }}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              🧪 Сбросить тест уведомлений
            </button>
            
            <button 
              onClick={() => {
                console.log('🔧 Исправляем зависшие уведомления...');
                const storeData = JSON.parse(localStorage.getItem('app-store') || '{}');
                
                let fixed = 0;
                
                // Помечаем achievement уведомления как прочитанные
                if (storeData.state?.notifications) {
                  storeData.state.notifications.forEach((notification: any) => {
                    if (notification.type === 'achievement' && !notification.read) {
                      notification.read = true;
                      fixed++;
                      console.log(`✅ Achievement помечено как прочитанное: ${notification.title}`);
                    }
                  });
                  
                  localStorage.setItem('app-store', JSON.stringify(storeData));
                  
                  const achievementIds = storeData.state.notifications
                    .filter((n: any) => n.type === 'achievement')
                    .map((n: any) => n.id);
                  
                  localStorage.setItem('shown-notifications', JSON.stringify(achievementIds));
                }
                
                // Добавляем dismissed alert для SubscriptionAlerts (исправляем Set issue)
                if (storeData.state?.dismissedAlerts) {
                  // Обрабатываем как Set или Array
                  let currentDismissed = storeData.state.dismissedAlerts;
                  if (Array.isArray(currentDismissed)) {
                    if (!currentDismissed.includes('renewed_success')) {
                      currentDismissed.push('renewed_success');
                      fixed++;
                      console.log('✅ SubscriptionAlert "renewed_success" добавлен в Array');
                    }
                  } else {
                    // Если это Set, конвертируем в Array
                    const dismissedArray = Array.from(currentDismissed || []);
                    if (!dismissedArray.includes('renewed_success')) {
                      dismissedArray.push('renewed_success');
                      storeData.state.dismissedAlerts = dismissedArray;
                      fixed++;
                      console.log('✅ SubscriptionAlert "renewed_success" добавлен (конвертирован из Set)');
                    }
                  }
                } else {
                  storeData.state.dismissedAlerts = ['renewed_success'];
                  fixed++;
                  console.log('✅ Создан dismissedAlerts с "renewed_success"');
                }
                
                localStorage.setItem('app-store', JSON.stringify(storeData));
                
                console.log(`🎉 Исправлено ${fixed} уведомлений`);
                window.location.reload();
              }}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              🔧 Скрыть все уведомления
            </button>
            
            <button 
              onClick={() => {
                console.log('🚨 NUCLEAR OPTION: Force hiding notification');
                // Completely force hide the notification by modifying subscription date
                const storeData = JSON.parse(localStorage.getItem('app-store') || '{}');
                
                if (storeData.state?.subscription) {
                  // Set start date to more than 10 minutes ago
                  const oldDate = new Date();
                  oldDate.setHours(oldDate.getHours() - 2); // 2 hours ago
                  storeData.state.subscription.startDate = oldDate.toISOString();
                  console.log('✅ Subscription start date set to 2 hours ago');
                }
                
                // Also ensure dismissedAlerts includes renewed_success
                if (!storeData.state) storeData.state = {};
                storeData.state.dismissedAlerts = ['renewed_success'];
                
                localStorage.setItem('app-store', JSON.stringify(storeData));
                console.log('🎉 NUCLEAR OPTION applied!');
                window.location.reload();
              }}
              className="px-2 py-1 bg-red-800 text-white text-xs rounded hover:bg-red-900"
            >
              ☢️ ЯДЕРНАЯ ОПЦИЯ
            </button>
          </div>
        </div>

        {/* Notifications Test Section */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
          <h3 className="text-purple-800 font-semibold text-sm flex items-center">
            <InformationCircleIcon className="h-4 w-4 mr-1" />
            🔔 Тест уведомлений
          </h3>
          <p className="text-purple-700 text-xs mt-1">
            Активных уведомлений: {notifications.length} | Непрочитанных: {unreadCount}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <button 
              onClick={() => {
                addTestNotifications();
                console.log('✅ Добавлены тестовые уведомления');
              }}
              className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
            >
              ➕ Добавить тестовые
            </button>
            
            <button 
              onClick={() => {
                clearNotifications();
                console.log('🗑️ Все уведомления очищены');
              }}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              🗑️ Очистить все
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};