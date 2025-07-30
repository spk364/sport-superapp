import React from 'react';
import { OrganizationRegistrationData } from '../../../services/organizationService';

interface LocationStepProps {
  data: Partial<OrganizationRegistrationData>;
  errors: Record<string, string>;
  onChange: (data: Partial<OrganizationRegistrationData>) => void;
}

const KAZAKHSTAN_CITIES = [
  'Алматы',
  'Астана (Нур-Султан)',
  'Шымкент',
  'Караганда',
  'Актобе',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Атырау',
  'Костанай',
  'Кызылорда',
  'Уральск',
  'Петропавловск',
  'Актау',
  'Темиртау',
  'Туркестан',
  'Кокшетау',
  'Талдыкорган',
  'Экибастуз'
];

export const LocationStep: React.FC<LocationStepProps> = ({ data, errors, onChange }) => {
  const handleLocationChange = (field: string, value: string | boolean) => {
    onChange({
      location: {
        country: data.location?.country || 'Казахстан',
        city: data.location?.city || '',
        address: data.location?.address || '',
        ...data.location,
        [field]: value
      }
    });
  };

  const handleCoordinatesChange = (field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({
        location: {
          country: data.location?.country || 'Казахстан',
          city: data.location?.city || '',
          address: data.location?.address || '',
          ...data.location,
          coordinates: {
            lat: field === 'lat' ? numValue : (data.location?.coordinates?.lat || 0),
            lng: field === 'lng' ? numValue : (data.location?.coordinates?.lng || 0)
          }
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Местоположение
        </h2>
        <p className="text-gray-600 mb-8">
          Укажите точный адрес вашей организации для удобства клиентов.
        </p>
      </div>

      {/* Страна */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Страна
        </label>
        <input
          type="text"
          value={data.location?.country || 'Казахстан'}
          onChange={(e) => handleLocationChange('country', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled
        />
      </div>

      {/* Город */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Город *
        </label>
        <select
          value={data.location?.city || ''}
          onChange={(e) => handleLocationChange('city', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.city ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Выберите город</option>
          {KAZAKHSTAN_CITIES.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {errors.city && (
          <p className="mt-1 text-sm text-red-600">{errors.city}</p>
        )}
      </div>

      {/* Адрес */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Полный адрес *
        </label>
        <input
          type="text"
          value={data.location?.address || ''}
          onChange={(e) => handleLocationChange('address', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Например: ул. Абая 123, кв/офис 45"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      {/* Почтовый индекс */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Почтовый индекс
        </label>
        <input
          type="text"
          value={data.location?.postalCode || ''}
          onChange={(e) => handleLocationChange('postalCode', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="050000"
        />
      </div>

      {/* Координаты */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Координаты (GPS)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Широта (Latitude)
            </label>
            <input
              type="number"
              step="any"
              value={data.location?.coordinates?.lat || ''}
              onChange={(e) => handleCoordinatesChange('lat', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="43.2220"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Долгота (Longitude)
            </label>
            <input
              type="number"
              step="any"
              value={data.location?.coordinates?.lng || ''}
              onChange={(e) => handleCoordinatesChange('lng', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="76.8512"
            />
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Координаты помогут клиентам точно найти вас на карте. Вы можете найти координаты в Google Maps или 2GIS.
        </p>
      </div>

      {/* Ориентиры */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ориентиры
        </label>
        <textarea
          value={data.location?.landmarks || ''}
          onChange={(e) => handleLocationChange('landmarks', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Например: напротив ТРЦ Mega, рядом с остановкой Центральная"
        />
        <p className="mt-1 text-sm text-gray-500">
          Укажите заметные объекты рядом с вашим заведением
        </p>
      </div>

      {/* Парковка */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.location?.parking || false}
            onChange={(e) => handleLocationChange('parking', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            Есть парковка
          </span>
        </label>
      </div>

      {/* Общественный транспорт */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ближайший общественный транспорт
        </label>
        <input
          type="text"
          value={data.location?.publicTransport || ''}
          onChange={(e) => handleLocationChange('publicTransport', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Например: автобус №5, 12; метро Алатау"
        />
        <p className="mt-1 text-sm text-gray-500">
          Укажите ближайшие остановки общественного транспорта
        </p>
      </div>
    </div>
  );
}; 