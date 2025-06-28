import React, { useState } from 'react';
import {
  HeartIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ChartBarIcon,
  FireIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { useAppleHealth } from '../../hooks/useAppleHealth';

export const AppleHealthIntegration: React.FC = () => {
  const {
    isAvailable,
    isAuthorized,
    isLoading,
    error,
    healthMetrics,
    lastSyncDate,
    requestPermissions,
    refreshData,
    clearData,
    getStepsToday,
    getCaloriesToday,
    getCurrentWeight,
    getAverageHeartRate,
    getWorkouts,
  } = useAppleHealth();

  const [isExpanded, setIsExpanded] = useState(false);

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      // Автоматически разворачиваем панель после успешной авторизации
      setIsExpanded(true);
    }
  };

  const handleSync = async () => {
    await refreshData();
  };

  const formatSyncTime = (date: Date | null): string => {
    if (!date) return 'Никогда';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} дн назад`;
  };

  const getTodayData = () => {
    const steps = getStepsToday();
    const calories = getCaloriesToday();
    const weight = getCurrentWeight();
    const heartRate = getAverageHeartRate();
    const workouts = getWorkouts(1); // тренировки за сегодня

    return { steps, calories, weight, heartRate, workouts };
  };

  const { steps, calories, weight, heartRate, workouts } = getTodayData();

  if (!isAvailable) {
    return (
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Apple Health</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Apple Health недоступен на этом устройстве или браузере.
        </p>
        <div className="text-xs text-gray-500">
          Для полной интеграции используйте iOS приложение.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <HeartIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Apple Health</h3>
              <p className="text-sm text-gray-600">
                {isAuthorized 
                  ? `Синхронизировано ${formatSyncTime(lastSyncDate)}`
                  : 'Подключите для автоматического импорта данных'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAuthorized && (
              <button
                onClick={handleSync}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {isExpanded ? 'Скрыть' : 'Подробнее'}
            </button>
          </div>
        </div>

        {/* Статус */}
        <div className="mt-3 flex items-center space-x-2">
          {isAuthorized ? (
            <>
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Подключено</span>
            </>
          ) : (
            <>
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-yellow-600">Требуется авторизация</span>
            </>
          )}
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Быстрая статистика */}
      {isAuthorized && !isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{steps.toLocaleString()}</div>
              <div className="text-xs text-gray-600">шагов сегодня</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{calories}</div>
              <div className="text-xs text-gray-600">калорий сегодня</div>
            </div>
          </div>
        </div>
      )}

      {/* Развернутая панель */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {!isAuthorized ? (
            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Предоставьте доступ к данным Apple Health для автоматической синхронизации:
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="h-4 w-4" />
                  <span>Активность</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FireIcon className="h-4 w-4" />
                  <span>Калории</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HeartIcon className="h-4 w-4" />
                  <span>Пульс</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ScaleIcon className="h-4 w-4" />
                  <span>Вес</span>
                </div>
              </div>
              
              <button
                onClick={handleRequestPermissions}
                disabled={isLoading}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Запрос разрешений...' : 'Подключить Apple Health'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Детальная статистика */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Данные за сегодня</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <ChartBarIcon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-600">{steps.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">шагов</div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <FireIcon className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-orange-600">{calories}</div>
                    <div className="text-xs text-gray-600">калорий</div>
                  </div>
                  
                  {weight && (
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <ScaleIcon className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-600">{weight} кг</div>
                      <div className="text-xs text-gray-600">текущий вес</div>
                    </div>
                  )}
                  
                  {heartRate && (
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <HeartIcon className="h-5 w-5 text-red-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-red-600">{heartRate}</div>
                      <div className="text-xs text-gray-600">уд/мин покоя</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Тренировки */}
              {workouts.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Тренировки сегодня</h4>
                  <div className="space-y-2">
                    {workouts.map((workout, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 capitalize">
                              {workout.type === 'running' ? 'Бег' :
                               workout.type === 'strength' ? 'Силовая' :
                               workout.type === 'cycling' ? 'Велосипед' :
                               workout.type === 'swimming' ? 'Плавание' :
                               workout.type === 'yoga' ? 'Йога' : workout.type}
                            </div>
                            <div className="text-sm text-gray-600">
                              {workout.duration} мин • {workout.totalEnergyBurned || 0} ккал
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            {workout.startDate.toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Действия */}
              <div className="flex space-x-3 pt-2 border-t border-gray-100">
                <button
                  onClick={handleSync}
                  disabled={isLoading}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Синхронизация...' : 'Синхронизировать'}</span>
                </button>
                
                <button
                  onClick={clearData}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <CogIcon className="h-4 w-4" />
                  <span>Настройки</span>
                </button>
              </div>

              {/* Информация о последней синхронизации */}
              <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                Последняя синхронизация: {formatSyncTime(lastSyncDate)}
                {healthMetrics && (
                  <>
                    <br />
                    Данных получено: {healthMetrics.steps.length} дней активности
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 