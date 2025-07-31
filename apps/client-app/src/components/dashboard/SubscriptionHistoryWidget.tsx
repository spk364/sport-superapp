import React, { useState } from 'react';
import {
  ClockIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';

export const SubscriptionHistoryWidget: React.FC = () => {
  const { subscriptionHistory } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show only recent 3 items by default
  const displayedHistory = isExpanded 
    ? subscriptionHistory 
    : subscriptionHistory.slice(0, 3);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return '🛍️';
      case 'renewal':
        return '🔄';
      case 'cancellation':
        return '❌';
      case 'modification':
        return '✏️';
      default:
        return '📋';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getPaymentMethodDisplay = (method: string) => {
    const methods: Record<string, string> = {
      card: '💳 Карта',
      kaspi: '🔴 Kaspi Pay',
      halyk: '🟢 Halyk Bank',
      sber: '🟢 Сбербанк',
      apple_pay: '🍎 Apple Pay',
      google_pay: '🟡 Google Pay',
    };
    return methods[method] || `💳 ${method}`;
  };

  if (subscriptionHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <ClockIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">История подписок</h3>
        </div>
        
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">История пуста</p>
          <p className="text-sm text-gray-400 mt-1">Здесь будут отображаться ваши операции</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">История подписок</h3>
        </div>
        
        <span className="text-sm text-gray-500">
          {subscriptionHistory.length} операций
        </span>
      </div>

      <div className="space-y-3">
        {displayedHistory.map((item) => (
          <div
            key={item.id}
            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 text-lg">
              {getTypeIcon(item.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.planName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </p>
                </div>
                
                <div className="text-right ml-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatAmount(item.amount, item.currency)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(item.date)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {getPaymentMethodDisplay(item.paymentMethod)}
                  </span>
                  
                  {item.transactionId && (
                    <span className="text-xs text-gray-400">
                      ID: {item.transactionId.slice(-8)}
                    </span>
                  )}
                </div>
                
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span className="capitalize">
                    {item.status === 'completed' ? 'Выполнено' : 
                     item.status === 'failed' ? 'Ошибка' : 
                     item.status === 'pending' ? 'В процессе' : item.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {subscriptionHistory.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 flex items-center justify-center space-x-1 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>
            {isExpanded ? 'Скрыть' : `Показать еще ${subscriptionHistory.length - 3}`}
          </span>
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>
      )}
      
      {subscriptionHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {/* Navigate to full history page */}}
            className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>Вся история</span>
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};