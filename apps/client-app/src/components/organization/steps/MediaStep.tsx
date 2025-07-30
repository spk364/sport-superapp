import React from 'react';
import { OrganizationRegistrationData } from '../../../services/organizationService';

interface MediaStepProps {
  data: Partial<OrganizationRegistrationData>;
  errors: Record<string, string>;
  onChange: (data: Partial<OrganizationRegistrationData>) => void;
}

export const MediaStep: React.FC<MediaStepProps> = ({ data, errors, onChange }) => {
  const handleMediaChange = (field: string, value: string | string[]) => {
    onChange({
      media: {
        gallery: data.media?.gallery || [],
        ...data.media,
        [field]: value
      }
    });
  };

  const handleColorChange = (field: string, value: string) => {
    onChange({
      media: {
        gallery: data.media?.gallery || [],
        ...data.media,
        colorScheme: {
          primary: data.media?.colorScheme?.primary || '#3B82F6',
          secondary: data.media?.colorScheme?.secondary || '#8B5CF6',
          accent: data.media?.colorScheme?.accent || '#06B6D4',
          ...data.media?.colorScheme,
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Медиа и оформление</h2>
        <p className="text-gray-600 mb-8">Загрузите логотип и фото для привлекательного профиля.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Логотип</label>
        <input
          type="url"
          value={data.media?.logo || ''}
          onChange={(e) => handleMediaChange('logo', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="https://example.com/logo.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Обложка</label>
        <input
          type="url"
          value={data.media?.cover || ''}
          onChange={(e) => handleMediaChange('cover', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="https://example.com/cover.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Цветовая схема</label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Основной цвет</label>
            <input
              type="color"
              value={data.media?.colorScheme?.primary || '#3B82F6'}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-full h-12 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Вторичный цвет</label>
            <input
              type="color"
              value={data.media?.colorScheme?.secondary || '#8B5CF6'}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-full h-12 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Акцентный цвет</label>
            <input
              type="color"
              value={data.media?.colorScheme?.accent || '#06B6D4'}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="w-full h-12 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 