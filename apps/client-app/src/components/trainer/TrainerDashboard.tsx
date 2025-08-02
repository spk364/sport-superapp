import React, { useState } from 'react';
import { 
  UserGroupIcon,
  CreditCardIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  TrophyIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const TrainerDashboard: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'analytics' | 'schedule' | 'payments' | 'organization' | 'clients' | 'sessions' | 'revenue' | 'messages' | null>(null);

  const handleOpenAnalytics = () => {
    setActiveModal('analytics');
  };

  const handleOpenSchedule = () => {
    setActiveModal('schedule');
  };

  const handleOpenPayments = () => {
    setActiveModal('payments');
  };

  const handleOpenOrganization = () => {
    setActiveModal('organization');
  };

  const handleOpenClients = () => {
    setActiveModal('clients');
  };

  const handleOpenSessions = () => {
    setActiveModal('sessions');
  };

  const handleOpenRevenue = () => {
    setActiveModal('revenue');
  };

  const handleOpenMessages = () => {
    setActiveModal('messages');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const renderModal = () => {
    if (!activeModal) return null;

    const modalContent = {
      analytics: {
        title: 'Аналитика и статистика',
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900">Доходы за месяц</h4>
                <p className="text-2xl font-bold text-blue-600">185,000 ₸</p>
                <p className="text-sm text-blue-700">+12% к прошлому месяцу</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900">Активные клиенты</h4>
                <p className="text-2xl font-bold text-green-600">42</p>
                <p className="text-sm text-green-700">+5 новых клиентов</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Популярные тренировки</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Персональные тренировки</span>
                  <span className="font-semibold">65%</span>
                </div>
                <div className="flex justify-between">
                  <span>Групповые занятия</span>
                  <span className="font-semibold">25%</span>
                </div>
                <div className="flex justify-between">
                  <span>Онлайн консультации</span>
                  <span className="font-semibold">10%</span>
                </div>
              </div>
            </div>
          </div>
        )
      },
      schedule: {
        title: 'Управление расписанием',
        content: (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Сегодняшние тренировки</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium">Анна Смирнова</p>
                    <p className="text-sm text-gray-600">Персональная тренировка</p>
                  </div>
                  <span className="text-blue-600 font-semibold">09:00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium">Дмитрий Козлов</p>
                    <p className="text-sm text-gray-600">Силовая тренировка</p>
                  </div>
                  <span className="text-blue-600 font-semibold">11:00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium">Группа "Утренний фитнес"</p>
                    <p className="text-sm text-gray-600">6 участников</p>
                  </div>
                  <span className="text-blue-600 font-semibold">07:00</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                Добавить тренировку
              </button>
              <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                Просмотреть календарь
              </button>
            </div>
          </div>
        )
      },
      payments: {
        title: 'Управление платежами',
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Последние платежи</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div>
                      <p className="font-medium">Анна Смирнова</p>
                      <p className="text-sm text-gray-600">Персональные тренировки (8 занятий)</p>
                    </div>
                    <span className="text-green-600 font-semibold">+32,000 ₸</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div>
                      <p className="font-medium">Михаил Петров</p>
                      <p className="text-sm text-gray-600">Групповые занятия (месяц)</p>
                    </div>
                    <span className="text-green-600 font-semibold">+15,000 ₸</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div>
                      <p className="font-medium">Елена Кузнецова</p>
                      <p className="text-sm text-gray-600">Консультация по питанию</p>
                    </div>
                    <span className="text-green-600 font-semibold">+8,000 ₸</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Ожидающие оплаты</h4>
              <p className="text-yellow-800">2 клиента с просроченными платежами</p>
              <button className="mt-2 bg-yellow-500 text-white py-1 px-3 rounded text-sm hover:bg-yellow-600 transition-colors">
                Отправить напоминания
              </button>
            </div>
          </div>
        )
      },
      organization: {
        title: 'Управление организацией',
        content: (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Информация об организации</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Название</p>
                  <p className="font-semibold">FitLife Gym</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Тип организации</p>
                  <p className="font-semibold">Фитнес-центр</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Адрес</p>
                  <p className="font-semibold">ул. Абая, 150, Алматы</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Телефон</p>
                  <p className="font-semibold">+7 (727) 123-45-67</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                Редактировать данные
              </button>
              <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                Управлять тренерами
              </button>
              <button className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">
                Настройки услуг
              </button>
              <button className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                Финансовые отчеты
              </button>
            </div>
          </div>
        )
      },
      clients: {
        title: 'Управление клиентами',
        content: (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Активные клиенты (12)</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      АС
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Анна Смирнова</p>
                      <p className="text-sm text-gray-600">8 тренировок в месяц</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Активен</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                      ДК
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Дмитрий Козлов</p>
                      <p className="text-sm text-gray-600">12 тренировок в месяц</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Активен</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      ЕК
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Елена Кузнецова</p>
                      <p className="text-sm text-gray-600">4 тренировки в месяц</p>
                    </div>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">Нерегулярен</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                Добавить клиента
              </button>
              <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                Просмотреть всех
              </button>
            </div>
          </div>
        )
      },
      sessions: {
        title: 'Сегодняшние сессии',
        content: (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">8 сессий запланировано</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                  <div>
                    <p className="font-medium">07:00 - Групповое занятие</p>
                    <p className="text-sm text-gray-600">Утренний фитнес (6 человек)</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Завершено</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
                  <div>
                    <p className="font-medium">09:00 - Персональная тренировка</p>
                    <p className="text-sm text-gray-600">Анна Смирнова</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">В процессе</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-gray-300">
                  <div>
                    <p className="font-medium">11:00 - Силовая тренировка</p>
                    <p className="text-sm text-gray-600">Дмитрий Козлов</p>
                  </div>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">Ожидание</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-gray-300">
                  <div>
                    <p className="font-medium">14:00 - Групповое занятие</p>
                    <p className="text-sm text-gray-600">Кардио тренировка (4 человека)</p>
                  </div>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">Ожидание</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 font-medium">Следующая сессия в 11:00</p>
              <p className="text-blue-600 text-sm">Дмитрий Козлов - Силовая тренировка</p>
            </div>
          </div>
        )
      },
      revenue: {
        title: 'Доходы за месяц',
        content: (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Общий доход: 785,000 ₸</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Персональные тренировки</p>
                  <p className="text-2xl font-bold text-green-600">510,000 ₸</p>
                  <p className="text-sm text-green-700">65% от общего дохода</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Групповые занятия</p>
                  <p className="text-2xl font-bold text-blue-600">196,000 ₸</p>
                  <p className="text-sm text-blue-700">25% от общего дохода</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Консультации и прочее</p>
                <p className="text-xl font-bold text-purple-600">79,000 ₸</p>
                <p className="text-sm text-purple-700">10% от общего дохода</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Цель на месяц: 850,000 ₸</h4>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full" style={{width: '92%'}}></div>
              </div>
              <p className="text-yellow-800 text-sm">Выполнено 92% (осталось 65,000 ₸)</p>
            </div>
          </div>
        )
      },
      messages: {
        title: 'Сообщения',
        content: (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Новые сообщения (3)</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    АС
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">Анна Смирнова</p>
                      <span className="text-xs text-gray-500">10 мин назад</span>
                    </div>
                    <p className="text-sm text-gray-600">Можно ли перенести завтрашнюю тренировку на час позже?</p>
                    <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs mt-1">Новое</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    ДК
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">Дмитрий Козлов</p>
                      <span className="text-xs text-gray-500">1 час назад</span>
                    </div>
                    <p className="text-sm text-gray-600">Спасибо за программу! Результаты отличные.</p>
                    <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs mt-1">Новое</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    МП
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">Михаил Петров</p>
                      <span className="text-xs text-gray-500">2 часа назад</span>
                    </div>
                    <p className="text-sm text-gray-600">Хочу записаться на персональную консультацию</p>
                    <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs mt-1">Новое</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                Ответить всем
              </button>
              <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                Открыть чат
              </button>
            </div>
          </div>
        )
      }
    };

    const modal = modalContent[activeModal];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{modal.title}</h3>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="p-6">
            {modal.content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <TrophyIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">FitTrainer Dashboard</h1>
            </div>
            <div className="text-sm text-gray-600">
              Профессиональная платформа для управления фитнес-клубами и тренерскими услугами
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <TrophyIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Добро пожаловать в FitTrainer!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Профессиональная платформа для управления фитнес-клубами и тренерскими услугами
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            onClick={handleOpenClients}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Клиенты</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleOpenSessions}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Сессии сегодня</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleOpenRevenue}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCardIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Доход месяц</p>
                <p className="text-2xl font-bold text-gray-900">₸785K</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleOpenMessages}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ChatBubbleLeftIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Сообщения</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Analytics */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Аналитика</h3>
              <p className="text-gray-600 mb-6">
                Отслеживайте прогресс клиентов и доходы
              </p>
              <button 
                onClick={handleOpenAnalytics}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Открыть аналитику
              </button>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Расписание</h3>
              <p className="text-gray-600 mb-6">
                Управляйте записями и тренировками
              </p>
              <button 
                onClick={handleOpenSchedule}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                Управлять записями
              </button>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCardIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Платежи</h3>
              <p className="text-gray-600 mb-6">
                Контролируйте оплаты и абонементы
              </p>
              <button 
                onClick={handleOpenPayments}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
              >
                Просмотреть платежи
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mt-12">
          <button 
            onClick={handleOpenOrganization}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-medium text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Управление организацией
          </button>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default TrainerDashboard;