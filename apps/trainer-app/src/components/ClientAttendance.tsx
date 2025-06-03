import React, { useState } from "react";
import { useAppStore } from "../stores/appStore";
import { TrainingSession } from "../types";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  QrCodeIcon, 
  UserIcon, 
  CalendarIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

interface ClientAttendanceProps {
  clientId: string;
}

const ClientAttendance: React.FC<ClientAttendanceProps> = ({ clientId }) => {
  const { sessions, addSession } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [newSession, setNewSession] = useState({
    trainingType: "",
    duration: 60,
    attendance: "present" as "present" | "absent" | "late",
    notes: "",
    checkInMethod: "manual" as "manual" | "qr"
  });

  const clientSessions = sessions.filter(s => s.clientId === clientId);

  const getAttendanceIcon = (attendance: string) => {
    switch (attendance) {
      case "present":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "absent":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "late":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAttendanceText = (attendance: string) => {
    switch (attendance) {
      case "present": return "Присутствовал";
      case "absent": return "Отсутствовал";
      case "late": return "Опоздал";
      default: return attendance;
    }
  };

  const getCheckInIcon = (method?: string) => {
    switch (method) {
      case "qr":
        return <QrCodeIcon className="w-4 h-4 text-telegram-button" />;
      case "manual":
        return <UserIcon className="w-4 h-4 text-telegram-button" />;
      default:
        return null;
    }
  };

  const handleAddSession = () => {
    const session: TrainingSession = {
      id: Date.now().toString(),
      clientId,
      date: new Date(),
      trainingType: newSession.trainingType,
      duration: newSession.duration,
      attendance: newSession.attendance,
      notes: newSession.notes || undefined,
      checkInMethod: newSession.checkInMethod,
      checkInTime: new Date()
    };

    addSession(session);
    setShowAddForm(false);
    setNewSession({
      trainingType: "",
      duration: 60,
      attendance: "present",
      notes: "",
      checkInMethod: "manual"
    });
  };

  const generateQRCode = () => {
    // In a real app, this would generate a QR code for the client to scan
    // For now, we'll just show a placeholder and add a session
    const session: TrainingSession = {
      id: Date.now().toString(),
      clientId,
      date: new Date(),
      trainingType: "QR Check-in",
      duration: 0,
      attendance: "present",
      checkInMethod: "qr",
      checkInTime: new Date()
    };

    addSession(session);
    setShowQRCode(false);
  };

  const attendedCount = clientSessions.filter(s => s.attendance === "present").length;
  const totalCount = clientSessions.length;
  const attendanceRate = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (clientSessions.length === 0 && !showAddForm) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <CalendarIcon className="mx-auto h-12 w-12 text-telegram-hint" />
          <h3 className="mt-2 text-sm font-medium text-telegram-text">Нет записей о тренировках</h3>
          <p className="mt-1 text-sm text-telegram-hint">Тренировки будут отображаться здесь</p>
          <div className="mt-4 space-y-2">
            <button 
              onClick={() => setShowAddForm(true)}
              className="telegram-button w-full"
            >
              Добавить тренировку
            </button>
            <button 
              onClick={() => setShowQRCode(true)}
              className="telegram-button-small w-full flex items-center justify-center space-x-2"
            >
              <QrCodeIcon className="w-4 h-4" />
              <span>QR чек-ин</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-telegram-text">Посещения</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowQRCode(true)}
            className="telegram-button-small flex items-center space-x-1"
          >
            <QrCodeIcon className="w-4 h-4" />
            <span>QR</span>
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="telegram-button-small flex items-center space-x-1"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Добавить</span>
          </button>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="telegram-card mb-4">
        <h3 className="text-lg font-medium text-telegram-text mb-2">Статистика посещений</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-telegram-button">{attendedCount}</div>
            <div className="text-xs text-telegram-hint">Посещено</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-telegram-text">{totalCount}</div>
            <div className="text-xs text-telegram-hint">Всего</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{attendanceRate}%</div>
            <div className="text-xs text-telegram-hint">Посещаемость</div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-telegram-text">История тренировок</h3>
        {clientSessions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((session) => (
          <div key={session.id} className="telegram-card">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getAttendanceIcon(session.attendance)}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-telegram-text">
                    {session.trainingType}
                  </h4>
                  <p className="text-xs text-telegram-hint">
                    {formatDate(new Date(session.date))}
                  </p>
                  {session.duration > 0 && (
                    <p className="text-xs text-telegram-hint">Длительность: {session.duration} мин</p>
                  )}
                  {session.checkInTime && session.checkInMethod && (
                    <div className="flex items-center space-x-1 mt-1">
                      {getCheckInIcon(session.checkInMethod)}
                      <span className="text-xs text-telegram-hint">
                        Отметка в {new Intl.DateTimeFormat('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }).format(new Date(session.checkInTime))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                session.attendance === "present"
                  ? "bg-green-100 text-green-800"
                  : session.attendance === "late"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {getAttendanceText(session.attendance)}
              </span>
            </div>
            {session.notes && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-telegram-text">
                <strong>Заметки:</strong> {session.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Session Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowAddForm(false)}>
          <div className="bg-telegram-bg w-full rounded-t-xl p-4 max-h-96 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-medium text-telegram-text mb-4">Добавить тренировку</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-telegram-text mb-1">
                  Тип тренировки
                </label>
                <select
                  value={newSession.trainingType}
                  onChange={(e) => setNewSession({...newSession, trainingType: e.target.value})}
                  className="w-full p-3 border rounded-lg text-telegram-text bg-telegram-secondary-bg"
                >
                  <option value="">Выберите тип</option>
                  <option value="Силовая тренировка">Силовая тренировка</option>
                  <option value="Кардио">Кардио</option>
                  <option value="Функциональная тренировка">Функциональная тренировка</option>
                  <option value="Йога">Йога</option>
                  <option value="Пилатес">Пилатес</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-telegram-text mb-1">
                  Длительность (минуты)
                </label>
                <input
                  type="number"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border rounded-lg text-telegram-text bg-telegram-secondary-bg"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-telegram-text mb-1">
                  Статус посещения
                </label>
                <select
                  value={newSession.attendance}
                  onChange={(e) => setNewSession({...newSession, attendance: e.target.value as any})}
                  className="w-full p-3 border rounded-lg text-telegram-text bg-telegram-secondary-bg"
                >
                  <option value="present">Присутствовал</option>
                  <option value="absent">Отсутствовал</option>
                  <option value="late">Опоздал</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-telegram-text mb-1">
                  Заметки (необязательно)
                </label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  className="w-full p-3 border rounded-lg text-telegram-text bg-telegram-secondary-bg"
                  rows={3}
                  placeholder="Дополнительные заметки о тренировке..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-telegram-text"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddSession}
                  disabled={!newSession.trainingType}
                  className="flex-1 telegram-button disabled:opacity-50"
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowQRCode(false)}>
          <div className="bg-telegram-bg rounded-xl p-6 m-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-medium text-telegram-text mb-4 text-center">QR Code для чек-ина</h3>
            
            <div className="bg-white p-4 rounded-lg mb-4 text-center">
              <div className="w-32 h-32 mx-auto mb-2 bg-gray-100 rounded flex items-center justify-center">
                <QrCodeIcon className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">QR код для чек-ина клиента</p>
              <p className="text-xs text-gray-400 mt-1">В реальном приложении здесь будет QR код</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowQRCode(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg text-telegram-text"
              >
                Закрыть
              </button>
              <button
                onClick={generateQRCode}
                className="flex-1 telegram-button"
              >
                Симуляция сканирования
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAttendance;
