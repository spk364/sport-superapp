import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, MapPin, Clock, Phone, Mail, MessageCircle, 
  Calendar, Users, Trophy, Verified, Heart, Share2 
} from 'lucide-react';
import { Trainer } from '../types';
import { trainerService } from '../services/trainerService';

const TrainerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'schedule'>('about');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTrainer(id);
    }
  }, [id]);

  const fetchTrainer = async (trainerId: string) => {
    try {
      setLoading(true);
      const trainerData = await trainerService.getTrainerById(trainerId);
      setTrainer(trainerData);
    } catch (error) {
      console.error('Error fetching trainer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (trainer) {
      // Navigate to booking page or open booking modal
      console.log('Booking trainer:', trainer.id);
    }
  };

  const handleContact = (method: string) => {
    if (!trainer) return;
    
    switch (method) {
      case 'phone':
        if (trainer.contact.phone) {
          window.open(`tel:${trainer.contact.phone}`);
        }
        break;
      case 'email':
        if (trainer.contact.email) {
          window.open(`mailto:${trainer.contact.email}`);
        }
        break;
      case 'telegram':
        if (trainer.contact.telegram) {
          window.open(`https://t.me/${trainer.contact.telegram}`);
        }
        break;
      case 'whatsapp':
        if (trainer.contact.whatsapp) {
          window.open(`https://wa.me/${trainer.contact.whatsapp}`);
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Тренер не найден
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:text-blue-600"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Trainer Profile */}
      <div className="bg-white">
        <div className="px-4 py-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <img
                src={trainer.avatar || '/placeholder-avatar.jpg'}
                alt={`${trainer.firstName} ${trainer.lastName}`}
                className="w-20 h-20 rounded-full object-cover"
              />
              {trainer.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Verified className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">
                  {trainer.firstName} {trainer.lastName}
                </h1>
                {trainer.isFeatured && (
                  <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    ⭐ Топ
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{trainer.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({trainer.reviewCount})</span>
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Trophy className="w-3 h-3" />
                  <span>{trainer.experience} лет опыта</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-xs text-gray-500 mb-3">
                <MapPin className="w-3 h-3" />
                <span>{trainer.location.city}</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {trainer.specializations.slice(0, 3).map((spec) => (
                  <span
                    key={spec}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {spec.replace('_', ' ')}
                  </span>
                ))}
                {trainer.specializations.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{trainer.specializations.length - 3} еще
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white mt-2 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {trainer.pricing.personalSession.toLocaleString()} {trainer.pricing.currency}
            </div>
            <div className="text-xs text-gray-500">за персональную тренировку</div>
          </div>
          {trainer.pricing.freeConsultation && (
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Бесплатная консультация
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mt-2">
        <div className="flex border-b">
          {[
            { key: 'about', label: 'О тренере' },
            { key: 'reviews', label: 'Отзывы' },
            { key: 'schedule', label: 'Расписание' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-4 py-6">
          {activeTab === 'about' && (
            <div className="space-y-6">
              {trainer.bio && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">О себе</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{trainer.bio}</p>
                </div>
              )}

              {trainer.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Сертификаты</h3>
                  <div className="space-y-2">
                    {trainer.certifications.map((cert) => (
                      <div key={cert.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-sm">{cert.name}</div>
                        <div className="text-xs text-gray-500">{cert.issuer}</div>
                        <div className="text-xs text-gray-500">
                          {cert.issueDate.getFullYear()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Статистика</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {trainer.stats.totalClients}
                    </div>
                    <div className="text-xs text-gray-500">Клиентов</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {trainer.stats.totalSessions}
                    </div>
                    <div className="text-xs text-gray-500">Тренировок</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {trainer.reviews.length > 0 ? (
                trainer.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <img
                        src={review.userAvatar || '/placeholder-avatar.jpg'}
                        alt={review.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{review.userName}</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {review.comment}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {review.date.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <MessageCircle className="w-8 h-8 mx-auto" />
                  </div>
                  <p className="text-gray-500">Пока нет отзывов</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <p className="text-gray-500 text-center py-8">
                Расписание доступно после записи на тренировку
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Actions */}
      <div className="bg-white mt-2 px-4 py-4">
        <h3 className="font-semibold text-gray-900 mb-3">Связаться с тренером</h3>
        <div className="flex flex-wrap gap-2">
          {trainer.contact.phone && (
            <button
              onClick={() => handleContact('phone')}
              className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Позвонить</span>
            </button>
          )}
          {trainer.contact.telegram && (
            <button
              onClick={() => handleContact('telegram')}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Telegram</span>
            </button>
          )}
          {trainer.contact.whatsapp && (
            <button
              onClick={() => handleContact('whatsapp')}
              className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          )}
          {trainer.contact.email && (
            <button
              onClick={() => handleContact('email')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
          )}
        </div>
      </div>

      {/* Booking Button */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t px-4 py-3">
        <button
          onClick={handleBooking}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          Записаться на тренировку
        </button>
      </div>
    </div>
  );
};

export default TrainerDetail;
