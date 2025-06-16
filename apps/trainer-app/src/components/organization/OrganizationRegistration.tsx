import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Organization, TrainingDirection, ServicePackage, WorkingHours, PaymentMethod, SocialNetwork, LegalData, Trainer } from '../../types';
import BasicInfoStep from './steps/BasicInfoStep';
import ServicesStep from './steps/ServicesStep';
import LocationStep from './steps/LocationStep';
import BrandingStep from './steps/BrandingStep';
import PaymentStep from './steps/PaymentStep';
import LegalStep from './steps/LegalStep';
import TrainersStep from './steps/TrainersStep';
import ConfirmationStep from './steps/ConfirmationStep';

interface FormData {
  // Step tracking
  currentStep: number;
  totalSteps: number;
  
  // Basic Info
  clubName: string;
  ownerName: string;
  description?: string;
  organizationType?: 'personal' | 'organization';
  
  // Services
  trainingDirections?: TrainingDirection[];
  servicePackages?: ServicePackage[];
  
  // Location & Schedule
  address?: {
    country?: string;
    city?: string;
    street?: string;
    building?: string;
    apartment?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  workingHours?: WorkingHours[];
  
  // Branding
  logo?: string;
  coverImage?: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  
  // Payment & Social
  paymentMethods?: PaymentMethod[];
  socialNetworks?: SocialNetwork[];
  settings?: {
    allowOnlineBooking: boolean;
    requirePaymentUpfront: boolean;
    cancellationPolicy: string;
    isVerified: boolean;
    isActive: boolean;
  };
  
  // Legal
  legalData?: LegalData;
  
  // Staff
  trainers?: Trainer[];
}

interface OrganizationRegistrationProps {
  onComplete: (organization: Organization) => void;
  onCancel: () => void;
}

const TOTAL_STEPS = 8;

const OrganizationRegistration: React.FC<OrganizationRegistrationProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    currentStep: 1,
    totalSteps: TOTAL_STEPS,
    clubName: '',
    ownerName: '',
    settings: {
      allowOnlineBooking: true,
      requirePaymentUpfront: false,
      cancellationPolicy: '',
      isVerified: false,
      isActive: true
    },
    trainingDirections: [],
    servicePackages: [],
    paymentMethods: [],
    socialNetworks: [],
    trainers: [],
    workingHours: [
      { dayOfWeek: 1, openTime: '09:00', closeTime: '21:00', isWorkingDay: true },
      { dayOfWeek: 2, openTime: '09:00', closeTime: '21:00', isWorkingDay: true },
      { dayOfWeek: 3, openTime: '09:00', closeTime: '21:00', isWorkingDay: true },
      { dayOfWeek: 4, openTime: '09:00', closeTime: '21:00', isWorkingDay: true },
      { dayOfWeek: 5, openTime: '09:00', closeTime: '21:00', isWorkingDay: true },
      { dayOfWeek: 6, openTime: '10:00', closeTime: '20:00', isWorkingDay: true },
      { dayOfWeek: 0, openTime: '10:00', closeTime: '18:00', isWorkingDay: false }
    ]
  });

  const stepTitles = [
    'Основная информация',
    'Направления и услуги',
    'Местоположение и график',
    'Оформление и брендинг',
    'Способы оплаты',
    'Юридические данные',
    'Тренеры',
    'Подтверждение'
  ];

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
      currentStep
    }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const organization: Organization = {
      id: `org_${Date.now()}`,
      clubName: formData.clubName || '',
      ownerName: formData.ownerName || '',
      description: formData.description,
      trainingDirections: formData.trainingDirections || [],
      servicePackages: formData.servicePackages || [],
      address: formData.address ? {
        country: formData.address.country || 'Казахстан',
        city: formData.address.city || '',
        street: formData.address.street || '',
        building: formData.address.building || '',
        apartment: formData.address.apartment,
        zipCode: formData.address.zipCode,
        coordinates: formData.address.coordinates
      } : undefined,
      workingHours: formData.workingHours || [],
      logo: formData.logo,
      coverImage: formData.coverImage,
      brandColors: formData.brandColors,
      paymentMethods: formData.paymentMethods || [],
      legalData: formData.legalData,
      socialNetworks: formData.socialNetworks || [],
      trainers: formData.trainers || [],
      settings: formData.settings || {
        allowOnlineBooking: true,
        requirePaymentUpfront: false,
        cancellationPolicy: '',
        isVerified: false,
        isActive: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      registrationStep: 'completed'
    };

    onComplete(organization);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onCancel={onCancel}
          />
        );
      case 2:
        return (
          <ServicesStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <LocationStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <BrandingStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <PaymentStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 6:
        return (
          <LegalStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 7:
        return (
          <TrainersStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 8:
        return (
          <ConfirmationStep
            data={formData}
            onUpdate={updateFormData}
            onComplete={handleComplete}
            onPrev={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Регистрация организации
          </h1>
          <p className="text-gray-600">
            Создайте профиль вашего фитнес-клуба или секции
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              Шаг {currentStep} из {TOTAL_STEPS}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / TOTAL_STEPS) * 100)}% завершено
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            {stepTitles.map((title, index) => (
              <div
                key={index}
                className={`flex-1 text-center ${
                  index + 1 === currentStep
                    ? 'text-blue-600 font-semibold'
                    : index + 1 < currentStep
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-3 h-3 mx-auto mb-1 rounded-full ${
                    index + 1 === currentStep
                      ? 'bg-blue-500'
                      : index + 1 < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
                <span className="hidden md:inline">{title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default OrganizationRegistration;