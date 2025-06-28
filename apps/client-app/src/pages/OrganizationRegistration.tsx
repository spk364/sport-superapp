import React from 'react';
import { OrganizationRegistrationForm } from '../components/organization/OrganizationRegistrationForm';

export const OrganizationRegistration: React.FC = () => {
  const handleSuccess = (organizationId: string) => {
    console.log('Organization registered successfully:', organizationId);
    // Здесь можно добавить логику перехода на страницу успеха или профиль организации
    alert('Организация успешно зарегистрирована! ID: ' + organizationId);
  };

  const handleCancel = () => {
    // Здесь можно добавить логику возврата на предыдущую страницу
    console.log('Registration cancelled');
  };

  return (
    <OrganizationRegistrationForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}; 