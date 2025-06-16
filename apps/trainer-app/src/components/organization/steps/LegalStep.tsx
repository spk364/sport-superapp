import React, { useState } from 'react';
import { RegistrationFormData } from '../../../types';

interface LegalStepProps {
  data: RegistrationFormData;
  onUpdate: (updates: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const LegalStep: React.FC<LegalStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrev
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const organizationTypes = [
    { id: 'personal', name: 'Физическое лицо', description: 'Персональный тренер без регистрации ИП' },
    { id: 'ip', name: 'Индивидуальный предприниматель', description: 'ИП с указанием ИИН' },
    { id: 'ooo', name: 'ТОО', description: 'Товарищество с ограниченной ответственностью' },
    { id: 'fitness_club', name: 'Фитнес-клуб', description: 'Зарегистрированный фитнес-клуб' }
  ];

  const searchByIIN = async (iin: string) => {
    if (!iin || iin.length !== 12) {
      setErrors({ iin: 'ИИН должен содержать 12 цифр' });
      return;
    }

    setIsSearching(true);
    setErrors({});

    try {
      // Simulation of e.gov.kz API call
      // In real implementation, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data for demonstration
      const mockData = {
        iin: iin,
        fullName: 'Иванов Иван Иванович',
        birthDate: '1985-06-15',
        status: 'active',
        registrations: [
          {
            type: 'IP',
            regNumber: 'IP123456789',
            regDate: '2020-03-15',
            status: 'active',
            activities: ['Услуги в области спорта', 'Образовательные услуги']
          }
        ]
      };

      setSearchResults(mockData);
      
      // Auto-fill form data
      onUpdate({
        legalData: {
          organizationType: data.legalData?.organizationType || 'personal',
          iin: iin,
          companyName: mockData.fullName,
          registrationData: mockData,
          bin: data.legalData?.bin,
          bankDetails: data.legalData?.bankDetails
        }
      });

    } catch (error) {
      setErrors({ iin: 'Ошибка при поиске данных. Попробуйте еще раз.' });
    } finally {
      setIsSearching(false);
    }
  };

  const searchByBIN = async (bin: string) => {
    if (!bin || bin.length !== 12) {
      setErrors({ bin: 'БИН должен содержать 12 цифр' });
      return;
    }

    setIsSearching(true);
    setErrors({});

    try {
      // Simulation of e.gov.kz API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data for demonstration
      const mockData = {
        bin: bin,
        companyName: 'ТОО "ФитнесКлуб Премиум"',
        regDate: '2019-08-20',
        status: 'active',
        director: 'Петров Петр Петрович',
        legalAddress: 'г. Алматы, ул. Абая, 150',
        activities: ['Деятельность фитнес-клубов', 'Услуги персональных тренеров']
      };

      setSearchResults(mockData);
      
      // Auto-fill form data
      onUpdate({
        legalData: {
          organizationType: data.legalData?.organizationType || 'personal',
          bin: bin,
          companyName: mockData.companyName,
          legalAddress: mockData.legalAddress,
          registrationData: mockData,
          iin: data.legalData?.iin,
          bankDetails: data.legalData?.bankDetails
        }
      });

    } catch (error) {
      setErrors({ bin: 'Ошибка при поиске данных. Попробуйте еще раз.' });
    } finally {
      setIsSearching(false);
    }
  };

  const updateLegalData = (field: string, value: string) => {
    onUpdate({
      legalData: {
        ...data.legalData,
        [field]: value
      }
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (data.legalData?.organizationType === 'ip' && !data.legalData?.iin) {
      newErrors.iin = 'ИИН обязателен для ИП';
    }

    if ((data.legalData?.organizationType === 'ooo' || data.legalData?.organizationType === 'fitness_club') && !data.legalData?.bin) {
      newErrors.bin = 'БИН обязателен для ТОО/фитнес-клуба';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Юридические данные</h2>
        <p className="text-gray-600">Укажите официальную информацию для ведения бизнеса</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Organization Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Тип организации *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizationTypes.map((type) => (
              <div
                key={type.id}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  data.legalData?.organizationType === type.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateLegalData('organizationType', type.id)}
              >
                <h3 className="font-semibold text-gray-800 mb-2">{type.name}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* IIN/BIN Search */}
        {(data.legalData?.organizationType === 'ip' || data.legalData?.organizationType === 'ooo' || data.legalData?.organizationType === 'fitness_club') && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Автоматическое заполнение</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Введите {data.legalData?.organizationType === 'ip' ? 'ИИН' : 'БИН'} для автоматического получения данных из госреестра
                  </p>
                </div>
              </div>
            </div>

            {data.legalData?.organizationType === 'ip' ? (
              <div>
                <label htmlFor="iin" className="block text-sm font-medium text-gray-700 mb-2">
                  ИИН *
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    id="iin"
                    value={data.legalData?.iin || ''}
                    onChange={(e) => updateLegalData('iin', e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.iin ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123456789012"
                    maxLength={12}
                  />
                  <button
                    type="button"
                    onClick={() => searchByIIN(data.legalData?.iin || '')}
                    disabled={isSearching || !data.legalData?.iin || data.legalData.iin.length !== 12}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSearching ? 'Поиск...' : 'Найти'}
                  </button>
                </div>
                {errors.iin && (
                  <p className="mt-1 text-sm text-red-600">{errors.iin}</p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="bin" className="block text-sm font-medium text-gray-700 mb-2">
                  БИН *
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    id="bin"
                    value={data.legalData?.bin || ''}
                    onChange={(e) => updateLegalData('bin', e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.bin ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123456789012"
                    maxLength={12}
                  />
                  <button
                    type="button"
                    onClick={() => searchByBIN(data.legalData?.bin || '')}
                    disabled={isSearching || !data.legalData?.bin || data.legalData.bin.length !== 12}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSearching ? 'Поиск...' : 'Найти'}
                  </button>
                </div>
                {errors.bin && (
                  <p className="mt-1 text-sm text-red-600">{errors.bin}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {searchResults && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start space-x-3 mb-4">
              <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-green-800">Данные найдены</h4>
                <p className="text-sm text-green-700 mt-1">Информация автоматически загружена из государственного реестра</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {data.legalData?.organizationType === 'ip' ? (
                <>
                  <div>
                    <span className="font-medium text-gray-700">ИИН:</span> {searchResults.iin}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">ФИО:</span> {searchResults.fullName}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Статус:</span> 
                    <span className="ml-1 text-green-600">Активный</span>
                  </div>
                  {searchResults.registrations && searchResults.registrations.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Регистрации:</span>
                      <ul className="mt-1 space-y-1">
                        {searchResults.registrations.map((reg: any, index: number) => (
                          <li key={index} className="text-xs text-gray-600">
                            • {reg.type} №{reg.regNumber} от {reg.regDate}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <span className="font-medium text-gray-700">БИН:</span> {searchResults.bin}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Название:</span> {searchResults.companyName}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Директор:</span> {searchResults.director}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Статус:</span> 
                    <span className="ml-1 text-green-600">Активный</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Юридический адрес:</span> {searchResults.legalAddress}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Manual Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              {data.legalData?.organizationType === 'ip' ? 'ФИО' : 'Название организации'}
            </label>
            <input
              type="text"
              id="companyName"
              value={data.legalData?.companyName || ''}
              onChange={(e) => updateLegalData('companyName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={data.legalData?.organizationType === 'ip' ? 'Иванов Иван Иванович' : 'ТОО "Название компании"'}
            />
          </div>

          <div>
            <label htmlFor="legalAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Юридический адрес
            </label>
            <input
              type="text"
              id="legalAddress"
              value={data.legalData?.legalAddress || ''}
              onChange={(e) => updateLegalData('legalAddress', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="г. Алматы, ул. Абая, 150"
            />
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Банковские реквизиты (опционально)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-2">
                Банк
              </label>
              <input
                type="text"
                id="bank"
                value={data.legalData?.bankDetails?.bank || ''}
                onChange={(e) => onUpdate({
                  legalData: {
                    ...data.legalData,
                    bankDetails: {
                      bank: e.target.value,
                      accountNumber: data.legalData?.bankDetails?.accountNumber || '',
                      bik: data.legalData?.bankDetails?.bik || ''
                    }
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="АО Kaspi Bank"
              />
            </div>

            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Номер счета
              </label>
              <input
                type="text"
                id="accountNumber"
                value={data.legalData?.bankDetails?.accountNumber || ''}
                onChange={(e) => onUpdate({
                  legalData: {
                    ...data.legalData,
                    bankDetails: {
                      bank: data.legalData?.bankDetails?.bank || '',
                      accountNumber: e.target.value,
                      bik: data.legalData?.bankDetails?.bik || ''
                    }
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="KZ123456789012345678"
              />
            </div>

            <div>
              <label htmlFor="bik" className="block text-sm font-medium text-gray-700 mb-2">
                БИК банка
              </label>
              <input
                type="text"
                id="bik"
                value={data.legalData?.bankDetails?.bik || ''}
                onChange={(e) => onUpdate({
                  legalData: {
                    ...data.legalData,
                    bankDetails: {
                      bank: data.legalData?.bankDetails?.bank || '',
                      accountNumber: data.legalData?.bankDetails?.accountNumber || '',
                      bik: e.target.value
                    }
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="CASPKZKA"
              />
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-blue-50">
          <div>
            <h4 className="font-medium text-blue-800">Верификация</h4>
            <p className="text-sm text-blue-600">Статус проверки документов</p>
          </div>
          <input
            type="checkbox"
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
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onPrev}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Назад
          </button>
          
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Продолжить
          </button>
        </div>
      </form>
    </div>
  );
};

export default LegalStep;