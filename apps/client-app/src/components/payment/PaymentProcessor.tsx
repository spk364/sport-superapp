import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { PaymentResponse } from '../../services/paymentService';

interface PaymentProcessorProps {
  isProcessing: boolean;
  paymentResponse: PaymentResponse | null;
  onRetry?: () => void;
  onSuccess?: (response: PaymentResponse) => void;
  onCancel?: () => void;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  isProcessing,
  paymentResponse,
  onRetry,
  onSuccess,
  onCancel,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isProcessing) {
      setProgress(0);
      setStatusMessage('Инициализация платежа...');
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 90) {
            setStatusMessage('Завершение обработки...');
            return 90;
          } else if (newProgress >= 60) {
            setStatusMessage('Проверка данных карты...');
            return newProgress;
          } else if (newProgress >= 30) {
            setStatusMessage('Связь с банком...');
            return newProgress;
          } else {
            setStatusMessage('Обработка платежа...');
            return newProgress;
          }
        });
      }, 200);

      return () => clearInterval(progressInterval);
    }
  }, [isProcessing]);

  useEffect(() => {
    if (paymentResponse?.success && onSuccess) {
      setProgress(100);
      setStatusMessage('Платёж успешно завершён!');
      setTimeout(() => onSuccess(paymentResponse), 1500);
    }
  }, [paymentResponse, onSuccess]);

  if (!isProcessing && !paymentResponse) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {isProcessing && (
          <div className="text-center">
            <div className="mb-4">
              <ArrowPathIcon className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Обработка платежа
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {statusMessage}
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-xs text-gray-500">
              Не закрывайте это окно до завершения операции
            </p>
          </div>
        )}

        {paymentResponse && !isProcessing && (
          <div className="text-center">
            {paymentResponse.success ? (
              <>
                <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  Платёж успешен!
                </h3>
                <p className="text-green-700 mb-4">
                  Ваш абонемент активирован
                </p>
                
                {paymentResponse.receipt && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
                    <h4 className="font-semibold text-green-900 mb-2">Детали платежа:</h4>
                    <div className="text-sm text-green-800 space-y-1">
                      <p>ID платежа: {paymentResponse.paymentId}</p>
                      <p>Сумма: {paymentResponse.receipt.amount.toLocaleString()} {paymentResponse.receipt.currency}</p>
                      <p>Способ: {paymentResponse.receipt.paymentMethod}</p>
                      <p>Дата: {paymentResponse.receipt.date.toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>
                )}

                {paymentResponse.status === 'pending' && paymentResponse.paymentUrl && (
                  <div className="mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <ClockIcon className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="text-sm text-orange-700">Требуется подтверждение</span>
                    </div>
                    <button
                      onClick={() => window.open(paymentResponse.paymentUrl, '_blank')}
                      className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Перейти к оплате
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Ошибка платежа
                </h3>
                <p className="text-red-700 mb-4">
                  {paymentResponse.error || 'Произошла ошибка при обработке платежа'}
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div className="text-left">
                      <h4 className="font-semibold text-red-900 text-sm">Что делать:</h4>
                      <ul className="text-sm text-red-800 mt-1 space-y-1">
                        <li>• Проверьте данные карты</li>
                        <li>• Убедитесь в наличии средств</li>
                        <li>• Попробуйте другой способ оплаты</li>
                        <li>• Обратитесь в банк при необходимости</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Повторить
                    </button>
                  )}
                  {onCancel && (
                    <button
                      onClick={onCancel}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Отмена
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};