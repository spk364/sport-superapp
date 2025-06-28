import React, { useState } from 'react';
import { OrganizationRegistrationData } from '../../../services/organizationService';

interface ServicesStepProps {
  data: Partial<OrganizationRegistrationData>;
  errors: Record<string, string>;
  onChange: (data: Partial<OrganizationRegistrationData>) => void;
}

interface ServicePackage {
  name: string;
  description: string;
  price: number;
  currency: string;
  duration?: number;
  sessionsCount?: number;
  features: string[];
  isPopular?: boolean;
}

export const ServicesStep: React.FC<ServicesStepProps> = ({ data, errors, onChange }) => {
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackageIndex, setEditingPackageIndex] = useState<number | null>(null);
  const [currentPackage, setCurrentPackage] = useState<ServicePackage>({
    name: '',
    description: '',
    price: 0,
    currency: 'KZT',
    duration: undefined,
    sessionsCount: undefined,
    features: [''],
    isPopular: false
  });

  const handleAddPackage = () => {
    setCurrentPackage({
      name: '',
      description: '',
      price: 0,
      currency: 'KZT',
      duration: undefined,
      sessionsCount: undefined,
      features: [''],
      isPopular: false
    });
    setEditingPackageIndex(null);
    setShowPackageForm(true);
  };

  const handleEditPackage = (index: number) => {
    const packageData = data.packages?.[index];
    if (packageData) {
      setCurrentPackage({
        ...packageData,
        features: packageData.features.length > 0 ? packageData.features : ['']
      });
      setEditingPackageIndex(index);
      setShowPackageForm(true);
    }
  };

  const handleSavePackage = () => {
    if (!currentPackage.name.trim() || currentPackage.price <= 0) {
      return;
    }

    const filteredFeatures = currentPackage.features.filter(f => f.trim());
    const packageToSave = {
      ...currentPackage,
      features: filteredFeatures
    };

    const packages = [...(data.packages || [])];
    
    if (editingPackageIndex !== null) {
      packages[editingPackageIndex] = packageToSave;
    } else {
      packages.push(packageToSave);
    }

    onChange({
      packages
    });

    setShowPackageForm(false);
    setEditingPackageIndex(null);
  };

  const handleDeletePackage = (index: number) => {
    const packages = (data.packages || []).filter((_, i) => i !== index);
    onChange({ packages });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const features = [...currentPackage.features];
    features[index] = value;
    setCurrentPackage({ ...currentPackage, features });
  };

  const addFeature = () => {
    setCurrentPackage({
      ...currentPackage,
      features: [...currentPackage.features, '']
    });
  };

  const removeFeature = (index: number) => {
    const features = currentPackage.features.filter((_, i) => i !== index);
    setCurrentPackage({ ...currentPackage, features });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Услуги и пакеты
        </h2>
        <p className="text-gray-600 mb-8">
          Создайте пакеты услуг с описанием и ценами для ваших клиентов.
        </p>
      </div>

      {/* Существующие пакеты */}
      <div className="space-y-4">
        {(data.packages || []).map((pkg, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
            {pkg.isPopular && (
              <div className="absolute -top-2 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Популярный
              </div>
            )}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {pkg.description}
                </p>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-2xl font-bold text-blue-600">
                    {pkg.price.toLocaleString()} {pkg.currency}
                  </span>
                  {pkg.duration && (
                    <span className="text-sm text-gray-500">
                      на {pkg.duration} дней
                    </span>
                  )}
                  {pkg.sessionsCount && (
                    <span className="text-sm text-gray-500">
                      {pkg.sessionsCount} занятий
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {pkg.features.map((feature, featureIndex) => (
                    <span
                      key={featureIndex}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEditPackage(index)}
                  className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDeletePackage(index)}
                  className="text-red-600 hover:text-red-800 transition-colors p-2"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Форма добавления/редактирования пакета */}
      {showPackageForm && (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPackageIndex !== null ? 'Редактировать пакет' : 'Новый пакет'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название пакета *
              </label>
              <input
                type="text"
                value={currentPackage.name}
                onChange={(e) => setCurrentPackage({ ...currentPackage, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: Месячный абонемент"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена *
                </label>
                <input
                  type="number"
                  value={currentPackage.price}
                  onChange={(e) => setCurrentPackage({ ...currentPackage, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Валюта
                </label>
                <select
                  value={currentPackage.currency}
                  onChange={(e) => setCurrentPackage({ ...currentPackage, currency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="KZT">₸</option>
                  <option value="USD">$</option>
                  <option value="EUR">€</option>
                  <option value="RUB">₽</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={currentPackage.description}
              onChange={(e) => setCurrentPackage({ ...currentPackage, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Опишите что включает пакет..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Срок действия (дни)
              </label>
              <input
                type="number"
                value={currentPackage.duration || ''}
                onChange={(e) => setCurrentPackage({ ...currentPackage, duration: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество занятий
              </label>
              <input
                type="number"
                value={currentPackage.sessionsCount || ''}
                onChange={(e) => setCurrentPackage({ ...currentPackage, sessionsCount: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="8"
                min="1"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Что включено
            </label>
            {currentPackage.features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Групповые тренировки"
                />
                {currentPackage.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="px-3 py-3 text-red-600 hover:text-red-800 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Добавить возможность
            </button>
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={currentPackage.isPopular}
                onChange={(e) => setCurrentPackage({ ...currentPackage, isPopular: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Популярный пакет (будет выделен)
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSavePackage}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              {editingPackageIndex !== null ? 'Сохранить изменения' : 'Добавить пакет'}
            </button>
            <button
              onClick={() => setShowPackageForm(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отменить
            </button>
          </div>
        </div>
      )}

      {/* Кнопка добавления пакета */}
      {!showPackageForm && (
        <button
          onClick={handleAddPackage}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Добавить пакет услуг
        </button>
      )}

      {errors.packages && (
        <p className="text-red-600 text-sm">{errors.packages}</p>
      )}
    </div>
  );
}; 