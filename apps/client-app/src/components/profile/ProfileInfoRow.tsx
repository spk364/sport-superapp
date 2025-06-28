import React from 'react';

interface ProfileInfoRowProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}

export const ProfileInfoRow: React.FC<ProfileInfoRowProps> = ({ icon: Icon, label, value }) => {
  if (!value) return null;

  return (
    <div className="flex items-center space-x-3 text-sm">
      <Icon className="h-5 w-5 text-gray-500" />
      <span className="font-medium text-gray-600 w-2/5">{label}:</span>
      <span className="text-gray-900 font-semibold text-right flex-1">
        {Array.isArray(value) ? value.join(', ') : value}
      </span>
    </div>
  );
}; 