import React, { useEffect } from 'react';
import { useAppStore } from './store';
import { aiService } from './services/aiService';
import { Dashboard } from './pages/Dashboard';
import { Progress } from './pages/Progress';
import { Chat } from './pages/Chat';
import { QRScanner } from './pages/QRScanner';
import { Profile } from './pages/Profile';
import { BottomNavigation } from './components/common/BottomNavigation';
// Import other pages as needed, e.g., Profile

const App: React.FC = () => {
  const { currentPage, setUser, setLoading, setError } = useAppStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const user = await aiService.getCurrentUser();
        // The backend `name` field needs to be split for the UI
        const [firstName, ...lastNameParts] = user.name.split(' ');
        const augmentedUser = {
          ...user,
          firstName,
          lastName: lastNameParts.join(' '),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
        };
        setUser(augmentedUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setUser, setLoading, setError]);

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