import React from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Shield,
  Tag,
  Users
} from 'lucide-react';
import { Gym, GymSportType } from '../../types';

interface GymCardProps {
  gym: Gym;
  onCardClick: (gymId: string) => void;
  onCallClick?: (phone: string) => void;
  onWebsiteClick?: (website: string) => void;
}

const GymCard: React.FC<GymCardProps> = ({
  gym,
  onCardClick,
  onCallClick,
  onWebsiteClick
}) => {
  const sportTypeLabels: Record<GymSportType, string> = {
    bjj: 'BJJ',
    boxing: 'Бокс',
    mma: 'MMA',
    muay_thai: 'Муай Тай',
    kickboxing: 'Кикбоксинг',
    judo: 'Дзюдо',
    karate: 'Карате',
    taekwondo: 'Тхэквондо',
    wrestling: 'Борьба',
    jiu_jitsu: 'Джиу-джитсу',
    strength_training: 'Силовые тренировки',
    cardio: 'Кардио',
    crossfit: 'CrossFit',
    yoga: 'Йога',
    pilates: 'Пилатес',
    swimming: 'Плавание',
    other: 'Другое'
  };

  const isOpen = () => {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()] as keyof typeof gym.workingHours;
    const todayHours = gym.workingHours[currentDay];
    
    if (!todayHours || typeof todayHours === 'boolean' || Array.isArray(todayHours) || !todayHours.isOpen) return false;
    
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(todayHours.open.replace(':', ''));
    const closeTime = parseInt(todayHours.close.replace(':', ''));
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const formatPrice = (min: number, max: number, currency: string) => {
    if (min === max) {
      return `${min.toLocaleString()} ${currency === 'KZT' ? '₸' : currency}`;
    }
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency === 'KZT' ? '₸' : currency}`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onCardClick(gym.id);
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gym.contact.phone && onCallClick) {
      onCallClick(gym.contact.phone);
    }
  };

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gym.contact.website && onWebsiteClick) {
      onWebsiteClick(gym.contact.website);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {gym.photos.length > 0 && (
          <img
            src={gym.photos[0].url}
            alt={gym.photos[0].alt}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {gym.featured && (
            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-medium">
              Рекомендуем
            </span>
          )}
          {gym.verified && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              Проверено
            </span>
          )}
        </div>

        {/* Status */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
            isOpen() 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isOpen() ? 'Открыто' : 'Закрыто'}
          </span>
        </div>

        {/* Distance */}
        {gym.location.distance && (
          <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs">
            {gym.location.distance.toFixed(1)} км
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{gym.name}</h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium text-gray-900">{gym.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({gym.reviewCount} отзывов)</span>
          </div>

          {/* Location */}
          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{gym.location.address}</span>
          </div>
        </div>

        {/* Sport Types */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {gym.sportTypes.slice(0, 3).map(type => (
              <span 
                key={type}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium"
              >
                {sportTypeLabels[type]}
              </span>
            ))}
            {gym.sportTypes.length > 3 && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                +{gym.sportTypes.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {gym.description}
        </p>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-4">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">
            {formatPrice(gym.priceRange.min, gym.priceRange.max, gym.priceRange.currency)}
          </span>
        </div>

        {/* Amenities */}
        {gym.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {gym.amenities.slice(0, 3).map(amenity => (
                <span 
                  key={amenity}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                >
                  {amenity}
                </span>
              ))}
              {gym.amenities.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{gym.amenities.length - 3} еще
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleCardClick}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            Подробнее
          </button>
          
          {gym.contact.phone && (
            <button
              onClick={handleCallClick}
              className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Позвонить"
            >
              <Phone className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          {gym.contact.website && (
            <button
              onClick={handleWebsiteClick}
              className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Сайт"
            >
              <Globe className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymCard;