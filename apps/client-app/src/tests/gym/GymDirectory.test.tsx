import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GymDirectory } from '../../pages';

// Mock the store with a simple approach
jest.mock('../../store', () => ({
  useAppStore: jest.fn((selector) => {
    const state = {
      currentPage: 'gyms',
      navigateToGymDetail: jest.fn(),
      navigateToMapView: jest.fn(),
      userLocation: { lat: 43.2220, lng: 76.8512 }
    };
    return selector ? selector(state) : state;
  })
}));

// Mock gymService
jest.mock('../../services/gymService', () => ({
  gymService: {
    searchGyms: jest.fn(),
    getAvailableFilters: jest.fn()
  }
}));

// Mock data
const mockGyms = [
  {
    id: '1',
    name: 'Fight Club Almaty',
    description: 'Professional MMA and boxing gym with world-class trainers and facilities.',
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
        url: 'https://example.com/gym1.jpg',
        alt: 'Fight Club Almaty',
        type: 'main' as const,
        order: 1
      }
    ],
    amenities: ['Парковка', 'Душ', 'Раздевалка', 'Сауна', 'Магазин'],
    rating: 4.8,
    reviewCount: 127,
    reviews: [],
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
    packages: [],
    verified: true,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockFilters = {
  sportTypes: [
    { value: 'mma', label: 'MMA', count: 15 },
    { value: 'boxing', label: 'Бокс', count: 12 },
    { value: 'bjj', label: 'BJJ', count: 8 }
  ],
  cities: [
    { value: 'almaty', label: 'Алматы', count: 25 },
    { value: 'astana', label: 'Астана', count: 10 }
  ],
  districts: [
    { value: 'almalinsky', label: 'Алмалинский', count: 8 },
    { value: 'medeu', label: 'Медеуский', count: 5 }
  ],
  amenities: [
    { value: 'parking', label: 'Парковка', count: 20 },
    { value: 'shower', label: 'Душ', count: 18 }
  ],
  priceRanges: [
    { value: '0-15000', label: 'До 15,000 ₸', count: 5 },
    { value: '15000-25000', label: '15,000 - 25,000 ₸', count: 12 }
  ]
};

describe('GymDirectory', () => {
  beforeEach(() => {
    // Mock gymService responses
    const { gymService } = require('../../services/gymService');
    gymService.searchGyms.mockResolvedValue({
      gyms: mockGyms,
      total: 1,
      page: 1,
      totalPages: 1,
      filters: mockFilters
    });
    gymService.getAvailableFilters.mockResolvedValue(mockFilters);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders gym directory page', () => {
      render(<GymDirectory />);
      
      expect(screen.getByText('Спортзалы')).toBeInTheDocument();
      expect(screen.getByText('Найдите идеальный спортзал для ваших тренировок')).toBeInTheDocument();
    });

    test('renders search input', () => {
      render(<GymDirectory />);
      
      const searchInput = screen.getByPlaceholderText('Поиск спортзалов...');
      expect(searchInput).toBeInTheDocument();
    });

    test('renders filter button', () => {
      render(<GymDirectory />);
      
      const filterButton = screen.getByText('Фильтры');
      expect(filterButton).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('filters gyms by search query', async () => {
      render(<GymDirectory />);
      
      const searchInput = screen.getByPlaceholderText('Поиск спортзалов...');
      fireEvent.change(searchInput, { target: { value: 'Fight Club' } });
      
      await waitFor(() => {
        expect(screen.getByText('Fight Club Almaty')).toBeInTheDocument();
      });
    });

    test('clears search results when input is cleared', async () => {
      render(<GymDirectory />);
      
      const searchInput = screen.getByPlaceholderText('Поиск спортзалов...');
      fireEvent.change(searchInput, { target: { value: 'Fight Club' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      
      await waitFor(() => {
        expect(screen.getByText('Fight Club Almaty')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    test('opens filter panel when filter button is clicked', async () => {
      render(<GymDirectory />);
      
      const filterButton = screen.getByText('Фильтры');
      fireEvent.click(filterButton);
      
      expect(screen.getByText('Виды спорта')).toBeInTheDocument();
      expect(screen.getByText('Цена')).toBeInTheDocument();
      expect(screen.getByText('Удобства')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('shows loading spinner while fetching gyms', () => {
      const { gymService } = require('../../services/gymService');
      gymService.searchGyms.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<GymDirectory />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('shows error message when gym loading fails', async () => {
      const { gymService } = require('../../services/gymService');
      gymService.searchGyms.mockRejectedValue(new Error('Failed to load gyms'));
      
      render(<GymDirectory />);
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка загрузки спортзалов')).toBeInTheDocument();
        expect(screen.getByText('Попробовать снова')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for search input', () => {
      render(<GymDirectory />);
      
      const searchInput = screen.getByPlaceholderText('Поиск спортзалов...');
      expect(searchInput).toHaveAttribute('aria-label', 'Поиск спортзалов');
    });
  });
}); 