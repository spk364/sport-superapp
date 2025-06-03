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

type TabType = "clients" | "attendance" | "payments" | "messages";

const Dashboard: React.FC = () => {
  const { clients } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>("clients");

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
    <div className="min-h-screen">
      {/* Modern Header */}
      <div className="modern-header text-white">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">FitTrainer</h1>
              <p className="text-blue-100 text-sm">
                Управление клиентами и тренировками
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Bars3Icon className="w-6 h-6" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass-effect rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">{clients.length}</div>
              <div className="text-blue-100 text-sm">Активных клиентов</div>
            </div>
            <div className="glass-effect rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">8</div>
              <div className="text-blue-100 text-sm">Тренировок сегодня</div>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="px-2">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-2xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white text-gray-800 shadow-lg"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{tab.name}</span>
                  {tab.count !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                      activeTab === tab.id 
                        ? "bg-blue-500 text-white" 
                        : "bg-white/20 text-blue-100"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pb-6">
        <div className="animate-fade-in-up">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
