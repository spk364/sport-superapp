import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';
import { NotificationsDropdown } from '../notifications/NotificationsDropdown';

interface HeaderProps {
  title: string;
  showNotifications?: boolean;
  showChat?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showNotifications = true,
  showChat = true,
}) => {
  const user = useAppStore((state) => state.user);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 safe-area-pt">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.firstName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-sm">
                {user?.firstName?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {user && (
              <p className="text-sm text-gray-500">
                Привет, {user.firstName}! 👋
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showChat && (
            <button
              onClick={() => setCurrentPage('chat')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-600" />
            </button>
          )}
          
          {showNotifications && (
            <NotificationsDropdown
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              onToggle={() => setNotificationsOpen(!notificationsOpen)}
            />
          )}
        </div>
      </div>
    </div>
  );
}; 