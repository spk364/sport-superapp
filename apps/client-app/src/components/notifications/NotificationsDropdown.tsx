import React, { useRef, useEffect } from 'react';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';
import { Notification } from '../../types';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  onToggle,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markNotificationAsRead, clearNotifications } = useAppStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'workout_reminder':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'payment_due':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'program_update':
        return <InformationCircleIcon className="h-5 w-5 text-green-500" />;
      case 'achievement':
        return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
      case 'general':
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const notificationDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Сейчас';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    return notificationDate.toLocaleDateString('ru-RU');
  };

  const handleMarkAsRead = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    markNotificationAsRead(notificationId);
  };

  const handleClearAll = () => {
    clearNotifications();
  };

  // Sort notifications: unread first, then by date
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.read !== b.read) {
      return a.read ? 1 : -1; // Unread first
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime(); // Newest first
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={onToggle}
        className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <BellIcon className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} непрочитанных</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Очистить все
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {sortedNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Уведомлений пока нет</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sortedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className={`text-sm mt-1 ${
                              !notification.read ? 'text-gray-700' : 'text-gray-500'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(notification.date)}
                            </p>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                              title="Пометить как прочитанное"
                            >
                              <CheckIcon className="h-4 w-4 text-blue-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {sortedNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  // Mark all as read
                  notifications.forEach(notification => {
                    if (!notification.read) {
                      markNotificationAsRead(notification.id);
                    }
                  });
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
              >
                Отметить все как прочитанные
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};