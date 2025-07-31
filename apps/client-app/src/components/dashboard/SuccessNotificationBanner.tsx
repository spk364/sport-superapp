import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';
import { 
  getShownNotifications, 
  markNotificationAsShown, 
  cleanupShownNotifications 
} from '../../utils/notificationUtils';

export const SuccessNotificationBanner: React.FC = () => {
  const { notifications, markNotificationAsRead } = useAppStore();
  const [visibleNotification, setVisibleNotification] = useState<any>(null);

  // Find the latest unread achievement notification
  useEffect(() => {
    console.log('🔔 SuccessNotificationBanner: useEffect triggered');
    
    // Очищаем старые записи при загрузке
    cleanupShownNotifications();
    
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000); // 1 минута назад
    
    const shownNotifications = getShownNotifications();
    console.log('📋 Shown notifications in localStorage:', Array.from(shownNotifications));
    
    const achievementNotifications = notifications.filter(n => n.type === 'achievement');
    console.log('🏆 All achievement notifications:', achievementNotifications.map(n => ({
      id: n.id,
      read: n.read,
      date: n.date,
      title: n.title
    })));
    
    const latestAchievement = notifications
      .filter(n => {
        const isUnread = !n.read;
        const isAchievement = n.type === 'achievement';
        const isRecent = new Date(n.date) > oneMinuteAgo;
        const notShown = !shownNotifications.has(n.id);
        
        console.log(`🔍 Notification ${n.id}:`, {
          isUnread,
          isAchievement,
          isRecent,
          notShown,
          passes: isUnread && isAchievement && isRecent && notShown
        });
        
        return isUnread && isAchievement && isRecent && notShown;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    console.log('✨ Latest achievement to show:', latestAchievement);
    console.log('👁️ Current visible notification:', visibleNotification?.id);

    if (latestAchievement && !visibleNotification) {
      console.log('🚀 Showing notification:', latestAchievement.id);
      setVisibleNotification(latestAchievement);
      
      // Auto hide after 8 seconds and mark as both read and shown
      setTimeout(() => {
        console.log('⏰ Auto-hiding notification:', latestAchievement.id);
        setVisibleNotification(null);
        markNotificationAsRead(latestAchievement.id);
        markNotificationAsShown(latestAchievement.id);
      }, 8000);
    }
  }, [notifications, visibleNotification, markNotificationAsRead]);

  const handleClose = () => {
    if (visibleNotification) {
      console.log('❌ User closed notification:', visibleNotification.id);
      markNotificationAsRead(visibleNotification.id);
      setVisibleNotification(null);
      
      // Сохраняем что это уведомление закрыто пользователем
      markNotificationAsShown(visibleNotification.id);
      console.log('💾 Notification marked as read and shown');
    }
  };

  if (!visibleNotification) {
    return null;
  }

  const isPurchaseSuccess = visibleNotification.title.includes('Покупка') || 
                           visibleNotification.message.includes('активирован');

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-4 text-white animate-slide-down">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {isPurchaseSuccess ? (
              <div className="relative">
                <CreditCardIcon className="h-6 w-6 text-white" />
                <SparklesIcon className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
              </div>
            ) : (
              <CheckCircleIcon className="h-6 w-6 text-white" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {visibleNotification.title}
            </p>
            <p className="text-sm text-green-100 mt-1">
              {visibleNotification.message}
            </p>
            
            {isPurchaseSuccess && (
              <div className="mt-2 flex items-center space-x-2 text-green-100">
                <SparklesIcon className="h-4 w-4" />
                <span className="text-xs">Добро пожаловать в премиум!</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-md transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-white" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-white/20 rounded-full h-1">
          <div 
            className="bg-white h-1 rounded-full animate-progress-bar"
            style={{ 
              animation: 'progress 8s linear forwards',
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Add CSS animations to your global styles
const styles = `
@keyframes slide-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}

.animate-progress-bar {
  animation: progress 8s linear forwards;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}