import React from 'react';
import { X, MapPin, Star, DollarSign, Clock, Users } from 'lucide-react';
import { TrainerFilters as TrainerFiltersType, TrainerSpecialization } from '../../types';

interface TrainerFiltersProps {
  filters: TrainerFiltersType;
  onFiltersChange: (filters: Partial<TrainerFiltersType>) => void;
  onClose: () => void;
  isOpen: boolean;
}

const SPECIALIZATION_LABELS: Record<TrainerSpecialization, string> = {
  strength_training: 'Силовые тренировки',
  cardio: 'Кардио',
  yoga: 'Йога',
  pilates: 'Пилатес',
  martial_arts: 'Боевые искусства',
  boxing: 'Бокс',
  swimming: 'Плавание',
  running: 'Бег',
  crossfit: 'Кроссфит',
  bodybuilding: 'Бодибилдинг',
  powerlifting: 'Пауэрлифтинг',
  gymnastics: 'Гимнастика',
  dance: 'Танцы',
  stretching: 'Растяжка',
  rehabilitation: 'Реабилитация',
  nutrition: 'Питание',
  weight_loss: 'Похудение',
  muscle_gain: 'Набор массы',
  flexibility: 'Гибкость',
  endurance: 'Выносливость',
  sports_specific: 'Спортивная подготовка',
  senior_fitness: 'Фитнес для пожилых',
  prenatal_postnatal: 'Для беременных',
  kids_fitness: 'Детский фитнес',
  functional_fitness: 'Функциональный фитнес',
  meditation: 'Медитация',
  other: 'Другое'
};

const TrainerFilters: React.FC<TrainerFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
  isOpen
}) => {
  if (!isOpen) return null;

  const handleSpecializationToggle = (spec: TrainerSpecialization) => {
    const newSpecs = filters.specializations.includes(spec)
      ? filters.specializations.filter(s => s !== spec)
      : [...filters.specializations, spec];
    
    onFiltersChange({ specializations: newSpecs });
  };

  const handleSessionTypeToggle = (type: 'personal' | 'group' | 'online') => {
    const newTypes = filters.sessionType.includes(type)
      ? filters.sessionType.filter(t => t !== type)
      : [...filters.sessionType, type];
    
    onFiltersChange({ sessionType: newTypes });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      specializations: [],
      experience: { min: 0, max: 20 },
      rating: 0,
      priceRange: { min: 0, max: 50000 },
      sessionType: [],
      languages: [],
      city: '',
      verified: undefined,
      featured: undefined,
      sortBy: 'rating'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full max-h-[90vh] rounded-t-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Фильтры</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-6">
          {/* Specializations */}
          <div>
            <h3 className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-3">
              <Users className="w-4 h-4" />
              <span>Специализация</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SPECIALIZATION_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleSpecializationToggle(key as TrainerSpecialization)}
                  className={`text-left p-2 rounded-lg text-xs border ${
                    filters.specializations.includes(key as TrainerSpecialization)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-3">
              <Clock className="w-4 h-4" />
              <span>Опыт работы (лет)</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">От</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={filters.experience.min}
                  onChange={(e) => onFiltersChange({
                    experience: { ...filters.experience, min: Number(e.target.value) }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">До</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={filters.experience.max}
                  onChange={(e) => onFiltersChange({
                    experience: { ...filters.experience, max: Number(e.target.value) }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-3">
              <Star className="w-4 h-4" />
              <span>Минимальный рейтинг</span>
            </h3>
            <div className="flex space-x-2">
              {[0, 3, 4, 4.5, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onFiltersChange({ rating })}
                  className={`flex-1 p-2 rounded-lg text-xs border ${
                    filters.rating === rating
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {rating === 0 ? 'Любой' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-3">
              <DollarSign className="w-4 h-4" />
              <span>Цена за тренировку (тенге)</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">От</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={filters.priceRange.min}
                  onChange={(e) => onFiltersChange({
                    priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">До</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={filters.priceRange.max}
                  onChange={(e) => onFiltersChange({
                    priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* City */}
          <div>
            <h3 className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-3">
              <MapPin className="w-4 h-4" />
              <span>Город</span>
            </h3>
            <select
              value={filters.city || ''}
              onChange={(e) => onFiltersChange({ city: e.target.value || undefined })}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Любой город</option>
              <option value="Алматы">Алматы</option>
              <option value="Нур-Султан">Нур-Султан</option>
              <option value="Шымкент">Шымкент</option>
              <option value="Караганда">Караганда</option>
              <option value="Актобе">Актобе</option>
            </select>
          </div>

          {/* Session Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Тип тренировок
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'personal', label: 'Персональные' },
                { key: 'group', label: 'Групповые' },
                { key: 'online', label: 'Онлайн' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSessionTypeToggle(key as any)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    filters.sessionType.includes(key as any)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Сортировать по
            </h3>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ sortBy: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="rating">Рейтинг</option>
              <option value="experience">Опыт</option>
              <option value="price_low">Цена (по возрастанию)</option>
              <option value="price_high">Цена (по убыванию)</option>
              <option value="distance">Расстояние</option>
              <option value="response_time">Скорость ответа</option>
            </select>
          </div>

          {/* Special Filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Дополнительно
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.verified || false}
                  onChange={(e) => onFiltersChange({ verified: e.target.checked || undefined })}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Только проверенные</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.featured || false}
                  onChange={(e) => onFiltersChange({ featured: e.target.checked || undefined })}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Топ тренеры</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Сбросить все
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerFilters;
