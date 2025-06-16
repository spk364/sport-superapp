import React from 'react';
import { RegistrationFormData } from '../../../types';

interface ConfirmationStepProps {
  data: RegistrationFormData;
  onUpdate: (updates: Partial<RegistrationFormData>) => void;
  onComplete: () => void;
  onPrev: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  data,
  onUpdate,
  onComplete,
  onPrev
}) => {
  const formatWorkingDays = () => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const workingDays = data.workingHours?.filter(h => h.isWorkingDay);
    
    if (!workingDays || workingDays.length === 0) {
      return 'Не указан';
    }
    
    return workingDays.map(day => 
      `${days[day.dayOfWeek]} ${day.openTime}-${day.closeTime}`
    ).join(', ');
  };

  const getOrganizationTypeName = (type: string) => {
    const types = {
      'personal': 'Физическое лицо',
      'ip': 'Индивидуальный предприниматель',
      'ooo': 'ТОО',
      'fitness_club': 'Фитнес-клуб'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Подтверждение данных</h2>
        <p className="text-gray-600">Проверьте данные перед завершением регистрации</p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            Основная информация
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Название:</span>
              <p className="text-gray-800">{data.clubName || 'Не указано'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Владелец:</span>
              <p className="text-gray-800">{data.ownerName || 'Не указано'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Описание:</span>
              <p className="text-gray-800">{data.description || 'Не указано'}</p>
            </div>
          </div>
        </div>

        {/* Training Directions & Services */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            Направления и услуги
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Направления ({data.trainingDirections?.length || 0}):</span>
              {data.trainingDirections && data.trainingDirections.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.trainingDirections.map((direction, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {direction.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Не добавлены</p>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Пакеты услуг ({data.servicePackages?.length || 0}):</span>
              {data.servicePackages && data.servicePackages.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {data.servicePackages.slice(0, 3).map((pkg, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      • {pkg.name} - {pkg.price.toLocaleString()} {pkg.currency}
                    </div>
                  ))}
                  {data.servicePackages.length > 3 && (
                    <div className="text-sm text-gray-500">и еще {data.servicePackages.length - 3}...</div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Не добавлены</p>
              )}
            </div>
          </div>
        </div>

        {/* Location & Hours */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">3</span>
            </div>
            Местоположение и график
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Адрес:</span>
              <p className="text-gray-800">
                {data.address && data.address.city && data.address.street && data.address.building ? 
                  `${data.address.city}, ${data.address.street} ${data.address.building}${data.address.apartment ? `, ${data.address.apartment}` : ''}` 
                  : 'Не указан'
                }
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">График работы:</span>
              <p className="text-gray-800 text-sm">{formatWorkingDays()}</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">5</span>
            </div>
            Способы оплаты
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Методы оплаты ({data.paymentMethods?.length || 0}):</span>
              {data.paymentMethods && data.paymentMethods.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.paymentMethods.map((method, index) => (
                    <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {method.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Не указаны</p>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Социальные сети ({data.socialNetworks?.length || 0}):</span>
              {data.socialNetworks && data.socialNetworks.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {data.socialNetworks.slice(0, 3).map((social, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      • {social.platform}: {social.url}
                    </div>
                  ))}
                  {data.socialNetworks.length > 3 && (
                    <div className="text-sm text-gray-500">и еще {data.socialNetworks.length - 3}...</div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Не добавлены</p>
              )}
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">6</span>
            </div>
            Юридические данные
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Тип организации:</span>
              <p className="text-gray-800">
                {data.legalData?.organizationType ? 
                  getOrganizationTypeName(data.legalData.organizationType) 
                  : 'Не указан'
                }
              </p>
            </div>
            {data.legalData?.iin && (
              <div>
                <span className="text-sm font-medium text-gray-600">ИИН:</span>
                <p className="text-gray-800">{data.legalData.iin}</p>
              </div>
            )}
            {data.legalData?.bin && (
              <div>
                <span className="text-sm font-medium text-gray-600">БИН:</span>
                <p className="text-gray-800">{data.legalData.bin}</p>
              </div>
            )}
            {data.legalData?.companyName && (
              <div>
                <span className="text-sm font-medium text-gray-600">Название:</span>
                <p className="text-gray-800">{data.legalData.companyName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Trainers */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">7</span>
            </div>
            Команда тренеров
          </h3>
          <div>
            <span className="text-sm font-medium text-gray-600">Тренеры ({data.trainers?.length || 0}):</span>
            {data.trainers && data.trainers.length > 0 ? (
              <div className="mt-2 space-y-2">
                {data.trainers.slice(0, 3).map((trainer, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    • {trainer.firstName} {trainer.lastName} ({trainer.experience} лет опыта)
                  </div>
                ))}
                {data.trainers.length > 3 && (
                  <div className="text-sm text-gray-500">и еще {data.trainers.length - 3}...</div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Не добавлены</p>
            )}
          </div>
        </div>

        {/* Final Agreement */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agreement"
              checked={data.settings?.isVerified || false}
              onChange={(e) => onUpdate({
                settings: {
                  allowOnlineBooking: data.settings?.allowOnlineBooking || true,
                  requirePaymentUpfront: data.settings?.requirePaymentUpfront || false,
                  cancellationPolicy: data.settings?.cancellationPolicy || '',
                  isVerified: e.target.checked,
                  isActive: data.settings?.isActive || true
                }
              })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <label htmlFor="agreement" className="text-sm text-gray-700">
              <span className="font-medium">Подтверждаю правильность указанных данных</span>
              <div className="mt-1 text-gray-600">
                Я подтверждаю, что все указанные данные достоверны и соответствуют действительности. 
                Понимаю, что предоставление ложной информации может привести к блокировке аккаунта.
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-8">
        <button
          onClick={onPrev}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Назад
        </button>
        
        <button
          onClick={onComplete}
          disabled={!data.settings?.isVerified}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
        >
          Завершить регистрацию 🎉
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;