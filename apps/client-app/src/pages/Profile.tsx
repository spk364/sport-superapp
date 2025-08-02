import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  CogIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  TrophyIcon,
  WrenchScrewdriverIcon,
  ArrowUpIcon,
  ScaleIcon,
  HeartIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { Header } from '../components/common/Header';
import { ProfileSection } from '../components/profile/ProfileSection';
import { ProfileInfoRow } from '../components/profile/ProfileInfoRow';
import { Questionnaire } from '../components/questionnaire/Questionnaire';
import { useAppStore } from '../store';
import { aiService } from '../services/aiService';

export const Profile: React.FC = () => {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const startQuestionnaire = useAppStore((state) => state.startQuestionnaire);
  const isQuestionnaireActive = useAppStore((state) => state.isQuestionnaireActive);
  const setQuestionnaireActive = useAppStore((state) => state.setQuestionnaireActive);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  
  const [refreshing, setRefreshing] = useState(false);

  const refreshProfile = async () => {
    try {
      setRefreshing(true);
      const updatedUser = await aiService.getCurrentUser();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      refreshProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    const signOut = useAppStore.getState().signOut;
    signOut();
  };

  const handleQuestionnaireComplete = async (answers: Record<string, any>) => {
    try {
      await updateUserProfile(answers);
      await refreshProfile(); // Refresh to get updated data
    } catch (error) {
      console.error('Failed to complete questionnaire:', error);
    }
  };

  const handleQuestionnaireClose = () => {
    setQuestionnaireActive(false);
  };

  const getProfileCompleteness = () => {
    if (!user) return 0;
    
    console.log('Calculating profile completeness for user:', user);
    
    // Check all the questionnaire fields that should be available
    const fields = [
      user.preferences?.age,                              // ✅ Age: 30
      user.preferences?.gender,                           // ✅ Gender: "Мужской"  
      user.preferences?.nutrition_goal,                   // ✅ Nutrition: "Похудение..."
      user.preferences?.food_preferences?.length,        // ✅ Food prefs: 1
      user.preferences?.allergies?.length,               // ✅ Allergies: 1
      user.client_profile?.goals?.length,                // ✅ Goals: 1
      user.client_profile?.fitness_level,                // ✅ Fitness: "Продвинутый..."
      user.client_profile?.equipment_available?.length,  // 🔧 Equipment: 3 items
      user.client_profile?.limitations?.length,          // 🔧 Limitations: 1 item
      user.client_profile?.body_metrics?.height,         // 🔧 Height: 191
      user.client_profile?.body_metrics?.weight,         //  Weight: 97
    ];
    
    console.log('Profile completeness fields:', fields);
    
    const completedFields = fields.filter(field => {
      const isComplete = field !== undefined && field !== null && field !== 0 && field !== "";
      console.log('Field value:', field, 'Is complete:', isComplete);
      return isComplete;
    }).length;
    
    const percentage = Math.round((completedFields / fields.length) * 100);
    console.log(`Profile completeness: ${completedFields}/${fields.length} = ${percentage}%`);
    
    return percentage;
  };

  const isProfileIncomplete = getProfileCompleteness() < 80;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSubscriptionStatus = () => {
    const profile = user?.client_profile;
    if (!profile) return 'Не определен';
    
    if (profile.subscription_status === 'active') {
      return 'Активен';
    } else if (profile.subscription_status === 'expired') {
      return 'Истек';
    } else {
      return 'Неактивен';
    }
  };

  const getSubscriptionColor = () => {
    const status = user?.client_profile?.subscription_status;
    if (status === 'active') return 'text-green-600';
    if (status === 'expired') return 'text-red-600';
    return 'text-gray-600';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Профиль" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Профиль" />
      
      <main className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-primary-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user.firstName || user.name}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-gray-500">{user.phone}</p>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={refreshProfile}
                disabled={refreshing}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {refreshing ? 'Обновление...' : 'Обновить'}
              </button>
              <button
                onClick={startQuestionnaire}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
              >
                Анкета
              </button>
            </div>
          </div>
        </div>

        {/* Debug Info - показываем сырые данные */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-bold mb-2">Debug: User Data</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({ 
                preferences: user.preferences, 
                client_profile: user.client_profile 
              }, null, 2)}
            </pre>
          </div>
        )}

        {/* Profile Completion Banner */}
        {isProfileIncomplete && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Заполните профиль
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Ваш профиль заполнен на {getProfileCompleteness()}%. Заполните анкету для получения персонализированных тренировок.
                </p>
                <button
                  onClick={startQuestionnaire}
                  className="mt-2 text-sm font-medium text-blue-800 underline hover:text-blue-900"
                >
                  Заполнить анкету
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status */}
        <ProfileSection title="Статус подписки">
          <ProfileInfoRow
            icon={CheckCircleIcon}
            label="Статус"
            value={<span className={getSubscriptionColor()}>{getSubscriptionStatus()}</span>}
          />
          {user.client_profile?.subscription_expires && (
            <ProfileInfoRow
              icon={CalendarIcon}
              label="Действует до"
              value={formatDate(user.client_profile.subscription_expires)}
            />
          )}
        </ProfileSection>

        {/* Fitness Profile */}
        {user.client_profile && (
          <ProfileSection title="Фитнес профиль">
            {user.client_profile.fitness_level && (
              <ProfileInfoRow
                icon={UserIcon}
                label="Уровень подготовки"
                value={user.client_profile.fitness_level}
              />
            )}
            
            {user.client_profile.goals && user.client_profile.goals.length > 0 && (
              <ProfileInfoRow
                icon={TrophyIcon}
                label="Цели"
                value={user.client_profile.goals.join(', ')}
              />
            )}
            
            {user.client_profile.equipment_available && user.client_profile.equipment_available.length > 0 && (
              <ProfileInfoRow
                icon={WrenchScrewdriverIcon}
                label="Доступное оборудование"
                value={user.client_profile.equipment_available.join(', ')}
              />
            )}
            
            {user.client_profile.limitations && user.client_profile.limitations.length > 0 && (
              <ProfileInfoRow
                icon={ExclamationTriangleIcon}
                label="Ограничения"
                value={user.client_profile.limitations.join(', ')}
              />
            )}
          </ProfileSection>
        )}

        {/* Personal Data */}
        {user.preferences && (
          <ProfileSection title="Личные данные">
            {user.preferences.age && (
              <ProfileInfoRow
                icon={UserIcon}
                label="Возраст"
                value={`${user.preferences.age} лет`}
              />
            )}
            
            {user.preferences.gender && (
              <ProfileInfoRow
                icon={UserIcon}
                label="Пол"
                value={user.preferences.gender}
              />
            )}
            
            {user.client_profile?.body_metrics?.height && (
              <ProfileInfoRow
                icon={ArrowUpIcon}
                label="Рост"
                value={`${user.client_profile.body_metrics.height} см`}
              />
            )}
            
            {user.client_profile?.body_metrics?.weight && (
              <ProfileInfoRow
                icon={ScaleIcon}
                label="Вес"
                value={`${user.client_profile.body_metrics.weight} кг`}
              />
            )}
          </ProfileSection>
        )}

        {/* Nutrition */}
        {user.preferences && (
          <ProfileSection title="Питание">
            {user.preferences.nutrition_goal && (
              <ProfileInfoRow
                icon={HeartIcon}
                label="Цель питания"
                value={user.preferences.nutrition_goal}
              />
            )}
            
            {user.preferences.food_preferences && user.preferences.food_preferences.length > 0 && (
              <ProfileInfoRow
                icon={HeartIcon}
                label="Пищевые предпочтения"
                value={user.preferences.food_preferences.join(', ')}
              />
            )}
            
            {user.preferences.allergies && user.preferences.allergies.length > 0 && (
              <ProfileInfoRow
                icon={ExclamationTriangleIcon}
                label="Аллергии"
                value={user.preferences.allergies.join(', ')}
              />
            )}
          </ProfileSection>
        )}

        {/* Account Info */}
        <ProfileSection title="Информация об аккаунте">
          <ProfileInfoRow
            icon={EnvelopeIcon}
            label="Email"
            value={user.email}
          />
          
          {user.telegram_id && (
            <ProfileInfoRow
              icon={ChatBubbleLeftRightIcon}
              label="Telegram"
              value={user.telegram_id}
            />
          )}
          
          <ProfileInfoRow
            icon={CalendarIcon}
            label="Дата регистрации"
            value={formatDate(user.created_at)}
          />
          
          <ProfileInfoRow
            icon={UserIcon}
            label="Роль"
            value={user.role === 'client' ? 'Клиент' : user.role}
          />
        </ProfileSection>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CogIcon className="h-5 w-5 mr-2 text-gray-600" />
              Настройки
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            <button className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <BellIcon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900">Уведомления</span>
              </div>
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-400" />
            </button>
            
            <button className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <QuestionMarkCircleIcon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900">Помощь</span>
              </div>
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-400" />
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center space-x-3 text-left hover:bg-gray-50 transition-colors text-red-600"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </main>

      {/* Questionnaire Modal */}
      {isQuestionnaireActive && (
        <Questionnaire
          onComplete={handleQuestionnaireComplete}
          onClose={handleQuestionnaireClose}
        />
      )}
    </div>
  );
}; 