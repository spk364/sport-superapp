import React from 'react';
import { Info, User, UserPlus, Eye, Shield, Smartphone, Mail } from 'lucide-react';

const AuthGuide: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <div className="flex items-start space-x-3">
        <div className="bg-blue-500 p-2 rounded-lg">
          <Info className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Welcome to the Sports Super App!
          </h3>
          
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium flex items-center mb-2">
                <User className="w-4 h-4 mr-2" />
                Demo Accounts (Quick Start)
              </h4>
              <div className="space-y-3">
                <div className="bg-white rounded p-3 border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-1">Client Account:</p>
                  <p className="font-mono text-blue-900 text-sm">
                    <strong>Email:</strong> demo@example.com<br />
                    <strong>Password:</strong> password
                  </p>
                </div>
                <div className="bg-white rounded p-3 border border-purple-200">
                  <p className="font-semibold text-purple-900 mb-1">Trainer Account:</p>
                  <p className="font-mono text-purple-900 text-sm">
                    <strong>Email:</strong> trainer@example.com<br />
                    <strong>Password:</strong> password
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium flex items-center mb-2">
                <UserPlus className="w-4 h-4 mr-2" />
                Create New Account
              </h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Use any email (works offline with mock data)</li>
                <li>• Password must meet security requirements</li>
                <li>• Account created instantly for demo purposes</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium flex items-center mb-2">
                <Eye className="w-4 h-4 mr-2" />
                What You Can Explore
              </h4>
              <ul className="space-y-1 text-blue-700">
                <li>• 🏋️ <strong>Gym Discovery:</strong> Browse 4 realistic gyms with filters</li>
                <li>• 🤖 <strong>AI Chat:</strong> Talk to your virtual trainer</li>
                <li>• 📊 <strong>Progress Tracking:</strong> Monitor your fitness journey</li>
                <li>• 📅 <strong>Calendar:</strong> View workout schedules</li>
                <li>• 👤 <strong>Profile:</strong> Manage your account settings</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium flex items-center mb-2">
                <Shield className="w-4 h-4 mr-2" />
                Security Features
              </h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Secure token-based authentication</li>
                <li>• Password strength validation</li>
                <li>• Session management</li>
                <li>• Password reset functionality</li>
              </ul>
            </div>

            <div className="bg-white rounded p-3 border border-blue-200">
              <p className="text-blue-900">
                <strong>Note:</strong> This is a demo app running with mock data. 
                All features work offline without requiring real API connections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGuide;