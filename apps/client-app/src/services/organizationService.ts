import { SportOrganization } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface OrganizationRegistrationData {
  name: string;
  type: string;
  description?: string;
  specializations: string[];
  packages: Array<{
    name: string;
    description: string;
    price: number;
    currency: string;
    duration?: number;
    sessionsCount?: number;
    features: string[];
    isPopular?: boolean;
  }>;
  contact: {
    phone: string[];
    email: string[];
    website?: string;
    workingHours: any;
    paymentMethods: string[];
  };
  location: {
    country: string;
    city: string;
    address: string;
    postalCode?: string;
    coordinates?: { lat: number; lng: number };
    landmarks?: string;
    parking?: boolean;
    publicTransport?: string;
  };
  legalInfo: {
    bin?: string;
    legalName?: string;
    registrationDate?: string;
    taxRegime?: string;
    director?: string;
    isIndividualEntrepreneur: boolean;
    licenses?: Array<{
      type: string;
      number: string;
      issueDate: string;
      expiryDate?: string;
      issuer: string;
    }>;
  };
  media: {
    logo?: string;
    cover?: string;
    gallery: string[];
    videos?: string[];
    colorScheme?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  socialMedia: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    whatsapp?: string;
    telegram?: string;
    vk?: string;
  };
  trainers: Array<{
    firstName: string;
    lastName: string;
    avatar?: string;
    specializations: string[];
    experience: number;
    certifications: Array<{
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate?: string;
    }>;
    bio?: string;
  }>;
}

export interface BinLookupResponse {
  success: boolean;
  data?: {
    bin: string;
    legalName: string;
    registrationDate: string;
    taxRegime: string;
    director: string;
    status: string;
  };
  error?: string;
}

class OrganizationService {
  async registerOrganization(data: OrganizationRegistrationData): Promise<{ success: boolean; organizationId?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/organizations/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error registering organization:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async lookupByBin(bin: string): Promise<BinLookupResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/organizations/lookup-bin/${bin}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error looking up BIN:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getOrganizations(filters?: {
    type?: string;
    city?: string;
    specializations?: string[];
    priceRange?: { min: number; max: number };
  }): Promise<{ success: boolean; data?: SportOrganization[]; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.city) queryParams.append('city', filters.city);
      if (filters?.specializations?.length) {
        filters.specializations.forEach(spec => queryParams.append('specializations', spec));
      }
      if (filters?.priceRange) {
        queryParams.append('minPrice', filters.priceRange.min.toString());
        queryParams.append('maxPrice', filters.priceRange.max.toString());
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/organizations?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async uploadFile(file: File, type: 'logo' | 'cover' | 'gallery' | 'document'): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${API_BASE_URL}/api/v1/organizations/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const organizationService = new OrganizationService(); 