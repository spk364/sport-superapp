import React, { useState } from 'react';
import { RegistrationFormData } from '../../../types';

interface BasicInfoStepProps {
  data: RegistrationFormData;
  onUpdate: (updates: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onCancel: () => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onUpdate,
  onNext,
  onCancel
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.clubName?.trim()) {
      newErrors.clubName = 'Название клуба обязательно';
    }

    if (!data.ownerName?.trim()) {
      newErrors.ownerName = 'Имя владельца/тренера обязательно';
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

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    onUpdate({ [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Основная информация</h2>
        <p className="text-gray-600">Расскажите о вашем фитнес-клубе или секции</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Club Name */}
        <div>
          <label htmlFor="clubName" className="block text-sm font-medium text-gray-700 mb-2">
            Название клуба/секции *
          </label>
          <input
            type="text"
            id="clubName"
            value={data.clubName || ''}
            onChange={(e) => handleInputChange('clubName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.clubName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Например: FitClub Premium, Йога-студия Лотос"
          />
          {errors.clubName && (
            <p className="mt-1 text-sm text-red-600">{errors.clubName}</p>
          )}
        </div>

        {/* Owner Name */}
        <div>
          <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
            Имя владельца/главного тренера *
          </label>
          <input
            type="text"
            id="ownerName"
            value={data.ownerName || ''}
            onChange={(e) => handleInputChange('ownerName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.ownerName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ваше полное имя"
          />
          {errors.ownerName && (
            <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Описание (опционально)
          </label>
          <textarea
            id="description"
            rows={4}
            value={data.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Расскажите о своем фитнес-клубе, философии тренировок, особенностях..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Это поможет клиентам лучше понять вашу концепцию
          </p>
        </div>

        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Тип организации
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'fitness_club',
                title: 'Фитнес-клуб',
                description: 'Полноценный клуб с тренажерным залом',
                icon: '🏋️'
              },
              {
                id: 'personal',
                title: 'Персональный тренер',
                description: 'Индивидуальные тренировки',
                icon: '👨‍💼'
              },
              {
                id: 'studio',
                title: 'Студия',
                description: 'Специализированная студия (йога, танцы)',
                icon: '🧘'
              },
              {
                id: 'section',
                title: 'Спортивная секция',
                description: 'Секция по виду спорта',
                icon: '⚽'
              }
            ].map((type) => (
              <div
                key={type.id}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  data.legalData?.organizationType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onUpdate({
                  legalData: { ...data.legalData, organizationType: type.id as any }
                })}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{type.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{type.title}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Отменить
          </button>
          
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Продолжить
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoStep;