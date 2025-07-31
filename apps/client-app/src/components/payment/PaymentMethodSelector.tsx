import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { PaymentMethod } from '../../services/paymentService';

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedMethodId: string | null;
  onSelectMethod: (methodId: string) => void;
  disabled?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethods,
  selectedMethodId,
  onSelectMethod,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Способ оплаты
      </h3>
      
      {paymentMethods.map((method) => (
        <button
          key={method.id}
          onClick={() => !disabled && onSelectMethod(method.id)}
          disabled={disabled || !method.enabled}
          className={`w-full p-4 border rounded-lg transition-all ${
            selectedMethodId === method.id
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          } ${
            disabled || !method.enabled
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{method.icon}</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">{method.name}</p>
                <p className="text-sm text-gray-500">
                  Обработка: ~{method.processingTime} сек
                </p>
              </div>
            </div>
            
            {selectedMethodId === method.id && (
              <CheckCircleIcon className="h-6 w-6 text-blue-600" />
            )}
          </div>
          
          {!method.enabled && (
            <div className="mt-2 text-left">
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                Временно недоступен
              </span>
            </div>
          )}
        </button>
      ))}
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          🔒 Все платежи защищены SSL-шифрованием. Мы не храним данные ваших карт.
        </p>
      </div>
    </div>
  );
};