import React, { useState, useEffect } from 'react';
import {
  QrCodeIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { kaspiPayService, KaspiPayResponse, KaspiPayStatusResponse } from '../../services/kaspiPayService';

interface KaspiPaymentFormProps {
  amount: number;
  currency: string;
  planName: string;
  onSuccess: (response: KaspiPayResponse) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const KaspiPaymentForm: React.FC<KaspiPaymentFormProps> = ({
  amount,
  currency,
  planName,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [step, setStep] = useState<'method' | 'qr' | 'processing' | 'success' | 'error'>('method');
  const [paymentResponse, setPaymentResponse] = useState<KaspiPayResponse | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [statusResponse, setStatusResponse] = useState<KaspiPayStatusResponse | null>(null);
  const [countdown, setCountdown] = useState(300); // 5 минут
  const [isPolling, setIsPolling] = useState(false);

  // Таймер обратного отсчета
  useEffect(() => {
    if (step === 'qr' || step === 'processing') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setStep('error');
            onError('Время ожидания платежа истекло');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, onError]);

  // Опрос статуса платежа
  useEffect(() => {
    if (isPolling && paymentResponse?.transactionId) {
      const pollInterval = setInterval(async () => {
        try {
          const status = await kaspiPayService.getPaymentStatus(paymentResponse.transactionId);
          setStatusResponse(status);

          if (status.status === 'success') {
            setStep('success');
            setIsPolling(false);
            onSuccess(paymentResponse);
          } else if (status.status === 'failed' || status.status === 'cancelled') {
            setStep('error');
            setIsPolling(false);
            onError(status.errorMessage || 'Платеж не выполнен');
          }
        } catch (error) {
          console.error('Status polling error:', error);
        }
      }, 3000);

      return () => clearInterval(pollInterval);
    }
  }, [isPolling, paymentResponse, onSuccess, onError]);

  const handlePaymentMethod = async (method: 'qr' | 'app') => {
    try {
      const response = await kaspiPayService.createPayment({
        amount,
        currency,
        planId: 'subscription',
        redirectUrl: window.location.origin + '/payment/success',
        failUrl: window.location.origin + '/payment/fail',
        description: `Оплата ${planName}`,
        language: 'ru',
        paymentMethodId: 'kaspi',
      });

      if (!response.success) {
        onError(response.error || 'Ошибка создания платежа');
        return;
      }

      setPaymentResponse(response);

      if (method === 'qr') {
        const qrCodeData = await kaspiPayService.generateQRCode(response.transactionId);
        setQrCode(qrCodeData);
        setStep('qr');
      } else {
        // Редирект в приложение Kaspi
        if (response.paymentUrl) {
          window.location.href = response.paymentUrl;
        }
        setStep('processing');
      }

      setIsPolling(true);
    } catch (error) {
      onError('Ошибка при создании платежа');
    }
  };

  const handleCancel = async () => {
    if (paymentResponse?.transactionId) {
      await kaspiPayService.cancelPayment(paymentResponse.transactionId);
    }
    setIsPolling(false);
    onCancel();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-KZ').format(amount);
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Оплата через Kaspi</h3>
        <p className="text-lg font-semibold text-red-600 mb-1">
          {formatAmount(amount)} {currency}
        </p>
        <p className="text-sm text-gray-600">{planName}</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handlePaymentMethod('qr')}
          className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <QrCodeIcon className="h-8 w-8 text-red-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">QR-код</p>
              <p className="text-sm text-gray-600">Отсканируйте в приложении Kaspi</p>
            </div>
          </div>
          <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400" />
        </button>

        <button
          onClick={() => handlePaymentMethod('app')}
          className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <DevicePhoneMobileIcon className="h-8 w-8 text-red-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Приложение Kaspi</p>
              <p className="text-sm text-gray-600">Перейти в приложение для оплаты</p>
            </div>
          </div>
          <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-900 mb-2">Как оплатить:</h4>
        <ol className="text-sm text-red-800 space-y-1">
          <li>1. Откройте приложение Kaspi на телефоне</li>
          <li>2. Нажмите "Платежи" → "QR" или выберите "Перейти в приложение"</li>
          <li>3. Отсканируйте QR-код или подтвердите платеж</li>
          <li>4. Введите PIN-код для подтверждения</li>
        </ol>
      </div>
    </div>
  );

  const renderQRPayment = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Сканируйте QR-код</h3>
        <div className="flex items-center justify-center space-x-2 text-red-600">
          <ClockIcon className="h-5 w-5" />
          <span className="font-mono text-lg">{formatTime(countdown)}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg border-2 border-red-200">
          {qrCode ? (
            <img src={qrCode} alt="QR код для оплаты" className="w-48 h-48" />
          ) : (
            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
              <QrCodeIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <DevicePhoneMobileIcon className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">Инструкция:</p>
            <ol className="space-y-1">
              <li>1. Откройте приложение Kaspi</li>
              <li>2. Выберите "Платежи" → "QR"</li>
              <li>3. Наведите камеру на QR-код</li>
              <li>4. Проверьте сумму и подтвердите платеж</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          После сканирования автоматически перейдете к оплате
        </p>
        <button
          onClick={handleCancel}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Отменить платеж
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Ожидание подтверждения</h3>
        <p className="text-gray-600 mb-4">
          Подтвердите платеж в приложении Kaspi
        </p>
        <div className="flex items-center justify-center space-x-2 text-red-600">
          <ClockIcon className="h-5 w-5" />
          <span className="font-mono text-lg">{formatTime(countdown)}</span>
        </div>
      </div>

      {statusResponse && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Статус: {statusResponse.status === 'pending' ? 'Ожидание подтверждения' : statusResponse.status}
          </p>
        </div>
      )}

      <button
        onClick={handleCancel}
        className="text-red-600 hover:text-red-800 text-sm font-medium"
      >
        Отменить платеж
      </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircleIcon className="h-16 w-16 text-green-600" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-green-900 mb-2">Платеж успешен!</h3>
        <p className="text-gray-600 mb-4">
          Ваш абонемент активирован
        </p>
        
        {statusResponse && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <h4 className="font-medium text-green-900 mb-2">Детали платежа:</h4>
            <div className="text-sm text-green-800 space-y-1">
              <p>Сумма: {formatAmount(statusResponse.amount)} {statusResponse.currency}</p>
              <p>Комиссия: {formatAmount(statusResponse.commission)} {statusResponse.currency}</p>
              {statusResponse.paymentDate && (
                <p>Дата: {statusResponse.paymentDate.toLocaleString('ru-RU')}</p>
              )}
              <p>ID транзакции: {statusResponse.transactionId}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderError = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <XCircleIcon className="h-16 w-16 text-red-600" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-red-900 mb-2">Ошибка платежа</h3>
        <p className="text-gray-600 mb-4">
          {statusResponse?.errorMessage || 'Произошла ошибка при обработке платежа'}
        </p>

        {statusResponse?.errorCode && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Код ошибки: {statusResponse.errorCode}
            </p>
          </div>
        )}
      </div>

      <div className="space-x-3">
        <button
          onClick={() => setStep('method')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Попробовать снова
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Kaspi Pay</span>
          </div>
        </div>

        {step === 'method' && renderMethodSelection()}
        {step === 'qr' && renderQRPayment()}
        {step === 'processing' && renderProcessing()}
        {step === 'success' && renderSuccess()}
        {step === 'error' && renderError()}
      </div>
    </div>
  );
};