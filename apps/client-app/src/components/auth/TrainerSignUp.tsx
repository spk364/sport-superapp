import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  UserCheck, 
  User, 
  Phone,
  Check,
  X,
  Building2,
  Award,
  Star,
  FileText
} from 'lucide-react';
import { SignUpRequest } from '../../types';
import { authService } from '../../services/authService';

interface TrainerSignUpProps {
  onSignUpSuccess: (accessToken: string, refreshToken: string) => void;
  onSwitchToSignIn: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const TrainerSignUp: React.FC<TrainerSignUpProps> = ({
  onSignUpSuccess,
  onSwitchToSignIn,
  onBack,
  isLoading: externalLoading = false
}) => {
  const [formData, setFormData] = useState<SignUpRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'trainer',
    agreeToTerms: false,
    subscribeToNewsletter: false,
    businessName: '',
    specializations: [],
    certifications: [],
    experience: '',
    bio: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [passwordValidation, setPasswordValidation] = useState<{isValid: boolean; errors: string[]}>({
    isValid: false,
    errors: []
  });

  const specializationOptions = [
    'Personal Training', 'Weight Loss', 'Muscle Building', 'Cardio Training',
    'Yoga', 'Pilates', 'CrossFit', 'Bodybuilding', 'Functional Training',
    'Sports Specific', 'Rehabilitation', 'Senior Fitness', 'Youth Training'
  ];

  const experienceOptions = [
    'Less than 1 year',
    '1-2 years',
    '3-5 years',
    '6-10 years',
    'More than 10 years'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!authService.validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.businessName?.trim()) {
      newErrors.businessName = 'Business/Professional name is required';
    }

    if (!formData.experience) {
      newErrors.experience = 'Experience level is required';
    }

    if (!formData.specializations || formData.specializations.length === 0) {
      newErrors.specializations = 'Please select at least one specialization';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.isValid) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TrainerSignUp: Form submitted');
    
    if (!validateForm()) {
      console.log('TrainerSignUp: Form validation failed');
      return;
    }

    console.log('TrainerSignUp: Setting loading to true');
    setIsLoading(true);
    setGeneralError('');

    try {
      console.log('TrainerSignUp: Calling authService.signUp with data:', formData);
      const response = await authService.signUp(formData);
      console.log('TrainerSignUp: AuthService response received:', response);
      
      authService.setTokens(response.accessToken, response.refreshToken);
      authService.setUser(response.user);

      // If there's a pending organization ID, associate it with this trainer
      const pendingOrgId = localStorage.getItem('pending-org-id');
      if (pendingOrgId) {
        localStorage.setItem(`org-registration-${response.user.id}`, 'completed');
        localStorage.setItem(`org-id-${response.user.id}`, pendingOrgId);
        localStorage.removeItem('pending-org-id');
        console.log('TrainerSignUp: Associated trainer with organization:', pendingOrgId);
      }
      
      console.log('TrainerSignUp: Calling onSignUpSuccess');
      onSignUpSuccess(response.accessToken, response.refreshToken);
    } catch (error: any) {
      console.error('Trainer sign up error:', error);
      setGeneralError(error.message || 'An error occurred during registration');
    } finally {
      console.log('TrainerSignUp: Setting loading to false');
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignUpRequest, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (generalError) {
      setGeneralError('');
    }

    if (field === 'password' && typeof value === 'string') {
      const validation = authService.validatePassword(value);
      setPasswordValidation(validation);
    }
  };

  const toggleSpecialization = (spec: string) => {
    const current = formData.specializations || [];
    const updated = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec];
    handleInputChange('specializations', updated);
  };

  const isSubmitDisabled = isLoading || externalLoading || !formData.firstName || !formData.lastName || 
    !formData.email || !formData.password || !formData.confirmPassword || !formData.agreeToTerms ||
    !passwordValidation.isValid || formData.password !== formData.confirmPassword || 
    !formData.businessName || !formData.experience || !formData.specializations?.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Trainer Account</h1>
          <p className="text-gray-600">Join our platform and grow your fitness business</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {generalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{generalError}</p>
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="First name"
                    disabled={isLoading || externalLoading}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Last name"
                    disabled={isLoading || externalLoading}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter your email"
                    disabled={isLoading || externalLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="+7 (900) 123-45-67"
                    disabled={isLoading || externalLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Professional Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business/Professional Name *
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.businessName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Your business or professional name"
                    disabled={isLoading || externalLoading}
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.experience ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    disabled={isLoading || externalLoading}
                  >
                    <option value="">Select your experience level</option>
                    {experienceOptions.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specializations * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {specializationOptions.map((spec) => (
                      <label key={spec} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={formData.specializations?.includes(spec) || false}
                          onChange={() => toggleSpecialization(spec)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-2"
                          disabled={isLoading || externalLoading}
                        />
                        <span className="text-gray-700">{spec}</span>
                      </label>
                    ))}
                  </div>
                  {errors.specializations && (
                    <p className="mt-1 text-sm text-red-600">{errors.specializations}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Create a password"
                    disabled={isLoading || externalLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading || externalLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    {passwordValidation.errors.map((error, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <X className="w-3 h-3 text-red-500 mr-1" />
                        <span className="text-red-600">{error}</span>
                      </div>
                    ))}
                    {passwordValidation.isValid && (
                      <div className="flex items-center text-xs">
                        <Check className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-green-600">Password meets all requirements</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Confirm your password"
                    disabled={isLoading || externalLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading || externalLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                
                {formData.confirmPassword && (
                  <div className="mt-1">
                    {formData.password === formData.confirmPassword ? (
                      <div className="flex items-center text-xs">
                        <Check className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-green-600">Passwords match</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-xs">
                        <X className="w-3 h-3 text-red-500 mr-1" />
                        <span className="text-red-600">Passwords do not match</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                  disabled={isLoading || externalLoading}
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                    Privacy Policy
                  </a>
                  <span className="text-red-500"> *</span>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
              )}

              <div className="flex items-center">
                <input
                  id="subscribeToNewsletter"
                  type="checkbox"
                  checked={formData.subscribeToNewsletter}
                  onChange={(e) => handleInputChange('subscribeToNewsletter', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  disabled={isLoading || externalLoading}
                />
                <label htmlFor="subscribeToNewsletter" className="ml-2 block text-sm text-gray-700">
                  Send me business tips and platform updates
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading || externalLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Trainer Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Navigation */}
          <div className="mt-6 flex flex-col space-y-3">
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToSignIn}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                  disabled={isLoading || externalLoading}
                >
                  Sign in
                </button>
              </p>
            </div>
            
            <div className="text-center">
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 text-sm"
                disabled={isLoading || externalLoading}
              >
                ← Back to role selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerSignUp;