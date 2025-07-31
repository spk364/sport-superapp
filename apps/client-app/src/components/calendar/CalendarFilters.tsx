import React, { useState } from 'react';
import {
  FunnelIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { CalendarFilters, FilterOption, Workout } from '../../types';

interface CalendarFiltersProps {
  workouts: Workout[];
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
  filteredCount: number;
  totalCount: number;
}

export const CalendarFiltersComponent: React.FC<CalendarFiltersProps> = ({
  workouts,
  filters,
  onFiltersChange,
  filteredCount,
  totalCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate filter options from existing workouts
  const getWorkoutTypeOptions = (): FilterOption[] => {
    const typeMap = new Map<string, number>();
    workouts.forEach(workout => {
      typeMap.set(workout.type, (typeMap.get(workout.type) || 0) + 1);
    });

    return [
      { value: 'strength', label: 'Силовая', count: typeMap.get('strength') || 0 },
      { value: 'cardio', label: 'Кардио', count: typeMap.get('cardio') || 0 },
      { value: 'flexibility', label: 'Растяжка', count: typeMap.get('flexibility') || 0 },
      { value: 'group', label: 'Групповая', count: typeMap.get('group') || 0 },
      { value: 'personal', label: 'Персональная', count: typeMap.get('personal') || 0 },
    ].filter(option => option.count > 0);
  };

  const getStatusOptions = (): FilterOption[] => {
    const statusMap = new Map<string, number>();
    workouts.forEach(workout => {
      statusMap.set(workout.status, (statusMap.get(workout.status) || 0) + 1);
    });

    return [
      { value: 'scheduled', label: 'Запланировано', count: statusMap.get('scheduled') || 0 },
      { value: 'completed', label: 'Выполнено', count: statusMap.get('completed') || 0 },
      { value: 'cancelled', label: 'Отменено', count: statusMap.get('cancelled') || 0 },
      { value: 'missed', label: 'Пропущено', count: statusMap.get('missed') || 0 },
    ].filter(option => option.count > 0);
  };

  const getTrainerOptions = (): FilterOption[] => {
    const trainerMap = new Map<string, { name: string; count: number }>();
    workouts.forEach(workout => {
      if (workout.trainer) {
        const existing = trainerMap.get(workout.trainer.id);
        trainerMap.set(workout.trainer.id, {
          name: workout.trainer.name,
          count: (existing?.count || 0) + 1,
        });
      }
    });

    return Array.from(trainerMap.entries()).map(([id, data]) => ({
      value: id,
      label: data.name,
      count: data.count,
    }));
  };

  const getLocationOptions = (): FilterOption[] => {
    const locationMap = new Map<string, number>();
    workouts.forEach(workout => {
      locationMap.set(workout.location, (locationMap.get(workout.location) || 0) + 1);
    });

    return Array.from(locationMap.entries()).map(([location, count]) => ({
      value: location,
      label: location,
      count,
    }));
  };

  const getTimeOfDayOptions = (): FilterOption[] => {
    const timeMap = new Map<string, number>();
    workouts.forEach(workout => {
      const hour = new Date(workout.date).getHours();
      let timeOfDay: string;
      if (hour < 12) timeOfDay = 'morning';
      else if (hour < 17) timeOfDay = 'afternoon';
      else timeOfDay = 'evening';
      
      timeMap.set(timeOfDay, (timeMap.get(timeOfDay) || 0) + 1);
    });

    return [
      { value: 'morning', label: 'Утром (до 12:00)', count: timeMap.get('morning') || 0 },
      { value: 'afternoon', label: 'Днём (12:00-17:00)', count: timeMap.get('afternoon') || 0 },
      { value: 'evening', label: 'Вечером (после 17:00)', count: timeMap.get('evening') || 0 },
    ].filter(option => option.count > 0);
  };

  const handleFilterChange = (
    filterType: keyof CalendarFilters,
    value: string,
    checked: boolean
  ) => {
    const newFilters = { ...filters };
    
    if (filterType === 'workoutTypes') {
      if (checked) {
        newFilters.workoutTypes = [...filters.workoutTypes, value as any];
      } else {
        newFilters.workoutTypes = filters.workoutTypes.filter(type => type !== value);
      }
    } else if (filterType === 'statuses') {
      if (checked) {
        newFilters.statuses = [...filters.statuses, value as any];
      } else {
        newFilters.statuses = filters.statuses.filter(status => status !== value);
      }
    } else if (filterType === 'trainers') {
      if (checked) {
        newFilters.trainers = [...filters.trainers, value];
      } else {
        newFilters.trainers = filters.trainers.filter(trainer => trainer !== value);
      }
    } else if (filterType === 'locations') {
      if (checked) {
        newFilters.locations = [...filters.locations, value];
      } else {
        newFilters.locations = filters.locations.filter(location => location !== value);
      }
    } else if (filterType === 'timeOfDay') {
      if (checked) {
        newFilters.timeOfDay = [...filters.timeOfDay, value as any];
      } else {
        newFilters.timeOfDay = filters.timeOfDay.filter(time => time !== value);
      }
    }
    
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters.dateRange = {
        ...newFilters.dateRange,
        [field]: new Date(value),
      };
    } else {
      newFilters.dateRange = {
        ...newFilters.dateRange,
        [field]: undefined,
      };
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      workoutTypes: [],
      statuses: [],
      trainers: [],
      dateRange: {},
      locations: [],
      timeOfDay: [],
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.workoutTypes.length > 0 ||
      filters.statuses.length > 0 ||
      filters.trainers.length > 0 ||
      filters.locations.length > 0 ||
      filters.timeOfDay.length > 0 ||
      filters.dateRange.startDate ||
      filters.dateRange.endDate
    );
  };

  const FilterSection: React.FC<{
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    options: FilterOption[];
    selectedValues: string[];
    filterType: keyof CalendarFilters;
  }> = ({ title, icon: Icon, options, selectedValues, filterType }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      </div>
      <div className="space-y-1 pl-6">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={(e) => handleFilterChange(filterType, option.value, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">{option.label}</span>
            <span className="text-xs text-gray-400">({option.count})</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Фильтры</h3>
            {hasActiveFilters() && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filteredCount} из {totalCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Сбросить всё
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">Период</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 pl-6">
              <div>
                <label className="block text-xs text-gray-600 mb-1">От</label>
                <input
                  type="date"
                  value={filters.dateRange.startDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">До</label>
                <input
                  type="date"
                  value={filters.dateRange.endDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Workout Type Filter */}
          <FilterSection
            title="Тип тренировки"
            icon={CheckIcon}
            options={getWorkoutTypeOptions()}
            selectedValues={filters.workoutTypes}
            filterType="workoutTypes"
          />

          {/* Status Filter */}
          <FilterSection
            title="Статус"
            icon={CheckIcon}
            options={getStatusOptions()}
            selectedValues={filters.statuses}
            filterType="statuses"
          />

          {/* Trainer Filter */}
          <FilterSection
            title="Тренер"
            icon={UserIcon}
            options={getTrainerOptions()}
            selectedValues={filters.trainers}
            filterType="trainers"
          />

          {/* Location Filter */}
          <FilterSection
            title="Место"
            icon={MapPinIcon}
            options={getLocationOptions()}
            selectedValues={filters.locations}
            filterType="locations"
          />

          {/* Time of Day Filter */}
          <FilterSection
            title="Время дня"
            icon={ClockIcon}
            options={getTimeOfDayOptions()}
            selectedValues={filters.timeOfDay}
            filterType="timeOfDay"
          />
        </div>
      )}
    </div>
  );
};