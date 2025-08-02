import React from 'react';
import { 
  User, 
  UserCheck, 
  Dumbbell, 
  Users, 
  ArrowRight,
  Building2,
  Heart,
  TrendingUp 
} from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'client' | 'trainer') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Sports Super App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your complete fitness ecosystem connecting athletes with professional trainers
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Client Role */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 group">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Client</h2>
              <p className="text-gray-600 mb-6">
                Find gyms, track progress, and get personalized training with AI assistance
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-700">
                  <Building2 className="w-4 h-4 mr-3 text-blue-500" />
                  <span>Discover and book gyms</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Heart className="w-4 h-4 mr-3 text-blue-500" />
                  <span>AI-powered fitness coaching</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <TrendingUp className="w-4 h-4 mr-3 text-blue-500" />
                  <span>Progress tracking & analytics</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="w-4 h-4 mr-3 text-blue-500" />
                  <span>Connect with trainers</span>
                </div>
              </div>

              <button
                onClick={() => onSelectRole('client')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center group"
              >
                Start Your Fitness Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Trainer Role */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 group">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Trainer</h2>
              <p className="text-gray-600 mb-6">
                Manage clients, create programs, and grow your fitness business
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="w-4 h-4 mr-3 text-purple-500" />
                  <span>Manage client relationships</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Dumbbell className="w-4 h-4 mr-3 text-purple-500" />
                  <span>Create workout programs</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <TrendingUp className="w-4 h-4 mr-3 text-purple-500" />
                  <span>Track client progress</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Building2 className="w-4 h-4 mr-3 text-purple-500" />
                  <span>Business management tools</span>
                </div>
              </div>

              <button
                onClick={() => onSelectRole('trainer')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center group"
              >
                Grow Your Business
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Already have an account? Select your role above to sign in
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;