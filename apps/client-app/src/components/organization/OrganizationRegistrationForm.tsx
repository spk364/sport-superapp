import React, { useState, useCallback } from 'react';
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  UsersIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CameraIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { OrganizationRegistrationData, organizationService } from '../../services/organizationService';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ContactInfoStep } from './steps/ContactInfoStep';
import { LocationStep } from './steps/LocationStep';
import { ServicesStep } from './steps/ServicesStep';
import { LegalInfoStep } from './steps/LegalInfoStep';
import { MediaStep } from './steps/MediaStep';
import { SocialMediaStep } from './steps/SocialMediaStep';
import { TrainersStep } from './steps/TrainersStep';
import { ReviewStep } from './steps/ReviewStep';

export interface OrganizationRegistrationFormProps {
  onSuccess?: (organizationId: string) => void;
  onCancel?: () => void;
}

const STEPS = [
  { 
    id: 'basic', 
    title: 'Основная информация', 
    icon: BuildingStorefrontIcon,
    description: 'Название, тип, описание'
  },
  { 
    id: 'contact', 
    title: 'Контактная информация', 
    icon: PhoneIcon,
    description: 'Телефоны, email, время работы'
  },
  { 
    id: 'location', 
    title: 'Местоположение', 
    icon: MapPinIcon,
    description: 'Адрес, координаты'
  },
  { 
    id: 'services', 
    title: 'Услуги и цены', 
    icon: CreditCardIcon,
    description: 'Пакеты услуг, направления'
  },
  { 
    id: 'legal', 
    title: 'Юридическая информация', 
    icon: DocumentTextIcon,
    description: 'БИН, лицензии'
  },
  { 
    id: 'media', 
    title: 'Медиа', 
    icon: CameraIcon,
    description: 'Логотип, фото, оформление'
  },
  { 
    id: 'social', 
    title: 'Соцсети', 
    icon: ShareIcon,
    description: 'Социальные сети'
  },
  { 
    id: 'trainers', 
    title: 'Тренеры', 
    icon: UsersIcon,
    description: 'Информация о тренерах'
  },
  { 
    id: 'review', 
    title: 'Проверка', 
    icon: DocumentTextIcon,
    description: 'Проверка данных'
  }
];

export const OrganizationRegistrationForm: React.FC<OrganizationRegistrationFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<OrganizationRegistrationData>>({
    name: '',
    type: '',
    description: '',
    specializations: [],
    packages: [],
    contact: {
      phone: [''],
      email: [''],
      website: '',
      workingHours: {
        monday: { open: '09:00', close: '21:00', isOpen: true },
        tuesday: { open: '09:00', close: '21:00', isOpen: true },
        wednesday: { open: '09:00', close: '21:00', isOpen: true },
        thursday: { open: '09:00', close: '21:00', isOpen: true },
        friday: { open: '09:00', close: '21:00', isOpen: true },
        saturday: { open: '09:00', close: '18:00', isOpen: true },
        sunday: { open: '10:00', close: '18:00', isOpen: false },
        is24Hours: false,
        holidays: []
      },
      paymentMethods: []
    },
    location: {
      country: 'Казахстан',
      city: '',
      address: '',
      postalCode: '',
      coordinates: undefined,
      landmarks: '',
      parking: false,
      publicTransport: ''
    },
    legalInfo: {
      bin: '',
      legalName: '',
      registrationDate: '',
      taxRegime: '',
      director: '',
      isIndividualEntrepreneur: false,
      licenses: []
    },
    media: {
      logo: '',
      cover: '',
      gallery: [],
      videos: [],
      colorScheme: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#06B6D4'
      }
    },
    socialMedia: {
      instagram: '',
      facebook: '',
      youtube: '',
      tiktok: '',
      whatsapp: '',
      telegram: '',
      vk: ''
    },
    trainers: []
  });

  const updateFormData = useCallback((stepData: Partial<OrganizationRegistrationData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  }, []);

  const validateCurrentStep = useCallback(() => {
    const stepId = STEPS[currentStep].id;
    const stepErrors: Record<string, string> = {};

    switch (stepId) {
      case 'basic':
        if (!formData.name?.trim()) stepErrors.name = 'Название обязательно';
        if (!formData.type) stepErrors.type = 'Тип организации обязателен';
        if (!formData.specializations?.length) stepErrors.specializations = 'Выберите хотя бы одно направление';
        break;
      
      case 'contact':
        if (!formData.contact?.phone?.some(p => p.trim())) stepErrors.phone = 'Укажите хотя бы один телефон';
        if (!formData.contact?.email?.some(e => e.trim())) stepErrors.email = 'Укажите хотя бы один email';
        break;
      
      case 'location':
        if (!formData.location?.city?.trim()) stepErrors.city = 'Город обязателен';
        if (!formData.location?.address?.trim()) stepErrors.address = 'Адрес обязателен';
        break;
      
      case 'services':
        if (!formData.packages?.length) stepErrors.packages = 'Добавьте хотя бы один пакет услуг';
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [currentStep, formData]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const result = await organizationService.registerOrganization(formData as OrganizationRegistrationData);
      
      if (result.success && result.organizationId) {
        onSuccess?.(result.organizationId);
      } else {
        setErrors({ submit: result.error || 'Произошла ошибка при регистрации' });
      }
    } catch (error) {
      setErrors({ submit: 'Произошла ошибка при отправке данных' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSuccess, validateCurrentStep]);

  const renderStepContent = () => {
    const stepId = STEPS[currentStep].id;
    
    switch (stepId) {
      case 'basic':
        return (
          <BasicInfoStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 'contact':
        return (
          <ContactInfoStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 'location':
        return (
          <LocationStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 'services':
        return (
          <ServicesStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 'legal':
        return (
          <LegalInfoStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 'media':
        return (
          <MediaStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 'social':
        return (
          <SocialMediaStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 'trainers':
        return (
          <TrainersStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 'review':
        return (
          <ReviewStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Регистрация спортивной организации
          </h1>
          <p className="text-gray-600">
            Заполните информацию о вашей организации для регистрации в системе
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    index < STEPS.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 ml-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      style={{ marginTop: '-1.5rem', zIndex: -1 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Отменить
          </button>
          
          <div className="flex space-x-4">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Назад
              </button>
            )}
            
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                Далее
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Отправка...' : 'Зарегистрировать'}
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}
      </div>
    </div>
  );
}; 