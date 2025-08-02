import React, { useEffect, useState } from "react";
import { useAppStore } from "./stores/appStore";
import Dashboard from "./components/Dashboard";
import ClientDetail from "./components/ClientDetail";
import { initTelegramApp } from "./utils/telegram";

function App() {
  const { selectedClientId, setSelectedClient, initializeData } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('TrainerApp: Starting initialization...');
    // Initialize Telegram WebApp if available
    initTelegramApp();
    
    // Initialize app data
    initializeData();
    
    // Simulate loading time for better UX
    setTimeout(() => {
      console.log('TrainerApp: Initialization complete, showing dashboard');
      setIsLoading(false);
    }, 1000);
  }, [initializeData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse-gentle">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 scale-110 animate-pulse"></div>
          </div>
          
          <h1 className="text-2xl font-bold gradient-text mb-3">FitTrainer</h1>
          <p className="text-gray-600 mb-6">Загружаем ваши данные...</p>
          
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 safe-area-top safe-area-bottom">
      <div className="animate-fade-in-up">
        {selectedClientId ? (
          <ClientDetail
            clientId={selectedClientId}
            onBack={() => setSelectedClient(null)}
          />
        ) : (
          <Dashboard />
        )}
      </div>
    </div>
  );
}

export default App;
