import React from 'react';
import { OrganizationRegistrationData } from '../../../services/organizationService';

interface TrainersStepProps {
  data: Partial<OrganizationRegistrationData>;
  errors: Record<string, string>;
  onChange: (data: Partial<OrganizationRegistrationData>) => void;
}

export const TrainersStep: React.FC<TrainersStepProps> = ({ data, errors, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Тренеры</h2>
        <p className="text-gray-600 mb-8">Информация о тренерах будет добавлена позже.</p>
      </div>
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Этот раздел будет доступен после регистрации организации</p>
      </div>
    </div>
  );
}; 