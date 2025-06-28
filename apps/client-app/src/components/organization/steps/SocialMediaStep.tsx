import React from 'react';
import { OrganizationRegistrationData } from '../../../services/organizationService';

interface SocialMediaStepProps {
  data: Partial<OrganizationRegistrationData>;
  errors: Record<string, string>;
  onChange: (data: Partial<OrganizationRegistrationData>) => void;
}

export const SocialMediaStep: React.FC<SocialMediaStepProps> = ({ data, errors, onChange }) => {
  const handleSocialChange = (field: string, value: string) => {
    onChange({
      socialMedia: {
        ...data.socialMedia,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Социальные сети</h2>
        <p className="text-gray-600 mb-8">Добавьте ссылки на ваши социальные сети.</p>
      </div>

      {[
        { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
        { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/page' },
        { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/channel' },
        { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/channel' },
        { key: 'whatsapp', label: 'WhatsApp', placeholder: '+7 777 123 45 67' },
      ].map(social => (
        <div key={social.key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">{social.label}</label>
          <input
            type="text"
            value={(data.socialMedia as any)?.[social.key] || ''}
            onChange={(e) => handleSocialChange(social.key, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            placeholder={social.placeholder}
          />
        </div>
      ))}
    </div>
  );
}; 