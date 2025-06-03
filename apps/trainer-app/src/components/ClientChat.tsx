import React, { useState } from "react";
import { useAppStore } from "../stores/appStore";
import { PaperAirplaneIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface ClientChatProps {
  clientId: string;
}

const ClientChat: React.FC<ClientChatProps> = ({ clientId }) => {
  const { messages, addMessage } = useAppStore();
  const [newMessage, setNewMessage] = useState("");
  const clientMessages = messages.filter(m => m.clientId === clientId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const message = { id: Date.now().toString(), clientId, senderId: "trainer", senderType: "trainer" as const, message: newMessage.trim(), messageType: "text" as const, timestamp: new Date(), read: true };
    addMessage(message);
    setNewMessage("");
  };

  if (clientMessages.length === 0) {
    return (
      <div className="p-4 h-96 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-telegram-hint" />
            <h3 className="mt-2 text-sm font-medium text-telegram-text">Нет сообщений</h3>
            <p className="mt-1 text-sm text-telegram-hint">Начните переписку с клиентом</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="Напишите сообщение..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-button" />
          <button onClick={sendMessage} disabled={!newMessage.trim()} className="telegram-button disabled:opacity-50">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-96 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {clientMessages.map((message) => (
          <div key={message.id} className={`flex ${message.senderType === "trainer" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg ${message.senderType === "trainer" ? "bg-telegram-button text-telegram-button-text" : "bg-gray-200 text-gray-800"}`}>
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${message.senderType === "trainer" ? "text-blue-100" : "text-gray-500"}`}>
                {format(new Date(message.timestamp), "HH:mm")}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="Напишите сообщение..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-button" />
        <button onClick={sendMessage} disabled={!newMessage.trim()} className="telegram-button disabled:opacity-50">
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ClientChat;
