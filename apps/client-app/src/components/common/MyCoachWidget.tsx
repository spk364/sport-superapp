import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  StarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { Coach } from '../../types';
import { aiService } from '../../services/aiService';

export const MyCoachWidget: React.FC = () => {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoachInfo = async () => {
      try {
        setLoading(true);
        const coachData = await aiService.getCoachInfo();
        setCoach(coachData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных тренера');
      } finally {
        setLoading(false);
      }
    };

    fetchCoachInfo();
  }, []);

  const handleWhatsAppClick = () => {
    if (coach?.whatsappNumber) {
      const url = `https://wa.me/${coach.whatsappNumber.replace(/[^\d]/g, '')}`;
      window.open(url, '_blank');
    }
  };

  const handleTelegramClick = () => {
    if (coach?.telegramId) {
      const url = `https://t.me/${coach.telegramId}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="text-center py-4">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            {error || 'Информация о тренере недоступна'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm p-4 text-white">
      <div className="flex items-start space-x-4">
        {/* Coach Avatar */}
        <div className="flex-shrink-0">
          {coach.avatar ? (
            <img
              src={coach.avatar}
              alt={`${coach.firstName} ${coach.lastName}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
          )}
        </div>

        {/* Coach Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1">
            {coach.firstName} {coach.lastName}
          </h3>
          
          {coach.specialization && (
            <p className="text-blue-100 text-sm mb-2 flex items-center">
              <AcademicCapIcon className="h-4 w-4 mr-1" />
              {coach.specialization}
            </p>
          )}

          {coach.experience && (
            <p className="text-blue-100 text-sm mb-2 flex items-center">
              <StarIcon className="h-4 w-4 mr-1" />
              {coach.experience} лет опыта
            </p>
          )}

          {coach.bio && (
            <p className="text-blue-100 text-sm mb-3 line-clamp-2">
              {coach.bio}
            </p>
          )}

          {/* Contact Buttons */}
          <div className="flex space-x-2">
            {coach.whatsappNumber && (
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                WhatsApp
              </button>
            )}
            
            {coach.telegramId && (
              <button
                onClick={handleTelegramClick}
                className="flex items-center px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                <PhoneIcon className="h-4 w-4 mr-1" />
                Telegram
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 