import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GymDetail } from '../../pages';

// Mock the store with a simple approach
jest.mock('../../store', () => ({
  useAppStore: jest.fn((selector) => {
    const state = {
      currentPage: 'gym-detail',
      currentPageParams: { id: '1' },
      navigateToGymDirectory: jest.fn(),
      userLocation: { lat: 43.2220, lng: 76.8512 }
    };
    return selector ? selector(state) : state;
  })
}));

// Mock gymService
jest.mock('../../services/gymService', () => ({
  gymService: {
    getGym: jest.fn(),
    getGymReviews: jest.fn(),
    addReview: jest.fn()
  }
}));

// Mock data
const mockGym = {
  id: '1',
  name: 'Fight Club Almaty',
  description: 'Professional MMA and boxing gym with world-class trainers and facilities. Perfect for both beginners and advanced fighters.',
  sportTypes: ['mma', 'boxing', 'bjj', 'muay_thai'],
  location: {
    address: 'ул. Абая, 150, Алматы',
    city: 'Алматы',
    district: 'Алмалинский',
    coordinates: { lat: 43.2220, lng: 76.8512 },
    distance: 1.2
  },
  priceRange: {
    min: 25000,
    max: 35000,
    currency: 'KZT'
  },
  photos: [
    {
      id: '1',
      url: 'https://example.com/gym1-main.jpg',
      alt: 'Main training area',
      type: 'main' as const,
      order: 1
    },
    {
      id: '2',
      url: 'https://example.com/gym1-ring.jpg',
      alt: 'Boxing ring',
      type: 'interior' as const,
      order: 2
    },
    {
      id: '3',
      url: 'https://example.com/gym1-cage.jpg',
      alt: 'MMA cage',
      type: 'equipment' as const,
      order: 3
    },
    {
      id: '4',
      url: 'https://example.com/gym1-weights.jpg',
      alt: 'Weight training area',
      type: 'equipment' as const,
      order: 4
    }
  ],
  amenities: ['Парковка', 'Душ', 'Раздевалка', 'Сауна', 'Магазин'],
  rating: 4.8,
  reviewCount: 127,
  reviews: [
    {
      id: 'review_1',
      userId: 'user_1',
      userName: 'Дмитрий К.',
      userAvatar: 'https://example.com/avatar1.jpg',
      rating: 5,
      title: 'Отличный зал!',
      comment: 'Отличный зал! Тренеры профессионалы, оборудование современное. Рекомендую всем!',
      date: new Date('2024-01-15'),
      helpful: 12,
      verified: true
    },
    {
      id: 'review_2',
      userId: 'user_2',
      userName: 'Анна С.',
      rating: 4,
      comment: 'Хороший зал, но цены немного высокие. Тренировки качественные.',
      date: new Date('2024-01-10'),
      helpful: 8,
      verified: false
    }
  ],
  contact: {
    phone: '+7 777 123 4567',
    email: 'info@fightclub.kz',
    website: 'https://fightclub.kz'
  },
  workingHours: {
    monday: { open: '07:00', close: '23:00', isOpen: true },
    tuesday: { open: '07:00', close: '23:00', isOpen: true },
    wednesday: { open: '07:00', close: '23:00', isOpen: true },
    thursday: { open: '07:00', close: '23:00', isOpen: true },
    friday: { open: '07:00', close: '23:00', isOpen: true },
    saturday: { open: '08:00', close: '22:00', isOpen: true },
    sunday: { open: '08:00', close: '22:00', isOpen: true }
  },
  packages: [
    {
      id: 'package_1',
      name: 'Безлимит месяц',
      description: 'Неограниченное количество тренировок в течение месяца',
      price: 30000,
      currency: 'KZT',
      duration: 30,
      sessionsIncluded: undefined,
      features: ['Все виды тренировок', 'Групповые занятия', 'Персональные тренировки'],
      popular: true
    }
  ],
  verified: true,
  featured: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('GymDetail', () => {
  beforeEach(() => {
    // Mock gymService responses
    const { gymService } = require('../../services/gymService');
    gymService.getGym.mockResolvedValue(mockGym);
    gymService.getGymReviews.mockResolvedValue({
      reviews: mockGym.reviews,
      total: 2,
      page: 1,
      totalPages: 1
    });
    gymService.addReview.mockResolvedValue({
      id: 'new_review',
      userId: 'user_3',
      userName: 'Новый пользователь',
      rating: 5,
      comment: 'Отличный зал!',
      date: new Date(),
      helpful: 0,
      verified: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders gym detail page', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Fight Club Almaty')).toBeInTheDocument();
        expect(screen.getByText('Professional MMA and boxing gym with world-class trainers and facilities. Perfect for both beginners and advanced fighters.')).toBeInTheDocument();
        expect(screen.getByText('ул. Абая, 150, Алматы')).toBeInTheDocument();
      });
    });

    test('renders gym rating and review count', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('4.8')).toBeInTheDocument();
        expect(screen.getByText('(127 отзывов)')).toBeInTheDocument();
      });
    });

    test('renders sport types', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('MMA')).toBeInTheDocument();
        expect(screen.getByText('Бокс')).toBeInTheDocument();
        expect(screen.getByText('BJJ')).toBeInTheDocument();
        expect(screen.getByText('Муай Тай')).toBeInTheDocument();
      });
    });

    test('renders price range', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('25,000 - 35,000 ₸')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    test('renders tab navigation', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Обзор')).toBeInTheDocument();
        expect(screen.getByText('Фотографии')).toBeInTheDocument();
        expect(screen.getByText('Отзывы')).toBeInTheDocument();
        expect(screen.getByText('Тренеры')).toBeInTheDocument();
      });
    });

    test('switches to photos tab', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        const photosTab = screen.getByText('Фотографии');
        fireEvent.click(photosTab);
      });
      
      expect(screen.getByAltText('Main training area')).toBeInTheDocument();
      expect(screen.getByAltText('Boxing ring')).toBeInTheDocument();
      expect(screen.getByAltText('MMA cage')).toBeInTheDocument();
      expect(screen.getByAltText('Weight training area')).toBeInTheDocument();
    });

    test('switches to reviews tab', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        const reviewsTab = screen.getByText('Отзывы');
        fireEvent.click(reviewsTab);
      });
      
      expect(screen.getByText('Дмитрий К.')).toBeInTheDocument();
      expect(screen.getByText('Отличный зал! Тренеры профессионалы, оборудование современное. Рекомендую всем!')).toBeInTheDocument();
      expect(screen.getByText('Анна С.')).toBeInTheDocument();
      expect(screen.getByText('Хороший зал, но цены немного высокие. Тренировки качественные.')).toBeInTheDocument();
    });
  });

  describe('Contact Information', () => {
    test('displays contact information', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('+7 777 123 4567')).toBeInTheDocument();
        expect(screen.getByText('info@fightclub.kz')).toBeInTheDocument();
        expect(screen.getByText('fightclub.kz')).toBeInTheDocument();
      });
    });

    test('opens phone dialer when phone is clicked', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        const phoneButton = screen.getByTestId('phone-button');
        expect(phoneButton).toHaveAttribute('href', 'tel:+7 777 123 4567');
      });
    });

    test('opens email client when email is clicked', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        const emailButton = screen.getByTestId('email-button');
        expect(emailButton).toHaveAttribute('href', 'mailto:info@fightclub.kz');
      });
    });

    test('opens website when website is clicked', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        const websiteButton = screen.getByTestId('website-button');
        expect(websiteButton).toHaveAttribute('href', 'https://fightclub.kz');
        expect(websiteButton).toHaveAttribute('target', '_blank');
      });
    });
  });

  describe('Working Hours', () => {
    test('displays working hours', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Понедельник - Пятница')).toBeInTheDocument();
        expect(screen.getByText('07:00 - 23:00')).toBeInTheDocument();
        expect(screen.getByText('Суббота - Воскресенье')).toBeInTheDocument();
        expect(screen.getByText('08:00 - 22:00')).toBeInTheDocument();
      });
    });

    test('shows if gym is currently open', async () => {
      // Mock current time to be during working hours
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T14:00:00'));
      
      render(<GymDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Открыто')).toBeInTheDocument();
        expect(screen.getByText('Закрывается в 23:00')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    test('shows if gym is currently closed', async () => {
      // Mock current time to be outside working hours
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T02:00:00'));
      
      render(<GymDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Закрыто')).toBeInTheDocument();
        expect(screen.getByText('Открывается в 07:00')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Amenities', () => {
    test('displays amenities', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Парковка')).toBeInTheDocument();
        expect(screen.getByText('Душ')).toBeInTheDocument();
        expect(screen.getByText('Раздевалка')).toBeInTheDocument();
        expect(screen.getByText('Сауна')).toBeInTheDocument();
        expect(screen.getByText('Магазин')).toBeInTheDocument();
      });
    });
  });

  describe('Location Map', () => {
    test('displays location map', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        const mapContainer = screen.getByTestId('gym-location-map');
        expect(mapContainer).toBeInTheDocument();
      });
    });

    test('opens directions when directions button is clicked', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        const directionsButton = screen.getByTestId('directions-button');
        expect(directionsButton).toHaveAttribute('href', expect.stringContaining('maps'));
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading spinner while fetching gym data', () => {
      const { gymService } = require('../../services/gymService');
      gymService.getGym.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<GymDetail />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('shows error message when gym loading fails', async () => {
      const { gymService } = require('../../services/gymService');
      gymService.getGym.mockRejectedValue(new Error('Failed to load gym details'));
      
      render(<GymDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load gym details')).toBeInTheDocument();
        expect(screen.getByText('Попробовать снова')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper tab navigation', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        const overviewTab = screen.getByText('Обзор');
        expect(overviewTab).toHaveAttribute('aria-selected', 'true');
        
        const photosTab = screen.getByText('Фотографии');
        expect(photosTab).toHaveAttribute('aria-selected', 'false');
      });
    });

    test('has proper alt text for images', async () => {
      render(<GymDetail />);
      
      await waitFor(() => {
        const photosTab = screen.getByText('Фотографии');
        fireEvent.click(photosTab);
        
        expect(screen.getByAltText('Main training area')).toBeInTheDocument();
        expect(screen.getByAltText('Boxing ring')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile screen size', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<GymDetail />);
      
      // Should show mobile-optimized layout
      const mobileContainer = screen.getByTestId('gym-detail-mobile');
      expect(mobileContainer).toBeInTheDocument();
    });

    test('shows mobile navigation for tabs', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<GymDetail />);
      
      await waitFor(() => {
        const mobileTabs = screen.getByTestId('mobile-tabs');
        expect(mobileTabs).toBeInTheDocument();
      });
    });
  });
}); 