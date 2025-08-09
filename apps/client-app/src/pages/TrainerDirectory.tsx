import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Clock, Phone } from 'lucide-react';
import TrainerCard from '../components/trainer/TrainerCard';
import { Trainer, TrainerFilters, TrainerSearchResult } from '../types';
import { trainerService } from '../services/trainerService';

const TrainerDirectory: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TrainerFilters>({
    specializations: [],
    experience: { min: 0, max: 20 },
    rating: 0,
    priceRange: { min: 0, max: 50000 },
    sessionType: [],
    languages: [],
    sortBy: 'rating'
  });
  const [searchResult, setSearchResult] = useState<TrainerSearchResult | null>(null);

  useEffect(() => {
    fetchTrainers();
  }, [searchQuery, filters]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const result = await trainerService.searchTrainers({
        query: searchQuery,
        filters,
        page: 1,
        limit: 20
      });
      setSearchResult(result);
      setTrainers(result.trainers);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: Partial<TrainerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      specializations: [],
      experience: { min: 0, max: 20 },
      rating: 0,
      priceRange: { min: 0, max: 50000 },
      sessionType: [],
      languages: [],
      sortBy: 'rating'
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Найти тренера</h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по имени, специализации..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Фильтры</span>
            </button>
            
            {searchResult && (
              <span className="text-sm text-gray-600">
                Найдено: {searchResult.total} тренеров
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b px-4 py-6">
          <div className="space-y-4">
            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Специализация
              </label>
              <div className="flex flex-wrap gap-2">
                {['strength_training', 'yoga', 'boxing', 'cardio', 'pilates'].map((spec) => (
                  <button
                    key={spec}
                    onClick={() => {
                      const newSpecs = filters.specializations.includes(spec as any)
                        ? filters.specializations.filter(s => s !== spec)
                        : [...filters.specializations, spec as any];
                      handleFilterChange({ specializations: newSpecs });
                    }}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      filters.specializations.includes(spec as any)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {spec.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Минимальный рейтинг
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange({ rating: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value={0}>Любой</option>
                <option value={4}>4+ звезд</option>
                <option value={4.5}>4.5+ звезд</option>
                <option value={5}>5 звезд</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сортировать по
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="rating">Рейтинг</option>
                <option value="experience">Опыт</option>
                <option value="price_low">Цена (по возрастанию)</option>
                <option value="price_high">Цена (по убыванию)</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Сбросить
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : trainers.length > 0 ? (
          <div className="space-y-4">
            {trainers.map((trainer) => (
              <TrainerCard 
                key={trainer.id} 
                trainer={trainer} 
                onClick={(trainerId) => {
                  // Navigate to trainer detail page
                  console.log('Navigate to trainer:', trainerId);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Тренеры не найдены
            </h3>
            <p className="text-gray-600">
              Попробуйте изменить параметры поиска или фильтры
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerDirectory;
