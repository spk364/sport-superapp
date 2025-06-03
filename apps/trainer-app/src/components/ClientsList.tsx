import React from "react";
import { useAppStore } from "../stores/appStore";
import { ChevronRightIcon, UserCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const ClientsList: React.FC = () => {
  const { clients, setSelectedClient } = useAppStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-badge status-active";
      case "inactive":
        return "status-badge bg-gray-400/20 text-gray-600";
      case "suspended":
        return "status-badge status-danger";
      default:
        return "status-badge bg-gray-400/20 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Активен";
      case "inactive":
        return "Неактивен";
      case "suspended":
        return "Заблокирован";
      default:
        return status;
    }
  };

  if (clients.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12 animate-fade-in-up">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <UserCircleIcon className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Нет клиентов</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Добавьте первого клиента для начала работы с приложением
          </p>
          <button className="telegram-button flex items-center space-x-2 mx-auto touch-feedback">
            <PlusIcon className="w-5 h-5" />
            <span>Добавить клиента</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800">Ваши клиенты</h2>
        <button className="telegram-button-small flex items-center space-x-2 touch-feedback">
          <PlusIcon className="w-4 h-4" />
          <span>Добавить</span>
        </button>
      </div>

      <div className="grid gap-3 animate-fade-in-up">
        {clients.map((client, index) => (
          <div
            key={client.id}
            onClick={() => setSelectedClient(client.id)}
            className="telegram-card cursor-pointer touch-feedback hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center space-x-4">
              {client.avatar ? (
                <div className="relative">
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-14 h-14 rounded-2xl object-cover shadow-md"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                    client.status === "active" ? "bg-green-400" : "bg-gray-400"
                  }`}></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-white text-lg font-bold">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                    client.status === "active" ? "bg-green-400" : "bg-gray-400"
                  }`}></div>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-semibold text-gray-800 truncate">
                    {client.name}
                  </h3>
                  <span className={getStatusColor(client.status)}>
                    {getStatusText(client.status)}
                  </span>
                </div>

                <div className="space-y-1">
                  {client.phone && (
                    <p className="text-sm text-gray-600">{client.phone}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Присоединился{" "}
                    {format(new Date(client.joinDate), "d MMM yyyy", {
                      locale: ru,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
        <h3 className="font-semibold text-gray-800 mb-3">Быстрые действия</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center space-x-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 touch-feedback">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <PlusIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Новый клиент</span>
          </button>
          <button className="flex items-center space-x-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 touch-feedback">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <UserCircleIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Импорт</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientsList;
