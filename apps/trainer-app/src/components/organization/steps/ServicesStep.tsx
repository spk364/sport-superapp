import React, { useState } from 'react';
import { RegistrationFormData, TrainingDirection, ServicePackage } from '../../../types';

interface ServicesStepProps {
  data: RegistrationFormData;
  onUpdate: (updates: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const ServicesStep: React.FC<ServicesStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrev
}) => {
  const [newDirection, setNewDirection] = useState<Partial<TrainingDirection>>({});
  const [newPackage, setNewPackage] = useState<Partial<ServicePackage>>({});
  const [showDirectionForm, setShowDirectionForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);

  const trainingCategories = [
    { id: 'fitness', name: 'Фитнес', icon: '💪' },
    { id: 'yoga', name: 'Йога', icon: '🧘' },
    { id: 'crossfit', name: 'CrossFit', icon: '🏋️' },
    { id: 'martial_arts', name: 'Боевые искусства', icon: '🥋' },
    { id: 'dancing', name: 'Танцы', icon: '💃' },
    { id: 'swimming', name: 'Плавание', icon: '🏊' },
    { id: 'other', name: 'Другое', icon: '⭐' }
  ];

  const addDirection = () => {
    if (newDirection.name && newDirection.category) {
      const direction: TrainingDirection = {
        id: `dir_${Date.now()}`,
        name: newDirection.name,
        description: newDirection.description,
        category: newDirection.category as any
      };
      
      onUpdate({
        trainingDirections: [...(data.trainingDirections || []), direction]
      });
      
      setNewDirection({});
      setShowDirectionForm(false);
    }
  };

  const addPackage = () => {
    if (newPackage.name && newPackage.price && newPackage.duration) {
      const servicePackage: ServicePackage = {
        id: `pkg_${Date.now()}`,
        name: newPackage.name,
        description: newPackage.description || '',
        price: Number(newPackage.price),
        currency: 'KZT',
        duration: Number(newPackage.duration),
        sessionsCount: Number(newPackage.sessionsCount) || 1,
        validityPeriod: Number(newPackage.validityPeriod) || 30,
        isActive: true
      };
      
      onUpdate({
        servicePackages: [...(data.servicePackages || []), servicePackage]
      });
      
      setNewPackage({});
      setShowPackageForm(false);
    }
  };

  const removeDirection = (id: string) => {
    onUpdate({
      trainingDirections: data.trainingDirections?.filter(d => d.id !== id)
    });
  };

  const removePackage = (id: string) => {
    onUpdate({
      servicePackages: data.servicePackages?.filter(p => p.id !== id)
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Направления и услуги</h2>
        <p className="text-gray-600">Добавьте тренировочные направления и пакеты услуг</p>
      </div>

      <div className="space-y-8">
        {/* Training Directions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Направления тренировок</h3>
            <button
              onClick={() => setShowDirectionForm(!showDirectionForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Добавить направление
            </button>
          </div>

          {showDirectionForm && (
            <div className="mb-4 p-4 border border-gray-200 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Название направления"
                  value={newDirection.name || ''}
                  onChange={(e) => setNewDirection({...newDirection, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={newDirection.category || ''}
                  onChange={(e) => setNewDirection({...newDirection, category: e.target.value as any})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Выберите категорию</option>
                  {trainingCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Описание направления"
                value={newDirection.description || ''}
                onChange={(e) => setNewDirection({...newDirection, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                rows={3}
              />
              <div className="flex space-x-2">
                <button onClick={addDirection} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Добавить
                </button>
                <button onClick={() => setShowDirectionForm(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  Отмена
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.trainingDirections?.map(direction => {
              const category = trainingCategories.find(cat => cat.id === direction.category);
              return (
                <div key={direction.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category?.icon}</span>
                      <h4 className="font-semibold text-gray-800">{direction.name}</h4>
                    </div>
                    <button onClick={() => removeDirection(direction.id)} className="text-red-500 hover:text-red-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {direction.description && (
                    <p className="text-sm text-gray-600">{direction.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Packages */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Пакеты услуг</h3>
            <button
              onClick={() => setShowPackageForm(!showPackageForm)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Добавить пакет
            </button>
          </div>

          {showPackageForm && (
            <div className="mb-4 p-4 border border-gray-200 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Название пакета"
                  value={newPackage.name || ''}
                  onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Цена (KZT)"
                  value={newPackage.price || ''}
                  onChange={(e) => setNewPackage({...newPackage, price: Number(e.target.value)})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Длительность (мин)"
                  value={newPackage.duration || ''}
                  onChange={(e) => setNewPackage({...newPackage, duration: Number(e.target.value)})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="number"
                  placeholder="Количество занятий"
                  value={newPackage.sessionsCount || ''}
                  onChange={(e) => setNewPackage({...newPackage, sessionsCount: Number(e.target.value)})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Срок действия (дни)"
                  value={newPackage.validityPeriod || ''}
                  onChange={(e) => setNewPackage({...newPackage, validityPeriod: Number(e.target.value)})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <textarea
                placeholder="Описание пакета"
                value={newPackage.description || ''}
                onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                rows={3}
              />
              <div className="flex space-x-2">
                <button onClick={addPackage} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Добавить
                </button>
                <button onClick={() => setShowPackageForm(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  Отмена
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.servicePackages?.map(pkg => (
              <div key={pkg.id} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{pkg.name}</h4>
                  <button onClick={() => removePackage(pkg.id)} className="text-red-500 hover:text-red-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-lg font-bold text-purple-600 mb-2">{pkg.price.toLocaleString()} {pkg.currency}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• {pkg.duration} минут</p>
                  <p>• {pkg.sessionsCount} занятий</p>
                  <p>• Действует {pkg.validityPeriod} дней</p>
                  {pkg.description && <p className="mt-2">{pkg.description}</p>}
                </div>
              </div>
            ))}
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
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
};

export default ServicesStep;