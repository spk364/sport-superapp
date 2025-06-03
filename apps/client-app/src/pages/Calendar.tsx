import React, { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Header } from '../components/common/Header';
import { useAppStore } from '../store';

export const Calendar: React.FC = () => {
  const { workouts, setCurrentPage } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const monthName = selectedDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getWorkoutsForDate = (day: number) => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'missed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayWorkouts = getWorkoutsForDate(day);
      const today = isToday(day);

      days.push(
        <div
          key={day}
          className={`h-12 flex flex-col items-center justify-center relative cursor-pointer rounded-lg transition-colors ${
            today ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
          }`}
          onClick={() => {
            if (dayWorkouts.length === 1) {
              setSelectedWorkout(dayWorkouts[0]);
            }
          }}
        >
          <span className={`text-sm ${today ? 'font-bold' : ''}`}>{day}</span>
          {dayWorkouts.length > 0 && (
            <div className="flex space-x-1 mt-1">
              {dayWorkouts.slice(0, 3).map((workout, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${getStatusColor(workout.status)}`}
                />
              ))}
              {dayWorkouts.length > 3 && (
                <span className="text-xs text-gray-600">+{dayWorkouts.length - 3}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Календарь" />
      
      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Month Navigation */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateMonth('prev')}>
              <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {monthName}
            </h2>
            <button onClick={() => navigateMonth('next')}>
              <ChevronRightIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week days header */}
            {weekDays.map(day => (
              <div key={day} className="h-8 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">{day}</span>
              </div>
            ))}
            
            {/* Calendar days */}
            {renderCalendarDays()}
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
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentPage('workout-program')}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-lg text-center"
          >
            <div className="text-lg font-semibold">Программа</div>
            <div className="text-sm opacity-90">Моя программа тренировок</div>
          </button>
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
            <div className="text-lg font-semibold">Не приду</div>
            <div className="text-sm opacity-90">Отметить пропуск</div>
          </button>
        </div>
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedWorkout.title}
              </h3>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedWorkout.date).toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedWorkout.date).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} ({selectedWorkout.duration} мин)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <p className="text-sm text-gray-600">{selectedWorkout.location}</p>
              </div>

              {selectedWorkout.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Описание</h4>
                  <p className="text-sm text-gray-600">{selectedWorkout.description}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedWorkout.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedWorkout.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  selectedWorkout.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedWorkout.status === 'completed' ? 'Выполнено' :
                   selectedWorkout.status === 'scheduled' ? 'Запланировано' :
                   selectedWorkout.status === 'cancelled' ? 'Отменено' : 'Пропущено'}
                </span>
                
                {selectedWorkout.status === 'scheduled' && (
                  <button className="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-md hover:bg-orange-200">
                    Не приду
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 