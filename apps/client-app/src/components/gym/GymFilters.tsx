import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Filter, 
  Star, 
  DollarSign, 
  X, 
  ChevronDown,
  Search
} from 'lucide-react';
import { GymFilters as GymFiltersType, GymSportType, FilterOption } from '../../types';

interface GymFiltersProps {
  filters: GymFiltersType;
  onFiltersChange: (filters: GymFiltersType) => void;
  availableFilters?: {
    sportTypes: FilterOption[];
    cities: FilterOption[];
    districts: FilterOption[];
    amenities: FilterOption[];
    priceRanges: FilterOption[];
  };
  onLocationSearch?: (query: string) => void;
  isLoading?: boolean;
}

interface FilterSection {
  title: string;
  isOpen: boolean;
}

const GymFilters: React.FC<GymFiltersProps> = ({
  filters,
  onFiltersChange,
  availableFilters,
  onLocationSearch,
  isLoading
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [sections, setSections] = useState<Record<string, boolean>>({
    location: true,
    sportTypes: true,
    priceRange: true,
    rating: false,
    amenities: false
  });

  const sportTypeLabels: Record<GymSportType, string> = {
    bjj: 'BJJ',
    boxing: 'Бокс',
    mma: 'MMA',
    muay_thai: 'Муай Тай',
    kickboxing: 'Кикбоксинг',
    judo: 'Дзюдо',
    karate: 'Карате',
    taekwondo: 'Тхэквондо',
    wrestling: 'Борьба',
    jiu_jitsu: 'Джиу-джитсу',
    strength_training: 'Силовые тренировки',
    cardio: 'Кардио',
    crossfit: 'CrossFit',
    yoga: 'Йога',
    pilates: 'Пилатес',
    swimming: 'Плавание',
    other: 'Другое'
  };

  const toggleSection = (section: string) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSportTypeToggle = (sportType: GymSportType) => {
    const newSportTypes = filters.sportTypes.includes(sportType)
      ? filters.sportTypes.filter(type => type !== sportType)
      : [...filters.sportTypes, sportType];

    onFiltersChange({
      ...filters,
      sportTypes: newSportTypes
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: { min, max }
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating: filters.rating === rating ? undefined : rating
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];

    onFiltersChange({
      ...filters,
      amenities: newAmenities
    });
  };

  const handleLocationChange = (city: string, district?: string) => {
    onFiltersChange({
      ...filters,
      location: {
        ...filters.location,
        city,
        district
      }
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      location: {},
      sportTypes: [],
      priceRange: { min: 0, max: 100000 },
      amenities: [],
      sortBy: 'rating'
    });
    setLocationQuery('');
  };

  const activeFiltersCount = 
    filters.sportTypes.length + 
    filters.amenities.length + 
    (filters.location?.city ? 1 : 0) + 
    (filters.rating ? 1 : 0) +
    (filters.priceRange.min > 0 || filters.priceRange.max < 100000 ? 1 : 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full flex items-center justify-between p-4 border-b border-gray-100"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">Фильтры</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters Content */}
      <div className={`${isFiltersOpen ? 'block' : 'hidden'} md:block`}>
        <div className="p-4 space-y-6">
          {/* Header for Desktop */}
          <div className="hidden md:flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Очистить все
              </button>
            )}
          </div>

          {/* Location Filter */}
          <div>
            <button
              onClick={() => toggleSection('location')}
              className="w-full flex items-center justify-between mb-3"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">Местоположение</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${sections.location ? 'rotate-180' : ''}`} />
            </button>

            {sections.location && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по адресу..."
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      onLocationSearch?.(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {availableFilters?.cities && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                    <select
                      value={filters.location?.city || ''}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Все города</option>
                      {availableFilters.cities.map(city => (
                        <option key={city.value} value={city.value}>
                          {city.label} ({city.count})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {filters.location?.city && availableFilters?.districts && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Район</label>
                    <select
                      value={filters.location?.district || ''}
                      onChange={(e) => handleLocationChange(filters.location!.city!, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Все районы</option>
                      {availableFilters.districts.map(district => (
                        <option key={district.value} value={district.value}>
                          {district.label} ({district.count})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sport Types Filter */}
          <div>
            <button
              onClick={() => toggleSection('sportTypes')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="font-medium text-gray-900">Виды спорта</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${sections.sportTypes ? 'rotate-180' : ''}`} />
            </button>

            {sections.sportTypes && (
              <div className="space-y-2">
                {availableFilters?.sportTypes?.map(sportType => (
                  <label key={sportType.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.sportTypes.includes(sportType.value as GymSportType)}
                      onChange={() => handleSportTypeToggle(sportType.value as GymSportType)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {sportType.label} ({sportType.count})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div>
            <button
              onClick={() => toggleSection('priceRange')}
              className="w-full flex items-center justify-between mb-3"
            >
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">Цена</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${sections.priceRange ? 'rotate-180' : ''}`} />
            </button>

            {sections.priceRange && availableFilters?.priceRanges && (
              <div className="space-y-2">
                {availableFilters.priceRanges.map(range => {
                  const [min, max] = range.value === '35000+' 
                    ? [35000, 100000]
                    : range.value.split('-').map(Number);
                  
                  const isSelected = filters.priceRange.min === min && filters.priceRange.max === (max || 100000);
                  
                  return (
                    <label key={range.value} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={isSelected}
                        onChange={() => handlePriceRangeChange(min, max || 100000)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {range.label} ({range.count})
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rating Filter */}
          <div>
            <button
              onClick={() => toggleSection('rating')}
              className="w-full flex items-center justify-between mb-3"
            >
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">Рейтинг</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${sections.rating ? 'rotate-180' : ''}`} />
            </button>

            {sections.rating && (
              <div className="space-y-2">
                {[4.5, 4.0, 3.5, 3.0].map(rating => (
                  <label key={rating} className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === rating}
                      onChange={() => handleRatingChange(rating)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-2 flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-700">{rating}+</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Amenities Filter */}
          <div>
            <button
              onClick={() => toggleSection('amenities')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="font-medium text-gray-900">Удобства</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${sections.amenities ? 'rotate-180' : ''}`} />
            </button>

            {sections.amenities && availableFilters?.amenities && (
              <div className="space-y-2">
                {availableFilters.amenities.map(amenity => (
                  <label key={amenity.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity.value)}
                      onChange={() => handleAmenityToggle(amenity.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {amenity.label} ({amenity.count})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Clear Button */}
          <div className="md:hidden pt-4 border-t border-gray-100">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Очистить все фильтры
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymFilters;