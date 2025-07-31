import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { CardDetails } from '../../services/paymentService';

interface CardPaymentFormProps {
  cardDetails: CardDetails;
  onCardDetailsChange: (details: CardDetails) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  cardDetails,
  onCardDetailsChange,
  errors,
  disabled = false,
}) => {
  const [showCvv, setShowCvv] = useState(false);

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 19) {
      onCardDetailsChange({
        ...cardDetails,
        cardNumber: formatted,
      });
    }
  };

  const handleExpiryChange = (field: 'month' | 'year', value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (field === 'month') {
      if (digits.length <= 2 && (digits === '' || (parseInt(digits) >= 1 && parseInt(digits) <= 12))) {
        onCardDetailsChange({
          ...cardDetails,
          expiryMonth: digits,
        });
      }
    } else {
      if (digits.length <= 4) {
        onCardDetailsChange({
          ...cardDetails,
          expiryYear: digits,
        });
      }
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits.length <= 4) {
      onCardDetailsChange({
        ...cardDetails,
        cvv: digits,
      });
    }
  };

  const getCardType = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'MasterCard';
    if (cleanNumber.startsWith('3')) return 'American Express';
    return '';
  };

  const cardType = getCardType(cardDetails.cardNumber);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <CreditCardIcon className="h-5 w-5 mr-2" />
        Данные карты
      </h3>
      
      {/* Card Number */}
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Номер карты
        </label>
        <div className="relative">
          <input
            id="cardNumber"
            type="text"
            value={cardDetails.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            disabled={disabled}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {cardType && (
            <span className="absolute right-3 top-3 text-sm font-medium text-gray-600">
              {cardType}
            </span>
          )}
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
        )}
      </div>

      {/* Cardholder Name */}
      <div>
        <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
          Имя держателя карты
        </label>
        <input
          id="cardholderName"
          type="text"
          value={cardDetails.cardholderName}
          onChange={(e) => onCardDetailsChange({
            ...cardDetails,
            cardholderName: e.target.value.toUpperCase(),
          })}
          placeholder="IVAN PETROV"
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.cardholderName ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {errors.cardholderName && (
          <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
        )}
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-2">
            Месяц
          </label>
          <input
            id="expiryMonth"
            type="text"
            value={cardDetails.expiryMonth}
            onChange={(e) => handleExpiryChange('month', e.target.value)}
            placeholder="12"
            disabled={disabled}
            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
        </div>
        
        <div>
          <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-2">
            Год
          </label>
          <input
            id="expiryYear"
            type="text"
            value={cardDetails.expiryYear}
            onChange={(e) => handleExpiryChange('year', e.target.value)}
            placeholder="2025"
            disabled={disabled}
            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.expiryYear ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
        </div>
        
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <div className="relative">
            <input
              id="cvv"
              type={showCvv ? 'text' : 'password'}
              value={cardDetails.cvv}
              onChange={handleCvvChange}
              placeholder="123"
              disabled={disabled}
              className={`w-full px-3 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.cvv ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowCvv(!showCvv)}
              disabled={disabled}
              className="absolute right-2 top-3 text-gray-400 hover:text-gray-600"
            >
              {showCvv ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {(errors.expiryMonth || errors.expiryYear || errors.cvv) && (
        <div className="text-sm text-red-600">
          {errors.expiryMonth && <p>{errors.expiryMonth}</p>}
          {errors.expiryYear && <p>{errors.expiryYear}</p>}
          {errors.cvv && <p>{errors.cvv}</p>}
        </div>
      )}

      {/* Test Cards Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Тестовые карты для разработки:
        </h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p><code>4111 1111 1111 1111</code> - Успешная оплата (Visa)</p>
          <p><code>5555 5555 5555 4444</code> - Успешная оплата (MasterCard)</p>
          <p><code>4000 0000 0000 0002</code> - Отклонённая карта</p>
          <p>CVV: любой 3-значный код, Срок: любая будущая дата</p>
        </div>
      </div>
    </div>
  );
};