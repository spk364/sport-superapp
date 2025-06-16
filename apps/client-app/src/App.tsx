import React from 'react';
import { useAppStore } from './store';
import { Dashboard } from './pages/Dashboard';
import { Progress } from './pages/Progress';
import { Chat } from './pages/Chat';
import { QRScanner } from './pages/QRScanner';
import { BottomNavigation } from './components/common/BottomNavigation';
// Import other pages as needed, e.g., Profile

const App: React.FC = () => {
  const { currentPage } = useAppStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'progress':
        return <Progress />;
      case 'chat':
        return <Chat />;
      case 'qr-scanner':
        return <QRScanner />;
      // case 'profile':
      //   return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="relative min-h-screen">
      <main className="pb-20">
        {renderPage()}
      </main>
      {currentPage !== 'qr-scanner' && <BottomNavigation />}
    </div>
  );
};

export default App; 