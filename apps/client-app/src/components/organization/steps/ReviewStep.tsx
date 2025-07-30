import React from 'react';
import { OrganizationRegistrationData } from '../../../services/organizationService';

interface ReviewStepProps {
  data: Partial<OrganizationRegistrationData>;
  errors: Record<string, string>;
  onChange: (data: Partial<OrganizationRegistrationData>) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, errors, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Проверка данных</h2>
        <p className="text-gray-600 mb-8">Проверьте введенную информацию перед отправкой.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Основная информация</h3>
          <p><strong>Название:</strong> {data.name || 'Не указано'}</p>
          <p><strong>Тип:</strong> {data.type || 'Не указан'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Контакты</h3>
          <p><strong>Телефоны:</strong> {data.contact?.phone?.join(', ') || 'Не указаны'}</p>
          <p><strong>Email:</strong> {data.contact?.email?.join(', ') || 'Не указаны'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Местоположение</h3>
          <p><strong>Город:</strong> {data.location?.city || 'Не указан'}</p>
          <p><strong>Адрес:</strong> {data.location?.address || 'Не указан'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Пакеты услуг</h3>
          <p><strong>Количество пакетов:</strong> {data.packages?.length || 0}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          После отправки ваша заявка будет рассмотрена администратором. 
          Процесс проверки может занять до 2-3 рабочих дней.
        </p>
      </div>
    </div>
  );
}; 