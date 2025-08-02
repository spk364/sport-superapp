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
import { GymDirectory, GymDetail } from './pages';
import { BottomNavigation } from './components/common/BottomNavigation';
import { Loader } from './components/common/Loader';
import { AuthContainer } from './components/auth';
import AuthDebug from './components/auth/AuthDebug';
import TrainerDashboard from './components/trainer/TrainerDashboard';
import { authService } from './services/authService';

const App: React.FC = () => {
  const fetchUser = useAppStore((state) => state.fetchUser);
  const isLoading = useAppStore((state) => state.isLoading);
  const currentPage = useAppStore((state) => state.currentPage);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const showAuthModal = useAppStore((state) => state.showAuthModal);
  const authMode = useAppStore((state) => state.authMode);
  const checkAuthStatus = useAppStore((state) => state.checkAuthStatus);
  const hideAuth = useAppStore((state) => state.hideAuth);
  const showAuth = useAppStore((state) => state.showAuth);
  
  // Check current URL path to determine if user wants trainer or client interface
  const currentPath = window.location.pathname;
  const isTrainerPath = currentPath.includes('/trainer') || currentPath.includes('trainer');
  const isClientPath = currentPath.includes('/client') || currentPath === '/';
  const isRootPath = currentPath === '/';

  useEffect(() => {
    // Check authentication status first
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // This effect runs after authentication status is checked
    if (!isAuthenticated) {
      // Only show auth if modal is not already showing
      if (!showAuthModal) {
        console.log('App: User not authenticated, showing auth modal');
        console.log('App: Current path:', currentPath, 'isTrainerPath:', isTrainerPath, 'isRootPath:', isRootPath);
        showAuth('signup'); // Always show signup mode (role selection)
      } else {
        console.log('App: Auth modal already showing, skipping showAuth call');
      }
    } else {
      // User is authenticated - hide any auth modal
      console.log('App: User is authenticated, hiding auth modal');
      if (showAuthModal) {
        hideAuth();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, showAuthModal]);

  const handleAuthSuccess = (accessToken: string, refreshToken: string) => {
    console.log('App: handleAuthSuccess called with tokens');
    console.log('App: isAuthenticated before:', isAuthenticated);
    
    // Authentication successful, hide modal and fetch user data
    hideAuth();
    
    // Check user role and current path
    const storedUser = authService.getStoredUser();
    console.log('App: stored user after auth:', storedUser, 'current path:', currentPath);
    
    // Force fetch user data to update authentication state
    fetchUser();
    
    // Set authentication state immediately
    setTimeout(() => {
      console.log('App: isAuthenticated after fetchUser:', isAuthenticated);
    }, 100);
  };

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
      case 'gyms':
        return <GymDirectory />;
      case 'gym-detail':
        return <GymDetail />;
      default:
        return <Dashboard />;
    }
  };

  // Show loader while checking authentication
  if (isLoading) {
    return <Loader />;
  }

  console.log('App: Rendering with isAuthenticated:', isAuthenticated, 'showAuthModal:', showAuthModal);

  return (
    <div className="relative min-h-screen">
      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50">
          <AuthContainer
            onAuthSuccess={handleAuthSuccess}
            onClose={undefined}
            initialMode={isTrainerPath ? 'organization-registration' : 'role-selection'}
          />
        </div>
      )}

      {/* Main App Content */}
      {isAuthenticated && (
        <>
          {(() => {
            const storedUser = authService.getStoredUser();
            console.log('App: Auth check - stored user:', storedUser);
            console.log('App: User role:', storedUser?.role);
            console.log('App: Current path:', currentPath);
            
            // Show trainer interface only if user has trainer role
            if (storedUser?.role === 'trainer') {
              console.log('App: ✅ RENDERING TRAINER DASHBOARD for role:', storedUser?.role);
              return <TrainerDashboard />;
            }
            
            // Default to client interface
            console.log('App: 📱 RENDERING CLIENT INTERFACE for role:', storedUser?.role || 'undefined');
            return (
              <>
                <main className="pb-20">
                  {renderPage()}
                </main>
                {currentPage !== 'qr-scanner' && <BottomNavigation />}
              </>
            );
          })()}
        </>
      )}

      {/* Fallback: Force show auth if user is not authenticated and no modal is showing */}
      {!isAuthenticated && !showAuthModal && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-gray-600">Loading authentication...</p>
            <button 
              onClick={() => showAuth('signup')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Show Login
            </button>
          </div>
        </div>
      )}

      {/* Auth Debug Component (development only) */}
      <AuthDebug />
    </div>
  );
};

export default App; 