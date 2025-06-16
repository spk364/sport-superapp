import React, { useState } from 'react';
import { RegistrationFormData } from '../../../types';

interface BrandingStepProps {
  data: RegistrationFormData;
  onUpdate: (updates: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const BrandingStep: React.FC<BrandingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrev
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logo || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(data.coverImage || null);

  const colorPresets = [
    { name: 'Океан', primary: '#3B82F6', secondary: '#1E40AF', accent: '#06B6D4' },
    { name: 'Лес', primary: '#10B981', secondary: '#047857', accent: '#84CC16' },
    { name: 'Закат', primary: '#F59E0B', secondary: '#D97706', accent: '#EF4444' },
    { name: 'Лаванда', primary: '#8B5CF6', secondary: '#7C3AED', accent: '#EC4899' },
    { name: 'Графит', primary: '#6B7280', secondary: '#374151', accent: '#9CA3AF' },
    { name: 'Энергия', primary: '#EF4444', secondary: '#DC2626', accent: '#F97316' }
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        onUpdate({ logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCoverPreview(result);
        onUpdate({ coverImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const selectColorPreset = (preset: typeof colorPresets[0]) => {
    onUpdate({
      brandColors: {
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Брендинг и оформление</h2>
        <p className="text-gray-600">Создайте узнаваемый визуальный стиль</p>
      </div>

      <div className="space-y-8">
        {/* Logo Upload */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Логотип</h3>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="logo-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">Нажмите для загрузки</span> или перетащите файл
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG до 10MB</p>
                  </div>
                </div>
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Обложка</h3>
          <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <label htmlFor="cover-upload" className="cursor-pointer w-full h-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Загрузить обложку</span>
                  </p>
                  <p className="text-xs text-gray-500">Рекомендуемый размер 1200x400px</p>
                </div>
              </label>
            )}
          </div>
          <input
            id="cover-upload"
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
        </div>

        {/* Color Presets */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Цветовая схема</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {colorPresets.map((preset, index) => (
              <div
                key={index}
                onClick={() => selectColorPreset(preset)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  data.brandColors?.primary === preset.primary
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <p className="font-medium text-gray-800">{preset.name}</p>
                <div className="text-xs text-gray-500 mt-1">
                  <div>Основной: {preset.primary}</div>
                  <div>Дополнительный: {preset.secondary}</div>
                  <div>Акцент: {preset.accent}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Или выберите свои цвета</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Основной цвет
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={data.brandColors?.primary || '#3B82F6'}
                  onChange={(e) => onUpdate({
                    brandColors: {
                      ...data.brandColors,
                      primary: e.target.value
                    }
                  })}
                  className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={data.brandColors?.primary || '#3B82F6'}
                  onChange={(e) => onUpdate({
                    brandColors: {
                      ...data.brandColors,
                      primary: e.target.value
                    }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дополнительный цвет
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={data.brandColors?.secondary || '#1E40AF'}
                  onChange={(e) => onUpdate({
                    brandColors: {
                      ...data.brandColors,
                      secondary: e.target.value
                    }
                  })}
                  className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={data.brandColors?.secondary || '#1E40AF'}
                  onChange={(e) => onUpdate({
                    brandColors: {
                      ...data.brandColors,
                      secondary: e.target.value
                    }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#1E40AF"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Акцентный цвет
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={data.brandColors?.accent || '#06B6D4'}
                  onChange={(e) => onUpdate({
                    brandColors: {
                      ...data.brandColors,
                      accent: e.target.value
                    }
                  })}
                  className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={data.brandColors?.accent || '#06B6D4'}
                  onChange={(e) => onUpdate({
                    brandColors: {
                      ...data.brandColors,
                      accent: e.target.value
                    }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#06B6D4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Предварительный просмотр</h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="h-32 flex items-center justify-center text-white relative"
              style={{ 
                background: `linear-gradient(135deg, ${data.brandColors?.primary || '#3B82F6'}, ${data.brandColors?.secondary || '#1E40AF'})` 
              }}
            >
              {logoPreview && (
                <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain" />
              )}
              <div className="absolute bottom-4 left-4">
                <h4 className="text-xl font-bold">{data.clubName || 'Название клуба'}</h4>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: data.brandColors?.accent || '#06B6D4' }}
                />
                <span className="text-sm text-gray-600">Пример акцентного цвета</span>
              </div>
              <p className="text-gray-600">
                {data.description || 'Описание вашего фитнес-клуба будет отображаться здесь...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-8">
        <button
          onClick={onPrev}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Назад
        </button>
        
        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
};

export default BrandingStep;