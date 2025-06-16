import React, { useState } from 'react';
import { RegistrationFormData, PaymentMethod, SocialNetwork } from '../../../types';

interface PaymentStepProps {
  data: RegistrationFormData;
  onUpdate: (updates: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrev
}) => {
  const [newSocial, setNewSocial] = useState<Partial<SocialNetwork>>({});
  const [showSocialForm, setShowSocialForm] = useState(false);

  const paymentTypes = [
    { id: 'cash', name: 'Наличные', icon: '💵', description: 'Оплата наличными в клубе' },
    { id: 'card', name: 'Банковские карты', icon: '💳', description: 'Visa, MasterCard, МИР' },
    { id: 'bank_transfer', name: 'Банковский перевод', icon: '🏦', description: 'Перевод на расчетный счет' },
    { id: 'payment_system', name: 'Платежные системы', icon: '📱', description: 'Kaspi Pay, Яндекс.Деньги и др.' },
    { id: 'crypto', name: 'Криптовалюта', icon: '₿', description: 'Bitcoin, Ethereum и др.' }
  ];

  const socialPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', color: '#0088CC' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '📞', color: '#25D366' },
    { id: 'youtube', name: 'YouTube', icon: '📺', color: '#FF0000' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
    { id: 'vk', name: 'ВКонтакте', icon: '🅥', color: '#0077FF' },
    { id: 'other', name: 'Другое', icon: '🌐', color: '#6B7280' }
  ];

  const togglePaymentMethod = (type: string, name: string, description: string) => {
    const existingMethods = data.paymentMethods || [];
    const exists = existingMethods.find(method => method.type === type);

    if (exists) {
      onUpdate({
        paymentMethods: existingMethods.filter(method => method.type !== type)
      });
    } else {
      const newMethod: PaymentMethod = {
        id: `payment_${Date.now()}`,
        type: type as any,
        name,
        details: description,
        isActive: true
      };
      onUpdate({
        paymentMethods: [...existingMethods, newMethod]
      });
    }
  };

  const addSocialNetwork = () => {
    if (newSocial.platform && newSocial.url) {
      const social: SocialNetwork = {
        platform: newSocial.platform as any,
        url: newSocial.url,
        isActive: true
      };
      
      onUpdate({
        socialNetworks: [...(data.socialNetworks || []), social]
      });
      
      setNewSocial({});
      setShowSocialForm(false);
    }
  };

  const removeSocialNetwork = (index: number) => {
    const updated = data.socialNetworks?.filter((_, i) => i !== index) || [];
    onUpdate({ socialNetworks: updated });
  };

  const isPaymentMethodSelected = (type: string) => {
    return data.paymentMethods?.some(method => method.type === type) || false;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Способы оплаты</h2>
        <p className="text-gray-600">Выберите удобные для клиентов способы оплаты</p>
      </div>

      <div className="space-y-8">
        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Методы оплаты</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentTypes.map(payment => (
              <div
                key={payment.id}
                onClick={() => togglePaymentMethod(payment.id, payment.name, payment.description)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  isPaymentMethodSelected(payment.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{payment.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">{payment.name}</h4>
                      <input
                        type="checkbox"
                        checked={isPaymentMethodSelected(payment.id)}
                        onChange={() => {}}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Важно</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Выберите хотя бы один способ оплаты, чтобы клиенты могли оплачивать ваши услуги
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Networks */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Социальные сети</h3>
            <button
              onClick={() => setShowSocialForm(!showSocialForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Добавить соц. сеть
            </button>
          </div>

          {showSocialForm && (
            <div className="mb-4 p-4 border border-gray-200 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <select
                  value={newSocial.platform || ''}
                  onChange={(e) => setNewSocial({...newSocial, platform: e.target.value as any})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Выберите платформу</option>
                  {socialPlatforms.map(platform => (
                    <option key={platform.id} value={platform.id}>
                      {platform.icon} {platform.name}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  placeholder="Ссылка на профиль"
                  value={newSocial.url || ''}
                  onChange={(e) => setNewSocial({...newSocial, url: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <button onClick={addSocialNetwork} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Добавить
                </button>
                <button onClick={() => setShowSocialForm(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  Отмена
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {data.socialNetworks?.map((social, index) => {
              const platform = socialPlatforms.find(p => p.id === social.platform);
              return (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: platform?.color || '#6B7280' }}
                    >
                      {platform?.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{platform?.name}</p>
                      <p className="text-sm text-gray-600 truncate max-w-xs">{social.url}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSocialNetwork(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {(!data.socialNetworks || data.socialNetworks.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p>Социальные сети не добавлены</p>
              <p className="text-sm mt-1">Добавьте ссылки на ваши профили в социальных сетях</p>
            </div>
          )}
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Настройки бронирования</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-800">Онлайн-запись</h4>
                <p className="text-sm text-gray-600">Разрешить клиентам записываться через приложение</p>
              </div>
              <input
                type="checkbox"
                checked={data.settings?.allowOnlineBooking || false}
                onChange={(e) => onUpdate({
                  settings: {
                    ...data.settings,
                    allowOnlineBooking: e.target.checked
                  }
                })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-800">Предоплата</h4>
                <p className="text-sm text-gray-600">Требовать оплату при бронировании</p>
              </div>
              <input
                type="checkbox"
                checked={data.settings?.requirePaymentUpfront || false}
                onChange={(e) => onUpdate({
                  settings: {
                    ...data.settings,
                    requirePaymentUpfront: e.target.checked
                  }
                })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Политика отмены</h3>
          <textarea
            value={data.settings?.cancellationPolicy || ''}
            onChange={(e) => onUpdate({
              settings: {
                ...data.settings,
                cancellationPolicy: e.target.value
              }
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="Опишите условия отмены записи (например: отмена за 24 часа без штрафа, при отмене менее чем за 12 часов взимается 50% стоимости)"
          />
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
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;