import React from 'react';
import { Trainer } from '../../types';
import { Star, MapPin, Clock, Users, Award, MessageCircle } from 'lucide-react';

interface TrainerCardProps {
  trainer: Trainer;
  onClick: (trainerId: string) => void;
}

const TrainerCard: React.FC<TrainerCardProps> = ({ trainer, onClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getSpecializationLabel = (spec: string) => {
    const labels: Record<string, string> = {
      strength_training: 'Силовые тренировки',
      cardio: 'Кардио',
      yoga: 'Йога',
      pilates: 'Пилатес',
      martial_arts: 'Боевые искусства',
      boxing: 'Бокс',
      swimming: 'Плавание',
      running: 'Бег',
      crossfit: 'Кроссфит',
      bodybuilding: 'Бодибилдинг',
      powerlifting: 'Пауэрлифтинг',
      gymnastics: 'Гимнастика',
      dance: 'Танцы',
      stretching: 'Растяжка',
      rehabilitation: 'Реабилитация',
      nutrition: 'Питание',
      weight_loss: 'Похудение',
      muscle_gain: 'Набор массы',
      flexibility: 'Гибкость',
      endurance: 'Выносливость',
      sports_specific: 'Спортивная подготовка',
      senior_fitness: 'Фитнес для пожилых',
      prenatal_postnatal: 'До и после родов',
      kids_fitness: 'Детский фитнес',
      other: 'Другое'
    };
    return labels[spec] || spec;
  };

  const getContactIcon = (preferredContact: string) => {
    switch (preferredContact) {
      case 'telegram':
        return '📱';
      case 'whatsapp':
        return '📱';
      case 'instagram':
        return '📷';
      case 'email':
        return '📧';
      default:
        return '📞';
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(trainer.id)}
    >
      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="relative">
          <img
            src={trainer.avatar || '/avatars/default-trainer.jpg'}
            alt={`${trainer.firstName} ${trainer.lastName}`}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
          />
          {trainer.isVerified && (
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
              <Award className="w-3 h-3" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {trainer.firstName} {trainer.lastName}
            </h3>
            {trainer.isFeatured && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
                Топ
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-medium">{trainer.rating}</span>
            <span className="text-gray-400">({trainer.reviewCount})</span>
            <span className="text-gray-300">•</span>
            <span>{trainer.experience} лет опыта</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{trainer.location.city}</span>
            {trainer.location.district && (
              <>
                <span className="text-gray-300">•</span>
                <span className="truncate">{trainer.location.district}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {trainer.specializations.slice(0, 3).map((spec, index) => (
            <span
              key={index}
              className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
            >
              {getSpecializationLabel(spec)}
            </span>
          ))}
          {trainer.specializations.length > 3 && (
            <span className="text-gray-500 text-xs px-2 py-1">
              +{trainer.specializations.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Bio */}
      {trainer.bio && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {trainer.bio}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-1">
          <Users className="w-3 h-3" />
          <span>{trainer.stats.totalClients} клиентов</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Ответ за {trainer.stats.responseTime} мин</span>
        </div>
      </div>

      {/* Pricing and Contact */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-500">от </span>
          <span className="font-semibold text-gray-900">
            {formatPrice(trainer.pricing.personalSession)} ₸
          </span>
          <span className="text-gray-500">/занятие</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {trainer.pricing.freeConsultation && (
            <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
              Бесплатная консультация
            </span>
          )}
          
          <button className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-3 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
            <MessageCircle className="w-4 h-4" />
            <span>Написать</span>
          </button>
        </div>
      </div>

      {/* Availability indicator */}
      {trainer.availability.isAvailable && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Доступен сейчас</span>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>{getContactIcon(trainer.contact.preferredContact)}</span>
            <span>Предпочитает {trainer.contact.preferredContact}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerCard; 