import React from 'react';
import { OrganizationRegistrationData } from '../../../services/organizationService';

interface ContactInfoStepProps {
  data: Partial<OrganizationRegistrationData>;
  errors: Record<string, string>;
  onChange: (data: Partial<OrganizationRegistrationData>) => void;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Наличные' },
  { value: 'card', label: 'Банковская карта' },
  { value: 'bank_transfer', label: 'Банковский перевод' },
  { value: 'qr_code', label: 'QR-код' },
  { value: 'kaspi', label: 'Kaspi Pay' },
  { value: 'halyk', label: 'Halyk Bank' },
  { value: 'sber', label: 'Сбербанк' },
  { value: 'installments', label: 'Рассрочка' },
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Понедельник' },
  { key: 'tuesday', label: 'Вторник' },
  { key: 'wednesday', label: 'Среда' },  
  { key: 'thursday', label: 'Четверг' },
  { key: 'friday', label: 'Пятница' },
  { key: 'saturday', label: 'Суббота' },
  { key: 'sunday', label: 'Воскресенье' },
];

export const ContactInfoStep: React.FC<ContactInfoStepProps> = ({ data, errors, onChange }) => {
  const handlePhoneChange = (index: number, value: string) => {
    const phones = [...(data.contact?.phone || [''])];
    phones[index] = value;
    onChange({
      contact: {
        ...data.contact,
        phone: phones
      }
    });
  };

  const addPhone = () => {
    const phones = [...(data.contact?.phone || []), ''];
    onChange({
      contact: {
        ...data.contact,
        phone: phones
      }
    });
  };

  const removePhone = (index: number) => {
    const phones = (data.contact?.phone || []).filter((_, i) => i !== index);
    onChange({
      contact: {
        ...data.contact,
        phone: phones
      }
    });
  };

  const handleEmailChange = (index: number, value: string) => {
    const emails = [...(data.contact?.email || [''])];
    emails[index] = value;
    onChange({
      contact: {
        ...data.contact,
        email: emails
      }
    });
  };

  const addEmail = () => {
    const emails = [...(data.contact?.email || []), ''];
    onChange({
      contact: {
        ...data.contact,
        email: emails
      }
    });
  };

  const removeEmail = (index: number) => {
    const emails = (data.contact?.email || []).filter((_, i) => i !== index);
    onChange({
      contact: {
        ...data.contact,
        email: emails
      }
    });
  };

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    onChange({
      contact: {
        ...data.contact,
        workingHours: {
          ...data.contact?.workingHours,
          [day]: {
            ...data.contact?.workingHours?.[day as keyof typeof data.contact.workingHours],
            [field]: value
          }
        }
      }
    });
  };

  const handlePaymentMethodToggle = (method: string) => {
    const currentMethods = data.contact?.paymentMethods || [];
    const updatedMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    
    onChange({
      contact: {
        ...data.contact,
        paymentMethods: updatedMethods
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Контактная информация
        </h2>
        <p className="text-gray-600 mb-8">
          Укажите способы связи с вашей организацией и время работы.
        </p>
      </div>

      {/* Телефоны */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Телефоны *
        </label>
        {(data.contact?.phone || ['']).map((phone, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(index, e.target.value)}
              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+7 777 123 45 67"
            />
            {(data.contact?.phone || []).length > 1 && (
              <button
                type="button"
                onClick={() => removePhone(index)}
                className="px-3 py-3 text-red-600 hover:text-red-800 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addPhone}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Добавить телефон
        </button>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email адреса *
        </label>
        {(data.contact?.email || ['']).map((email, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="info@example.com"
            />
            {(data.contact?.email || []).length > 1 && (
              <button
                type="button"
                onClick={() => removeEmail(index)}
                className="px-3 py-3 text-red-600 hover:text-red-800 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addEmail}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Добавить email
        </button>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Веб-сайт */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Веб-сайт
        </label>
        <input
          type="url"
          value={data.contact?.website || ''}
          onChange={(e) => onChange({
            contact: {
              ...data.contact,
              website: e.target.value
            }
          })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com"
        />
      </div>

      {/* Время работы */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Время работы
        </label>
        <div className="space-y-3">
          {DAYS_OF_WEEK.map(day => {
            const dayData = data.contact?.workingHours?.[day.key as keyof typeof data.contact.workingHours];
            return (
              <div key={day.key} className="flex items-center gap-4">
                <div className="w-24">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dayData?.isOpen || false}
                      onChange={(e) => handleWorkingHoursChange(day.key, 'isOpen', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {day.label}
                    </span>
                  </label>
                </div>
                {dayData?.isOpen && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={dayData.open || '09:00'}
                      onChange={(e) => handleWorkingHoursChange(day.key, 'open', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="time"
                      value={dayData.close || '21:00'}
                      onChange={(e) => handleWorkingHoursChange(day.key, 'close', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Способы оплаты */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Способы оплаты
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PAYMENT_METHODS.map(method => (
            <label
              key={method.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                (data.contact?.paymentMethods || []).includes(method.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={(data.contact?.paymentMethods || []).includes(method.value)}
                onChange={() => handlePaymentMethodToggle(method.value)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                (data.contact?.paymentMethods || []).includes(method.value)
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {(data.contact?.paymentMethods || []).includes(method.value) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L3.707 11.121a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">{method.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}; 