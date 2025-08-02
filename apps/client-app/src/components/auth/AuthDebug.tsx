import React from 'react';
import { useAppStore } from '../../store';
import { authService } from '../../services/authService';

const AuthDebug: React.FC = () => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const authUser = useAppStore((state) => state.authUser);
  const showAuthModal = useAppStore((state) => state.showAuthModal);
  const authMode = useAppStore((state) => state.authMode);
  const signOut = useAppStore((state) => state.signOut);
  const showAuth = useAppStore((state) => state.showAuth);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const clearAuthData = () => {
    authService.clearTokens();
    authService.clearUser();
    localStorage.removeItem('app-store');
    window.location.reload();
  };

  const forceShowAuth = () => {
    console.log('AuthDebug: Force showing auth modal');
    showAuth('signup');
  };

  return (
    <div className="fixed bottom-24 right-4 bg-black bg-opacity-80 text-white text-xs p-3 rounded-lg max-w-xs z-50">
      <h4 className="font-bold mb-2">🔧 Auth Debug</h4>
      <div className="space-y-1">
        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Auth Modal:</strong> {showAuthModal ? '✅ Shown' : '❌ Hidden'}
        </div>
        <div>
          <strong>Auth Mode:</strong> {authMode}
        </div>
        <div>
          <strong>User:</strong> {authUser ? authUser.email : 'None'}
        </div>
        <div>
          <strong>Token:</strong> {authService.getAccessToken() ? '✅ Exists' : '❌ None'}
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        <button
          onClick={clearAuthData}
          className="block w-full bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
        >
          🗑️ Clear Auth Data
        </button>
        <button
          onClick={forceShowAuth}
          className="block w-full bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
        >
          🔐 Force Show Auth
        </button>
        <button
          onClick={() => signOut()}
          className="block w-full bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;