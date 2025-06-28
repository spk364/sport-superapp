import React from 'react';
import { OrganizationRegistrationData } from '../../../services/organizationService';

interface BasicInfoStepProps {
  data: Partial<OrganizationRegistrationData>;
  errors: Record<string, string>;
  onChange: (data: Partial<OrganizationRegistrationData>) => void;
}

const ORGANIZATION_TYPES = [
  { value: 'personal_trainer', label: 'Персональный тренер' },
  { value: 'gym', label: 'Спортзал' },
  { value: 'sports_club', label: 'Спортивный клуб' },
  { value: 'fitness_studio', label: 'Фитнес-студия' },
  { value: 'sports_section', label: 'Спортивная секция' },
  { value: 'martial_arts_school', label: 'Школа боевых искусств' },
  { value: 'yoga_studio', label: 'Йога-студия' },
  { value: 'dance_studio', label: 'Танцевальная студия' },
  { value: 'swimming_pool', label: 'Бассейн' },
  { value: 'other', label: 'Другое' },
];

const SPECIALIZATIONS = [
  { value: 'strength_training', label: 'Силовые тренировки' },
  { value: 'cardio', label: 'Кардио тренировки' },
  { value: 'yoga', label: 'Йога' },
  { value: 'pilates', label: 'Пилатес' },
  { value: 'martial_arts', label: 'Боевые искусства' },
  { value: 'boxing', label: 'Бокс' },
  { value: 'swimming', label: 'Плавание' },
  { value: 'running', label: 'Бег' },
  { value: 'crossfit', label: 'Кроссфит' },
  { value: 'bodybuilding', label: 'Бодибилдинг' },
  { value: 'powerlifting', label: 'Пауэрлифтинг' },
  { value: 'gymnastics', label: 'Гимнастика' },
  { value: 'dance', label: 'Танцы' },
  { value: 'stretching', label: 'Растяжка' },
  { value: 'rehabilitation', label: 'Реабилитация' },
  { value: 'group_classes', label: 'Групповые занятия' },
  { value: 'personal_training', label: 'Персональные тренировки' },
  { value: 'nutrition_consulting', label: 'Консультации по питанию' },
  { value: 'other', label: 'Другое' },
];

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, errors, onChange }) => {
  const handleInputChange = (field: string, value: string) => {
    onChange({ [field]: value });
  };

  const handleSpecializationToggle = (specializationValue: string) => {
    const currentSpecializations = data.specializations || [];
    const updatedSpecializations = currentSpecializations.includes(specializationValue)
      ? currentSpecializations.filter(s => s !== specializationValue)
      : [...currentSpecializations, specializationValue];
    
    onChange({ specializations: updatedSpecializations });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Основная информация
        </h2>
        <p className="text-gray-600 mb-8">
          Расскажите о вашей организации - название, тип и основные направления деятельности.
        </p>
      </div>

      {/* Название организации */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название организации *
        </label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Например: Фитнес клуб Champion"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Тип организации */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Тип организации *
        </label>
        <select
          value={data.type || ''}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Выберите тип организации</option>
          {ORGANIZATION_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type}</p>
        )}
      </div>

      {/* Описание */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Описание организации
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Расскажите о вашей организации, миссии, особенностях..."
        />
        <p className="mt-1 text-sm text-gray-500">
          Это описание поможет клиентам лучше понять вашу организацию
        </p>
      </div>

      {/* Направления тренировок */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Направления тренировок *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SPECIALIZATIONS.map(specialization => (
            <label
              key={specialization.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                (data.specializations || []).includes(specialization.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={(data.specializations || []).includes(specialization.value)}
                onChange={() => handleSpecializationToggle(specialization.value)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                (data.specializations || []).includes(specialization.value)
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {(data.specializations || []).includes(specialization.value) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L3.707 11.121a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">{specialization.label}</span>
            </label>
          ))}
        </div>
        {errors.specializations && (
          <p className="mt-2 text-sm text-red-600">{errors.specializations}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          Выберите все направления, которые предлагает ваша организация
        </p>
      </div>
    </div>
  );
}; 