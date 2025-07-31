import React, { useState } from 'react';
import { DashboardCalendar } from '../components/dashboard/DashboardCalendar';
import { CalendarFiltersComponent } from '../components/calendar';
import { CalendarFilters } from '../types';
import { useAppStore } from '../store';

export const Calendar: React.FC = () => {
  const workouts = useAppStore((state) => state.workouts);
  const [filters, setFilters] = useState<CalendarFilters>({
    workoutTypes: [],
    statuses: [],
    trainers: [],
    dateRange: {},
    locations: [],
    timeOfDay: [],
  });

  // Calculate filtered workout count
  const filteredWorkouts = workouts.filter(workout => {
    // Apply the same filtering logic as in DashboardCalendar
    if (filters.workoutTypes.length > 0 && !filters.workoutTypes.includes(workout.type)) {
      return false;
    }
    if (filters.statuses.length > 0 && !filters.statuses.includes(workout.status)) {
      return false;
    }
    if (filters.trainers.length > 0 && !filters.trainers.includes(workout.trainer.id)) {
      return false;
    }
    if (filters.locations.length > 0 && !filters.locations.includes(workout.location)) {
      return false;
    }
    if (filters.timeOfDay.length > 0) {
      const hour = new Date(workout.date).getHours();
      let timeOfDay: string;
      if (hour < 12) timeOfDay = 'morning';
      else if (hour < 17) timeOfDay = 'afternoon';
      else timeOfDay = 'evening';
      
      if (!filters.timeOfDay.includes(timeOfDay as any)) {
        return false;
      }
    }
    if (filters.dateRange.startDate || filters.dateRange.endDate) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      
      if (filters.dateRange.startDate) {
        const startDate = new Date(filters.dateRange.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (workoutDate < startDate) return false;
      }
      
      if (filters.dateRange.endDate) {
        const endDate = new Date(filters.dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (workoutDate > endDate) return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Календарь тренировок</h1>
          <p className="text-gray-600">
            Планируйте и отслеживайте свои тренировки в удобном календарном формате
          </p>
        </div>
        
        {/* Calendar Filters */}
        <div className="mb-6">
          <CalendarFiltersComponent
            workouts={workouts}
            filters={filters}
            onFiltersChange={setFilters}
            filteredCount={filteredWorkouts.length}
            totalCount={workouts.length}
          />
        </div>
        
        {/* Full Calendar Component */}
        <DashboardCalendar filters={filters} showFilters={true} />
        
        {/* Calendar Legend and Tips */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Как использовать календарь</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Переключайтесь между видами: день, неделя, месяц</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Кликните на тренировку для просмотра деталей</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>В месячном виде кликните на день для быстрого доступа</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Цвета показывают статус: выполнено, запланировано, отменено</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Статистика тренировок
              {filteredWorkouts.length !== workouts.length && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (отфильтровано)
                </span>
              )}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Найдено тренировок</span>
                <span className="text-sm font-semibold text-blue-600">
                  {filteredWorkouts.length} из {workouts.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Выполнено</span>
                <span className="text-sm font-semibold text-green-600">
                  {filteredWorkouts.filter(w => w.status === 'completed').length} тренировок
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Запланировано</span>
                <span className="text-sm font-semibold text-blue-600">
                  {filteredWorkouts.filter(w => w.status === 'scheduled').length} тренировок
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Средняя продолжительность</span>
                <span className="text-sm font-semibold text-gray-900">
                  {filteredWorkouts.length > 0 
                    ? Math.round(filteredWorkouts.reduce((sum, w) => sum + w.duration, 0) / filteredWorkouts.length)
                    : 0
                  } минут
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 