import React, { useState } from 'react';
import { RegistrationFormData, WorkingHours } from '../../../types';

interface LocationStepProps {
  data: RegistrationFormData;
  onUpdate: (updates: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const LocationStep: React.FC<LocationStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrev
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const weekDays = [
    { id: 1, name: 'Понедельник', short: 'Пн' },
    { id: 2, name: 'Вторник', short: 'Вт' },
    { id: 3, name: 'Среда', short: 'Ср' },
    { id: 4, name: 'Четверг', short: 'Чт' },
    { id: 5, name: 'Пятница', short: 'Пт' },
    { id: 6, name: 'Суббота', short: 'Сб' },
    { id: 0, name: 'Воскресенье', short: 'Вс' }
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.address?.city?.trim()) {
      newErrors.city = 'Город обязателен';
    }

    if (!data.address?.street?.trim()) {
      newErrors.street = 'Улица обязательна';
    }

    if (!data.address?.building?.trim()) {
      newErrors.building = 'Номер дома обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const updateAddress = (field: string, value: string) => {
    onUpdate({
      address: {
        ...data.address,
        [field]: value
      }
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateWorkingHours = (dayOfWeek: number, updates: Partial<WorkingHours>) => {
    const updatedHours = data.workingHours?.map(day => 
      day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
    ) || [];
    
    onUpdate({ workingHours: updatedHours });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Местоположение и график</h2>
        <p className="text-gray-600">Укажите адрес и режим работы</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Address Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Адрес</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Страна
              </label>
              <input
                type="text"
                id="country"
                value={data.address?.country || 'Казахстан'}
                onChange={(e) => updateAddress('country', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Город *
              </label>
              <input
                type="text"
                id="city"
                value={data.address?.city || ''}
                onChange={(e) => updateAddress('city', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Например: Алматы, Астана"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                Улица *
              </label>
              <input
                type="text"
                id="street"
                value={data.address?.street || ''}
                onChange={(e) => updateAddress('street', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.street ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Название улицы"
              />
              {errors.street && (
                <p className="mt-1 text-sm text-red-600">{errors.street}</p>
              )}
            </div>

            <div>
              <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-2">
                Дом *
              </label>
              <input
                type="text"
                id="building"
                value={data.address?.building || ''}
                onChange={(e) => updateAddress('building', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.building ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Номер дома"
              />
              {errors.building && (
                <p className="mt-1 text-sm text-red-600">{errors.building}</p>
              )}
            </div>

            <div>
              <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-2">
                Квартира/Офис (опционально)
              </label>
              <input
                type="text"
                id="apartment"
                value={data.address?.apartment || ''}
                onChange={(e) => updateAddress('apartment', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Номер квартиры или офиса"
              />
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                Почтовый индекс (опционально)
              </label>
              <input
                type="text"
                id="zipCode"
                value={data.address?.zipCode || ''}
                onChange={(e) => updateAddress('zipCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="000000"
              />
            </div>
          </div>
        </div>

        {/* Working Hours Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">График работы</h3>
          <div className="space-y-4">
            {weekDays.map(day => {
              const dayHours = data.workingHours?.find(h => h.dayOfWeek === day.id) || {
                dayOfWeek: day.id,
                openTime: '09:00',
                closeTime: '21:00',
                isWorkingDay: day.id !== 0
              };

              return (
                <div key={day.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl">
                  <div className="w-20 flex items-center">
                    <input
                      type="checkbox"
                      id={`working-${day.id}`}
                      checked={dayHours.isWorkingDay}
                      onChange={(e) => updateWorkingHours(day.id, { isWorkingDay: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor={`working-${day.id}`} className="ml-2 text-sm font-medium text-gray-700">
                      {day.short}
                    </label>
                  </div>

                  <div className="flex-1 font-medium text-gray-800">
                    {day.name}
                  </div>

                  {dayHours.isWorkingDay ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={dayHours.openTime}
                        onChange={(e) => updateWorkingHours(day.id, { openTime: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="time"
                        value={dayHours.closeTime}
                        onChange={(e) => updateWorkingHours(day.id, { closeTime: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Выходной</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Подсказка</h4>
                <p className="text-sm text-blue-700 mt-1">
                  График работы поможет клиентам понять, когда они могут записаться на тренировки. 
                  Вы всегда сможете изменить его позже.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onPrev}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Назад
          </button>
          
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Продолжить
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationStep;