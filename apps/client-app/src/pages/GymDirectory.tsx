import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store';
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3,
  List,
  MapPin,
  Loader2
} from 'lucide-react';
import { GymFilters, GymCard } from '../components/gym';
import { gymService } from '../services/gymService';
import { 
  GymFilters as GymFiltersType, 
  GymSearchParams, 
  GymSearchResult,
  Gym
} from '../types';

const GymDirectory: React.FC = () => {
  const navigateToGymDetail = useAppStore(state => state.navigateToGymDetail);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GymSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [availableFilters, setAvailableFilters] = useState<any>(null);

  const [filters, setFilters] = useState<GymFiltersType>({
    location: {},
    sportTypes: [],
    priceRange: { min: 0, max: 100000 },
    amenities: [],
    sortBy: 'rating'
  });

  const searchParams: GymSearchParams = useMemo(() => ({
    query: searchQuery,
    filters,
    page: currentPage,
    limit: 12
  }), [searchQuery, filters, currentPage]);

  // Load available filters on component mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filters = await gymService.getAvailableFilters();
        setAvailableFilters(filters);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };

    loadFilters();
  }, []);

  // Search gyms when parameters change
  useEffect(() => {
    const searchGyms = async () => {
      setIsLoading(true);
      try {
        const results = await gymService.searchGyms(searchParams);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching gyms:', error);
        // Handle error (you might want to show a toast notification)
      } finally {
        setIsLoading(false);
      }
    };

    searchGyms();
  }, [searchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleFiltersChange = (newFilters: GymFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSortChange = (sortBy: GymFiltersType['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGymClick = (gymId: string) => {
    navigateToGymDetail(gymId);
  };

  const handleCallClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWebsiteClick = (website: string) => {
    window.open(website, '_blank', 'noopener,noreferrer');
  };

  const handleLocationSearch = (query: string) => {
    // Implement location search logic here
    console.log('Location search:', query);
  };

  const sortOptions = [
    { value: 'rating', label: 'По рейтингу' },
    { value: 'distance', label: 'По расстоянию' },
    { value: 'price_low', label: 'Сначала дешевые' },
    { value: 'price_high', label: 'Сначала дорогие' },
    { value: 'name', label: 'По названию' },
    { value: 'newest', label: 'Новые' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Спортзалы</h1>
              <p className="text-gray-600">
                {searchResults ? `Найдено ${searchResults.total} спортзалов` : 'Поиск спортзалов'}
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md lg:max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск спортзалов..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${isFiltersVisible ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-6">
              <GymFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                availableFilters={availableFilters}
                onLocationSearch={handleLocationSearch}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Фильтры</span>
                </button>

                {/* Sort */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value as GymFiltersType['sortBy'])}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center space-x-2 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Поиск спортзалов...</span>
              </div>
            )}

            {/* Results */}
            {!isLoading && searchResults && (
              <>
                {searchResults.gyms.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Спортзалы не найдены
                    </h3>
                    <p className="text-gray-600">
                      Попробуйте изменить параметры поиска или фильтры
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Gym Grid/List */}
                    <div className={`grid gap-6 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                        : 'grid-cols-1'
                    }`}>
                      {searchResults.gyms.map(gym => (
                        <GymCard
                          key={gym.id}
                          gym={gym}
                          onCardClick={handleGymClick}
                          onCallClick={handleCallClick}
                          onWebsiteClick={handleWebsiteClick}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {searchResults.totalPages > 1 && (
                      <div className="flex items-center justify-center mt-8 space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Назад
                        </button>
                        
                        {Array.from({ length: searchResults.totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 border rounded-lg ${
                              currentPage === page
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === searchResults.totalPages}
                          className="px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Вперед
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymDirectory;