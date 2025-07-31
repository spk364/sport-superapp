import React, { useState, useMemo } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ScheduledIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';
import { Workout, CalendarFilters } from '../../types';

type ViewMode = 'day' | 'week' | 'month';

interface DashboardCalendarProps {
  filters?: CalendarFilters;
  showFilters?: boolean;
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({ 
  filters: externalFilters,
  showFilters = false 
}) => {
  const workouts = useAppStore((state) => state.workouts);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  
  // Internal filters state (used when no external filters provided)
  const [internalFilters, setInternalFilters] = useState<CalendarFilters>({
    workoutTypes: [],
    statuses: [],
    trainers: [],
    dateRange: {},
    locations: [],
    timeOfDay: [],
  });

  // Use external filters if provided, otherwise use internal filters
  const activeFilters = externalFilters || internalFilters;
  const setActiveFilters = externalFilters ? () => {} : setInternalFilters;

  // Filter workouts based on active filters
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(workout => {
      // Filter by workout type
      if (activeFilters.workoutTypes.length > 0 && !activeFilters.workoutTypes.includes(workout.type)) {
        return false;
      }

      // Filter by status
      if (activeFilters.statuses.length > 0 && !activeFilters.statuses.includes(workout.status)) {
        return false;
      }

      // Filter by trainer
      if (activeFilters.trainers.length > 0 && !activeFilters.trainers.includes(workout.trainer.id)) {
        return false;
      }

      // Filter by location
      if (activeFilters.locations.length > 0 && !activeFilters.locations.includes(workout.location)) {
        return false;
      }

      // Filter by time of day
      if (activeFilters.timeOfDay.length > 0) {
        const hour = new Date(workout.date).getHours();
        let timeOfDay: string;
        if (hour < 12) timeOfDay = 'morning';
        else if (hour < 17) timeOfDay = 'afternoon';
        else timeOfDay = 'evening';
        
        if (!activeFilters.timeOfDay.includes(timeOfDay as any)) {
          return false;
        }
      }

      // Filter by date range
      if (activeFilters.dateRange.startDate || activeFilters.dateRange.endDate) {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0); // Reset time for date comparison
        
        if (activeFilters.dateRange.startDate) {
          const startDate = new Date(activeFilters.dateRange.startDate);
          startDate.setHours(0, 0, 0, 0);
          if (workoutDate < startDate) return false;
        }
        
        if (activeFilters.dateRange.endDate) {
          const endDate = new Date(activeFilters.dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (workoutDate > endDate) return false;
        }
      }

      return true;
    });
  }, [workouts, activeFilters]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setSelectedDate(newDate);
  };

  const getWorkoutsForDate = (date: Date) => {
    return filteredWorkouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate.toDateString() === date.toDateString();
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircleIcon;
      case 'scheduled': return ScheduledIcon;
      case 'cancelled': return XCircleIcon;
      case 'missed': return ExclamationTriangleIcon;
      default: return ScheduledIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'missed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Выполнено';
      case 'scheduled': return 'Запланировано';
      case 'cancelled': return 'Отменено';
      case 'missed': return 'Пропущено';
      default: return 'Неизвестно';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDateHeader = () => {
    if (viewMode === 'day') {
      return selectedDate.toLocaleDateString('ru-RU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(selectedDate);
      const day = selectedDate.getDay();
      const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      return selectedDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    }
  };

  const renderDayView = () => {
    const dayWorkouts = getWorkoutsForDate(selectedDate);
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {dayWorkouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarDaysIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Нет тренировок на этот день</p>
            </div>
          ) : (
            dayWorkouts.map((workout) => (
              <div
                key={workout.id}
                onClick={() => setSelectedWorkout(workout)}
                className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{workout.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workout.status)}`}>
                    {getStatusText(workout.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{new Date(workout.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{workout.location}</span>
                  </div>
                  {workout.trainer && (
                    <div className="flex items-center space-x-1">
                      <UserIcon className="h-4 w-4" />
                      <span>{workout.trainer.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    const day = selectedDate.getDay();
    const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => {
          const dayWorkouts = getWorkoutsForDate(date);
          const today = isToday(date);
          
          return (
            <div key={index} className="space-y-2">
              <div className={`text-center p-2 rounded-lg ${today ? 'bg-primary-100 text-primary-700' : 'bg-gray-50'}`}>
                <div className="text-xs font-medium">
                  {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                </div>
                <div className={`text-lg ${today ? 'font-bold' : 'font-medium'}`}>
                  {date.getDate()}
                </div>
              </div>
              <div className="space-y-1">
                {dayWorkouts.slice(0, 3).map((workout) => (
                  <div
                    key={workout.id}
                    onClick={() => setSelectedWorkout(workout)}
                    className={`p-2 rounded text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(workout.status)}`}
                  >
                    <div className="truncate">{workout.name}</div>
                    <div className="text-xs opacity-80">
                      {new Date(workout.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                {dayWorkouts.length > 3 && (
                  <div className="text-xs text-gray-600 text-center">
                    +{dayWorkouts.length - 3} еще
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
    const correctFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < correctFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dayWorkouts = getWorkoutsForDate(date);
      const today = isToday(date);
      
      days.push(
        <div
          key={day}
          className={`h-20 p-1 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
            today ? 'bg-primary-50 border-primary-200' : ''
          }`}
          onClick={() => {
            setSelectedDate(date);
            if (dayWorkouts.length === 1) {
              setSelectedWorkout(dayWorkouts[0]);
            }
          }}
        >
          <div className={`text-sm mb-1 ${today ? 'font-bold text-primary-700' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayWorkouts.slice(0, 2).map((workout, index) => (
              <div
                key={index}
                className={`w-full h-4 rounded text-xs px-1 truncate ${getStatusColor(workout.status)}`}
                title={workout.name}
              >
                {workout.name}
              </div>
            ))}
            {dayWorkouts.length > 2 && (
              <div className="text-xs text-gray-600 text-center">
                +{dayWorkouts.length - 2}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(dayName => (
            <div key={dayName} className="h-8 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500">{dayName}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button onClick={() => navigateDate('prev')} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 capitalize min-w-0">
              {formatDateHeader()}
            </h2>
            <button onClick={() => navigateDate('next')} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode === 'day' ? 'День' : mode === 'week' ? 'Неделя' : 'Месяц'}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Content */}
        <div className="min-h-[300px]">
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Запланировано</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Выполнено</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Отменено</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Пропущено</span>
          </div>
        </div>
      </div>

      {/* Workout Details Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{selectedWorkout.name}</h3>
              <button 
                onClick={() => setSelectedWorkout(null)} 
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Статус:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedWorkout.status)}`}>
                  {getStatusText(selectedWorkout.status)}
                </span>
              </div>

              {/* Date and Time */}
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedWorkout.date).toLocaleDateString('ru-RU', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedWorkout.date).toLocaleTimeString('ru-RU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} • {selectedWorkout.duration} минут
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-900">{selectedWorkout.location}</p>
              </div>

              {/* Trainer */}
              {selectedWorkout.trainer && (
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedWorkout.trainer.name}</p>
                    <p className="text-sm text-gray-600">Тренер</p>
                  </div>
                </div>
              )}

              {/* Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Тип тренировки:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {selectedWorkout.type === 'strength' ? 'Силовая' : 
                   selectedWorkout.type === 'cardio' ? 'Кардио' : 
                   selectedWorkout.type === 'flexibility' ? 'Растяжка' : selectedWorkout.type}
                </span>
              </div>

              {/* Description */}
              {selectedWorkout.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Описание</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedWorkout.description}</p>
                </div>
              )}

              {/* Exercises */}
              {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Упражнения</h4>
                  <div className="space-y-2">
                    {selectedWorkout.exercises.map((exercise) => (
                      <div key={exercise.id} className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{exercise.name}</p>
                        <p className="text-xs text-gray-600">
                          {exercise.sets} подходов × {exercise.reps} повторений
                          {exercise.weight && ` • ${exercise.weight}кг`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 