import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { 
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  Shield,
  Heart,
  Share2,
  Calendar,
  Tag,
  Users,
  Wifi,
  Car,
  Droplets,
  Wind,
  Check,
  ExternalLink
} from 'lucide-react';
import { PhotoGallery, ReviewsSection } from '../components/gym';
import { gymService } from '../services/gymService';
import { Gym, GymSportType } from '../types';

const GymDetail: React.FC = () => {
  const currentPageParams = useAppStore(state => state.currentPageParams);
  const navigateToGymDirectory = useAppStore(state => state.navigateToGymDirectory);
  const id = currentPageParams.id;
  const [gym, setGym] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'reviews' | 'packages'>('overview');

  useEffect(() => {
    if (id) {
      loadGym(id);
    }
  }, [id]);

  const loadGym = async (gymId: string) => {
    try {
      setIsLoading(true);
      const gymData = await gymService.getGym(gymId);
      setGym(gymData);
    } catch (error) {
      console.error('Error loading gym:', error);
      // Handle error - maybe show a 404 page or error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigateToGymDirectory();
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // Implement favorite logic here
  };

  const handleShare = async () => {
    if (navigator.share && gym) {
      try {
        await navigator.share({
          title: gym.name,
          text: gym.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // Show toast notification
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const handleCall = () => {
    if (gym?.contact.phone) {
      window.location.href = `tel:${gym.contact.phone}`;
    }
  };

  const handleWebsite = () => {
    if (gym?.contact.website) {
      window.open(gym.contact.website, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBooking = () => {
    // Implement booking logic here
    console.log('Booking for gym:', gym?.id);
  };

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

  const amenityIcons: Record<string, React.ReactNode> = {
    'Душевые': <Droplets className="w-4 h-4" />,
    'Раздевалки': <Users className="w-4 h-4" />,
    'Парковка': <Car className="w-4 h-4" />,
    'Wi-Fi': <Wifi className="w-4 h-4" />,
    'Кондиционер': <Wind className="w-4 h-4" />
  };

  const formatPrice = (min: number, max: number, currency: string) => {
    const symbol = currency === 'KZT' ? '₸' : currency;
    if (min === max) {
      return `${min.toLocaleString()} ${symbol}`;
    }
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${symbol}`;
  };

  const formatWorkingHours = () => {
    if (!gym?.workingHours) return [];
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    const schedule = days.map((day, index) => {
      const hours = gym.workingHours[day as keyof typeof gym.workingHours];
      return {
        day: dayNames[index],
        hours: (hours && typeof hours === 'object' && 'isOpen' in hours && hours.isOpen) 
          ? `${hours.open}-${hours.close}` 
          : 'Закрыто'
      };
    });

    return schedule;
  };

  const isCurrentlyOpen = () => {
    if (!gym?.workingHours) return false;
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка информации о спортзале...</p>
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Спортзал не найден</h1>
          <p className="text-gray-600 mb-4">Запрашиваемый спортзал не существует или был удален</p>
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{gym.name}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span>{gym.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{gym.reviewCount} отзывов</span>
                  {gym.location.distance && (
                    <>
                      <span>•</span>
                      <span>{gym.location.distance.toFixed(1)} км</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <PhotoGallery photos={gym.photos} />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b border-gray-100">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Обзор' },
                    { id: 'photos', label: 'Фото' },
                    { id: 'reviews', label: 'Отзывы' },
                    { id: 'packages', label: 'Пакеты' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание</h3>
                      <p className="text-gray-700 leading-relaxed">{gym.description}</p>
                    </div>

                    {/* Sport Types */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Виды спорта</h3>
                      <div className="flex flex-wrap gap-2">
                        {gym.sportTypes.map(type => (
                          <span
                            key={type}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {sportTypeLabels[type]}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Удобства</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {gym.amenities.map(amenity => (
                          <div key={amenity} className="flex items-center space-x-2">
                            {amenityIcons[amenity] || <Check className="w-4 h-4" />}
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Режим работы</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formatWorkingHours().map(({ day, hours }) => (
                          <div key={day} className="flex justify-between py-1">
                            <span className="text-gray-600">{day}</span>
                            <span className="font-medium text-gray-900">{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Photos Tab */}
                {activeTab === 'photos' && (
                  <div>
                    <PhotoGallery photos={gym.photos} showThumbnails={true} />
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <ReviewsSection
                    gymId={gym.id}
                    initialRating={gym.rating}
                    initialReviewCount={gym.reviewCount}
                    initialReviews={gym.reviews}
                  />
                )}

                {/* Packages Tab */}
                {activeTab === 'packages' && (
                  <div className="space-y-4">
                    {gym.packages.map(pkg => (
                      <div
                        key={pkg.id}
                        className={`border rounded-xl p-6 ${
                          pkg.popular 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        {pkg.popular && (
                          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-3">
                            Популярный
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{pkg.name}</h4>
                            <p className="text-gray-600">{pkg.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {pkg.price.toLocaleString()} ₸
                            </div>
                            <div className="text-sm text-gray-500">
                              {pkg.duration} дней
                            </div>
                          </div>
                        </div>

                        <ul className="space-y-2 mb-4">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors">
                          Выбрать пакет
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Быстрая информация</h3>
                <div className="flex items-center space-x-2">
                  {gym.verified && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Проверено
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isCurrentlyOpen() 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isCurrentlyOpen() ? 'Открыто' : 'Закрыто'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Рейтинг</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{gym.rating}</span>
                    <span className="text-gray-500 text-sm">({gym.reviewCount})</span>
                  </div>
                </div>

                {/* Price Range */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Цена</span>
                  <span className="font-medium">
                    {formatPrice(gym.priceRange.min, gym.priceRange.max, gym.priceRange.currency)}
                  </span>
                </div>

                {/* Distance */}
                {gym.location.distance && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Расстояние</span>
                    <span className="font-medium">{gym.location.distance.toFixed(1)} км</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact & Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Контакты</h3>
              
              <div className="space-y-4 mb-6">
                {/* Address */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">{gym.location.address}</span>
                </div>

                {/* Phone */}
                {gym.contact.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{gym.contact.phone}</span>
                  </div>
                )}

                {/* Website */}
                {gym.contact.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a
                      href={gym.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      Сайт
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBooking}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Записаться</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  {gym.contact.phone && (
                    <button
                      onClick={handleCall}
                      className="flex items-center justify-center space-x-2 py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Позвонить</span>
                    </button>
                  )}

                  {gym.contact.website && (
                    <button
                      onClick={handleWebsite}
                      className="flex items-center justify-center space-x-2 py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Сайт</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymDetail;