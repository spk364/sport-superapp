import React, { useState } from 'react';
import { X, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import TrainerSignUp from './TrainerSignUp';
import RoleSelection from './RoleSelection';
import AuthGuide from './AuthGuide';
import { OrganizationRegistrationForm } from '../organization/OrganizationRegistrationForm';
import { authService } from '../../services/authService';

interface AuthContainerProps {
  onAuthSuccess: (accessToken: string, refreshToken: string) => void;
  onClose?: () => void;
  initialMode?: 'signin' | 'signup' | 'trainer-signup' | 'role-selection' | 'organization-registration';
}

type AuthMode = 'role-selection' | 'signin' | 'signup' | 'trainer-signup' | 'organization-registration' | 'forgot-password' | 'reset-success' | 'email-verification';
type UserRole = 'client' | 'trainer' | null;

const AuthContainer: React.FC<AuthContainerProps> = ({
  onAuthSuccess,
  onClose,
  initialMode = 'role-selection'
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode as AuthMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialMode === 'trainer-signup' ? 'trainer' : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleRoleSelection = (role: 'client' | 'trainer') => {
    console.log('Role selected:', role);
    setSelectedRole(role);
    if (role === 'trainer') {
      console.log('Setting mode to organization-registration');
      setMode('organization-registration');
    } else {
      console.log('Setting mode to signup');
      setMode('signup');
    }
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setMode('role-selection');
  };

  const handleSwitchToSignUp = () => {
    if (selectedRole === 'trainer') {
      setMode('trainer-signup');
    } else {
      setMode('signup');
    }
  };

  const handleSwitchToSignIn = () => {
    setMode('signin');
  };

  const handleOrganizationRegistrationSuccess = (organizationId: string) => {
    console.log('Organization registration completed:', organizationId);
    // Store organization ID for later use
    localStorage.setItem('pending-org-id', organizationId);
    // Now proceed to trainer signup
    setMode('trainer-signup');
  };

  const handleOrganizationRegistrationCancel = () => {
    console.log('Organization registration cancelled');
    // Go back to role selection
    handleBackToRoleSelection();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setEmailError('Email is required');
      return;
    }
    
    if (!authService.validateEmail(forgotPasswordEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setEmailError('');

    try {
      const response = await authService.requestPasswordReset({ email: forgotPasswordEmail });
      setResetMessage(response.message);
      setMode('reset-success');
    } catch (error: any) {
      setEmailError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForgotPassword = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your email to receive a reset link</p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <form onSubmit={handleForgotPassword} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="resetEmail"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => {
                    setForgotPasswordEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    emailError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !forgotPasswordEmail}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setMode('signin')}
              className="flex items-center justify-center mx-auto text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResetSuccess = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600">We've sent a password reset link to your email</p>
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">{resetMessage}</p>
            </div>
            
            <p className="text-gray-600">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setMode('forgot-password')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                try again
              </button>
            </p>

            <button
              onClick={() => setMode('signin')}
              className="flex items-center justify-center mx-auto text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      )}

      {/* Render Current Mode */}
      {mode === 'role-selection' && (
        <RoleSelection onSelectRole={handleRoleSelection} />
      )}

      {mode === 'signin' && selectedRole && (
        <SignIn
          onSignInSuccess={onAuthSuccess}
          onSwitchToSignUp={handleSwitchToSignUp}
          onForgotPassword={() => setMode('forgot-password')}
          onBack={handleBackToRoleSelection}
          selectedRole={selectedRole}
          isLoading={isLoading}
        />
      )}

      {mode === 'signup' && selectedRole === 'client' && (
        <SignUp
          onSignUpSuccess={onAuthSuccess}
          onSwitchToSignIn={handleSwitchToSignIn}
          onBack={handleBackToRoleSelection}
          isLoading={isLoading}
        />
      )}

      {mode === 'trainer-signup' && selectedRole === 'trainer' && (
        <>
          {console.log('Rendering TrainerSignUp component')}
          <TrainerSignUp
            onSignUpSuccess={onAuthSuccess}
            onSwitchToSignIn={handleSwitchToSignIn}
            onBack={() => setMode('organization-registration')}
            isLoading={isLoading}
          />
        </>
      )}

      {mode === 'organization-registration' && selectedRole === 'trainer' && (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <button
                    onClick={handleBackToRoleSelection}
                    className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-900">Organization Registration</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Register your fitness business
                  </div>
                  <button
                    onClick={() => setMode('signin')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <OrganizationRegistrationForm
            onSuccess={handleOrganizationRegistrationSuccess}
            onCancel={handleOrganizationRegistrationCancel}
            onSwitchToSignIn={() => setMode('signin')}
          />
        </div>
      )}

      {mode === 'forgot-password' && renderForgotPassword()}

      {mode === 'reset-success' && renderResetSuccess()}
    </div>
  );
};

export default AuthContainer;