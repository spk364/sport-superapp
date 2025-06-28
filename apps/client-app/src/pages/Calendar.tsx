import React from 'react';
import { DashboardCalendar } from '../components/dashboard/DashboardCalendar';

export const Calendar: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Календарь тренировок</h1>
          <p className="text-gray-600">
            Планируйте и отслеживайте свои тренировки в удобном календарном формате
          </p>
        </div>
        
        {/* Full Calendar Component */}
        <DashboardCalendar />
        
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Статистика тренировок</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Выполнено в этом месяце</span>
                <span className="text-sm font-semibold text-green-600">12 тренировок</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Запланировано на эту неделю</span>
                <span className="text-sm font-semibold text-blue-600">3 тренировки</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Средняя продолжительность</span>
                <span className="text-sm font-semibold text-gray-900">52 минуты</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Любимый тип тренировок</span>
                <span className="text-sm font-semibold text-purple-600">Силовая</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 