import React, { useEffect } from 'react';
import { useAppStore } from './store';
import { Dashboard } from './pages/Dashboard';
import { Progress } from './pages/Progress';
import { Chat } from './pages/Chat';
import { OrganizationRegistration } from './pages/OrganizationRegistration';
import { QRScanner } from './pages/QRScanner';
import { Profile } from './pages/Profile';
import { Calendar } from './pages/Calendar';
import { SubscriptionManagement } from './pages/SubscriptionManagement';
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
      case 'calendar':
        return <Calendar />;
      case 'chat':
        return <Chat />;
      case 'subscription':
        return <SubscriptionManagement />;
      case 'notifications':
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Уведомления</h2>
            <p className="text-gray-600">Страница в разработке</p>
          </div>
        </div>;
      case 'organization-registration':
        return <OrganizationRegistration />;
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