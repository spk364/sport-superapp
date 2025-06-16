import React, { useState } from "react";
import { useAppStore } from "../stores/appStore";
import {
  UserGroupIcon,
  CreditCardIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  Bars3Icon
} from "@heroicons/react/24/outline";
import ClientsList from "./ClientsList";
import AttendanceOverview from "./AttendanceOverview";
import PaymentOverview from "./PaymentOverview";
import MessagesOverview from "./MessagesOverview";
import OrganizationRegistration from './organization/OrganizationRegistration';

type TabType = "clients" | "attendance" | "payments" | "messages";

const Dashboard: React.FC = () => {
  const { 
    clients, 
    sessions, 
    currentOrganization, 
    showRegistrationForm, 
    addOrganization, 
    setShowRegistrationForm 
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>("clients");

  const today = new Date();
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate.toDateString() === today.toDateString();
  });

  const handleRegistrationComplete = (organization: any) => {
    addOrganization(organization);
    // Show success message or redirect
    console.log('Organization registered:', organization);
  };

  const handleRegistrationCancel = () => {
    setShowRegistrationForm(false);
  };

  if (showRegistrationForm) {
    return (
      <OrganizationRegistration
        onComplete={handleRegistrationComplete}
        onCancel={handleRegistrationCancel}
      />
    );
  }

  const tabs = [
    {
      id: "clients" as TabType,
      name: "Клиенты",
      icon: UserGroupIcon,
      count: clients.length,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "attendance" as TabType,
      name: "Посещения",
      icon: CalendarIcon,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "payments" as TabType,
      name: "Платежи",
      icon: CreditCardIcon,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: "messages" as TabType,
      name: "Сообщения",
      icon: ChatBubbleLeftIcon,
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "clients":
        return <ClientsList />;
      case "attendance":
        return <AttendanceOverview />;
      case "payments":
        return <PaymentOverview />;
      case "messages":
        return <MessagesOverview />;
      default:
        return <ClientsList />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {currentOrganization ? currentOrganization.clubName : 'FitTrainer Dashboard'}
            </h1>
            <p className="text-gray-600">
              {currentOrganization ? 
                `Управление ${currentOrganization.clubName}` : 
                'Управление тренировками и клиентами'
              }
            </p>
          </div>
          
          {!currentOrganization && (
            <button
              onClick={() => setShowRegistrationForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Зарегистрировать организацию</span>
            </button>
          )}
        </div>

        {!currentOrganization ? (
          /* Welcome Section for New Users */
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🏋️</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Добро пожаловать в FitTrainer!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Профессиональная платформа для управления фитнес-клубами и тренерскими услугами
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Аналитика</h3>
                  <p className="text-gray-600 text-sm">Отслеживайте прогресс клиентов и доходы</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Расписание</h3>
                  <p className="text-gray-600 text-sm">Управляйте записями и тренировками</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl mb-4">💳</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Платежи</h3>
                  <p className="text-gray-600 text-sm">Контролируйте оплаты и абонементы</p>
                </div>
              </div>

              <button
                onClick={() => setShowRegistrationForm(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl text-lg font-semibold"
              >
                Начать регистрацию
              </button>
            </div>
          </div>
        ) : (
          /* Main Dashboard Content */
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Всего клиентов</p>
                    <p className="text-2xl font-bold text-gray-800">{clients.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Тренировки сегодня</p>
                    <p className="text-2xl font-bold text-gray-800">{todaySessions.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Активные абонементы</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {clients.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Тренеры</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {currentOrganization.trainers?.length || 1}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Info Card */}
            {currentOrganization && (
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {currentOrganization.logo && (
                      <img 
                        src={currentOrganization.logo} 
                        alt="Logo" 
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{currentOrganization.clubName}</h3>
                      <p className="text-gray-600">{currentOrganization.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>📍 {currentOrganization.address?.city}</span>
                        <span>📞 {currentOrganization.trainers?.[0]?.contactInfo?.phone || 'Не указан'}</span>
                        <span>📧 {currentOrganization.trainers?.[0]?.contactInfo?.email || 'Не указан'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {currentOrganization.socialNetworks?.slice(0, 3).map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-sm">{social.platform === 'instagram' ? '📷' : '🌐'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Clients List */}
            <div className="bg-white rounded-2xl shadow-lg">
              <ClientsList />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
