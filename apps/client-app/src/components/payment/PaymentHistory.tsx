import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ReceiptPercentIcon,
  CalendarDaysIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { Payment } from '../../types';
import { paymentService } from '../../services/paymentService';

interface PaymentHistoryProps {
  userId: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    loadPaymentHistory();
  }, [userId]);

  const loadPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const history = await paymentService.getPaymentHistory(userId);
      setPayments(history);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon;
      case 'pending':
        return ClockIcon;
      case 'failed':
        return XCircleIcon;
      case 'refunded':
        return ArrowPathIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершён';
      case 'pending':
        return 'В обработке';
      case 'failed':
        return 'Неуспешен';
      case 'refunded':
        return 'Возвращён';
      default:
        return status;
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'Абонемент';
      case 'single_session':
        return 'Разовое занятие';
      case 'package':
        return 'Пакет занятий';
      default:
        return type;
    }
  };

  const handleReceiptDownload = (payment: Payment) => {
    if (payment.receipt) {
      const receiptUrl = paymentService.generateReceiptUrl(payment.id);
      window.open(receiptUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-40"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Нет платежей</h3>
        <p className="mt-2 text-sm text-gray-500">
          История ваших платежей появится здесь после первой оплаты
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">История платежей</h3>
        <button
          onClick={loadPaymentHistory}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Обновить"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {payments.map((payment) => {
        const StatusIcon = getStatusIcon(payment.status);
        
        return (
          <div
            key={payment.id}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedPayment(payment)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <StatusIcon className={`h-5 w-5 ${getStatusColor(payment.status).split(' ')[0]}`} />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {payment.description}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500 flex items-center">
                        <CalendarDaysIcon className="h-3 w-3 mr-1" />
                        {payment.date.toLocaleDateString('ru-RU')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getPaymentTypeText(payment.type)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {payment.amount.toLocaleString()} {payment.currency}
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {getStatusText(payment.status)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Детали платежа</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XCircleIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Статус:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                  {getStatusText(selectedPayment.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Сумма:</span>
                  <p className="font-medium">
                    {selectedPayment.amount.toLocaleString()} {selectedPayment.currency}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Дата:</span>
                  <p className="font-medium">
                    {selectedPayment.date.toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Тип:</span>
                  <p className="font-medium">
                    {getPaymentTypeText(selectedPayment.type)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">ID платежа:</span>
                  <p className="font-medium text-xs text-gray-800">
                    {selectedPayment.id}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600">Описание:</span>
                <p className="font-medium text-sm mt-1">
                  {selectedPayment.description}
                </p>
              </div>

              {selectedPayment.subscriptionId && (
                <div>
                  <span className="text-sm text-gray-600">ID абонемента:</span>
                  <p className="font-medium text-xs text-gray-800 mt-1">
                    {selectedPayment.subscriptionId}
                  </p>
                </div>
              )}

              {selectedPayment.receipt && (
                <button
                  onClick={() => handleReceiptDownload(selectedPayment)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ReceiptPercentIcon className="h-5 w-5 mr-2" />
                  Скачать чек
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};