import React, { useState } from "react";
import { useAppStore } from "../stores/appStore";
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  ChatBubbleLeftIcon,
  PlayIcon,
  DocumentChartBarIcon
} from "@heroicons/react/24/outline";
import ClientAttendance from "./ClientAttendance";
import ClientPayments from "./ClientPayments";
import ClientProgram from "./ClientProgram";
import ClientChat from "./ClientChat";
import ProgramExecution from "./ProgramExecution";

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
}

type TabType = "attendance" | "payments" | "program" | "execution" | "chat";

const ClientDetail: React.FC<ClientDetailProps> = ({ clientId, onBack }) => {
  const { clients } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>("attendance");

  const client = clients.find(c => c.id === clientId);

  if (!client) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 mb-4 touch-feedback"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Назад</span>
        </button>
        <div className="text-center py-8">
          <p className="text-gray-500">Клиент не найден</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { 
      id: "attendance" as TabType, 
      name: "Посещения", 
      icon: CalendarIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    { 
      id: "program" as TabType, 
      name: "Программа", 
      icon: DocumentChartBarIcon,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    { 
      id: "execution" as TabType, 
      name: "Выполнение", 
      icon: PlayIcon,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    { 
      id: "payments" as TabType, 
      name: "Платежи", 
      icon: CreditCardIcon,
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    { 
      id: "chat" as TabType, 
      name: "Чат", 
      icon: ChatBubbleLeftIcon,
      color: "text-pink-500",
      bgColor: "bg-pink-50"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "attendance":
        return <ClientAttendance clientId={clientId} />;
      case "payments":
        return <ClientPayments clientId={clientId} />;
      case "program":
        return <ClientProgram clientId={clientId} />;
      case "execution":
        return <ProgramExecution clientId={clientId} />;
      case "chat":
        return <ClientChat clientId={clientId} />;
      default:
        return <ClientAttendance clientId={clientId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Header with Client Info */}
      <div className="modern-header text-white">
        <div className="px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-100 hover:text-white mb-4 touch-feedback transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Назад к списку</span>
          </button>

          <div className="flex items-center space-x-4 mb-6">
            {client.avatar ? (
              <img
                src={client.avatar}
                alt={client.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 shadow-lg">
                <span className="text-white text-xl font-bold">
                  {client.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white mb-1">{client.name}</h1>
              {client.phone && (
                <p className="text-blue-100 text-sm">{client.phone}</p>
              )}
              {client.email && (
                <p className="text-blue-100 text-sm">{client.email}</p>
              )}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                client.status === "active" 
                  ? "bg-green-500/20 text-green-100 border border-green-400/30" 
                  : "bg-gray-500/20 text-gray-100 border border-gray-400/30"
              }`}>
                {client.status === "active" ? "Активный" : "Неактивный"}
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="px-2 pb-2">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-2xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 touch-feedback ${
                    activeTab === tab.id
                      ? "bg-white text-gray-800 shadow-lg"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-fade-in-up">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ClientDetail;
