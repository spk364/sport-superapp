import React, { useEffect } from 'react';
import { useAppStore } from './store';
import { Dashboard } from './pages/Dashboard';
import { Progress } from './pages/Progress';
import { Chat } from './pages/Chat';
import { QRScanner } from './pages/QRScanner';
import { Profile } from './pages/Profile';
import { BottomNavigation } from './components/common/BottomNavigation';
import { Loader } from './components/common/Loader';

const App: React.FC = () => {
  const fetchUser = useAppStore((state) => state.fetchUser);
  const isLoading = useAppStore((state) => state.isLoading);
  const currentPage = useAppStore((state) => state.currentPage);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  // Show loader while checking authentication
  if (isLoading) {
    return <Loader />;
  }

  // For now, show content regardless of authentication status
  // This prevents the infinite loop while authentication is being handled
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