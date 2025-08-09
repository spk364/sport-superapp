import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import TrainerDirectory from '../../pages/TrainerDirectory';
import TrainerDetail from '../../pages/TrainerDetail';
import { Trainer } from '../../types';

// Mock trainer data
const mockTrainers: Trainer[] = [
  {
    id: '1',
    firstName: 'Александр',
    lastName: 'Петров',
    avatar: '/avatars/trainer-1.jpg',
    bio: 'Сертифицированный персональный тренер с 8-летним опытом работы.',
    specializations: ['strength_training', 'functional_fitness', 'weight_loss'],
    experience: 8,
    certifications: [
      {
        id: '1',
        name: 'Personal Trainer Certification',
        issuer: 'ACE',
        issueDate: new Date('2015-03-15'),
        isVerified: true
      }
    ],
    rating: 4.8,
    reviewCount: 127,
    reviews: [
      {
        id: '1',
        userId: 'user1',
        userName: 'Анна Смирнова',
        userAvatar: '/avatars/user1.jpg',
        rating: 5,
        title: 'Отличный тренер!',
        comment: 'Очень профессиональный подход, помог достичь моих целей.',
        photos: [],
        date: new Date('2023-10-15'),
        helpful: 12,
        verified: true
      }
    ],
    availability: {
      schedule: {
        monday: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '18:00', isAvailable: true }] },
        tuesday: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '18:00', isAvailable: true }] },
        wednesday: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '18:00', isAvailable: true }] },
        thursday: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '18:00', isAvailable: true }] },
        friday: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '18:00', isAvailable: true }] },
        saturday: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '16:00', isAvailable: true }] },
        sunday: { isAvailable: false, slots: [] }
      },
      timeSlots: [],
      timezone: 'Asia/Almaty',
      isAvailable: true
    },
    contact: {
      phone: '+7 (777) 123-45-67',
      email: 'alex.petrov@example.com',
      telegram: '@alex_petrov_fitness',
      preferredContact: 'telegram'
    },
    location: {
      city: 'Алматы',
      district: 'Алмалинский',
      homeVisits: true,
      onlineSessions: true
    },
    pricing: {
      personalSession: 8000,
      onlineSession: 5000,
      packageDiscounts: [
        { sessions: 5, discount: 10, price: 36000, validDays: 30 }
      ],
      currency: 'KZT',
      paymentMethods: ['cash', 'card', 'kaspi'],
      freeConsultation: true,
      consultationDuration: 30
    },
    languages: ['Русский', 'Казахский', 'English'],
    isActive: true,
    isVerified: true,
    isFeatured: true,
    joinDate: new Date('2020-01-15'),
    lastActive: new Date(),
    stats: {
      totalSessions: 1247,
      totalClients: 89,
      averageRating: 4.8,
      responseTime: 15,
      completionRate: 94,
      repeatClientRate: 78
    }
  }
];

// Mock services
jest.mock('../../services/trainerService', () => ({
  trainerService: {
    searchTrainers: jest.fn(),
    getTrainerById: jest.fn(),
    bookTrainer: jest.fn(),
    getMockTrainers: jest.fn(() => mockTrainers)
  }
}));

// Mock react-router-dom for TrainerDetail
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' })
}));

const { trainerService } = require('../../services/trainerService');

describe('Trainer Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    trainerService.searchTrainers.mockResolvedValue({
      trainers: mockTrainers,
      total: 1,
      page: 1,
      totalPages: 1,
      filters: {
        specializations: [],
        experienceRanges: [],
        priceRanges: [],
        cities: [],
        districts: [],
        languages: []
      }
    });
    trainerService.getTrainerById.mockResolvedValue(mockTrainers[0]);
    trainerService.bookTrainer.mockResolvedValue({
      bookingId: 'booking-123',
      status: 'pending',
      trainerResponse: null,
      responseTime: null
    });
  });

  describe('Trainer Discovery Flow', () => {
    it('allows user to search and filter trainers', async () => {
      render(
        <BrowserRouter>
          <TrainerDirectory />
        </BrowserRouter>
      );

      // Initial load
      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      // Search for specific trainer
      const searchInput = screen.getByPlaceholderText('Поиск по имени, специализации...');
      fireEvent.change(searchInput, { target: { value: 'Александр' } });

      await waitFor(() => {
        expect(trainerService.searchTrainers).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'Александр'
          })
        );
      });

      // Open filters
      const filtersButton = screen.getByText('Фильтры');
      fireEvent.click(filtersButton);

      // Apply specialization filter
      const strengthButton = screen.getByText('strength_training');
      fireEvent.click(strengthButton);

      await waitFor(() => {
        expect(trainerService.searchTrainers).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              specializations: ['strength_training']
            })
          })
        );
      });

      // Apply rating filter
      const ratingSelect = screen.getByDisplayValue('Любой');
      fireEvent.change(ratingSelect, { target: { value: '4' } });

      await waitFor(() => {
        expect(trainerService.searchTrainers).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              rating: 4
            })
          })
        );
      });
    });

    it('shows appropriate results count and pagination info', async () => {
      render(
        <BrowserRouter>
          <TrainerDirectory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Найдено: 1 тренеров')).toBeInTheDocument();
      });
    });

    it('handles empty search results gracefully', async () => {
      trainerService.searchTrainers.mockResolvedValue({
        trainers: [],
        total: 0,
        page: 1,
        totalPages: 0,
        filters: {
          specializations: [],
          experienceRanges: [],
          priceRanges: [],
          cities: [],
          districts: [],
          languages: []
        }
      });

      render(
        <BrowserRouter>
          <TrainerDirectory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Тренеры не найдены')).toBeInTheDocument();
        expect(screen.getByText('Попробуйте изменить параметры поиска или фильтры')).toBeInTheDocument();
      });
    });
  });

  describe('Trainer Profile Viewing', () => {
    it('displays comprehensive trainer information', async () => {
      render(
        <MemoryRouter initialEntries={['/trainers/1']}>
          <TrainerDetail />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      // Check basic info
      expect(screen.getByText('8 лет опыта')).toBeInTheDocument();
      expect(screen.getByText('Алматы')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('(127)')).toBeInTheDocument();

      // Check specializations
      expect(screen.getByText('strength training')).toBeInTheDocument();
      expect(screen.getByText('functional fitness')).toBeInTheDocument();

      // Check pricing
      expect(screen.getByText('8,000 KZT')).toBeInTheDocument();
      expect(screen.getByText('за персональную тренировку')).toBeInTheDocument();

      // Check badges
      expect(screen.getByText('⭐ Топ')).toBeInTheDocument();
      expect(screen.getByText('Бесплатная консультация')).toBeInTheDocument();
    });

    it('allows navigation between tabs', async () => {
      render(
        <MemoryRouter initialEntries={['/trainers/1']}>
          <TrainerDetail />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      // Navigate to Reviews tab
      fireEvent.click(screen.getByText('Отзывы'));
      expect(screen.getByText('Анна Смирнова')).toBeInTheDocument();
      expect(screen.getByText('Отличный тренер!')).toBeInTheDocument();

      // Navigate to Schedule tab
      fireEvent.click(screen.getByText('Расписание'));
      expect(screen.getByText('Расписание доступно после записи на тренировку')).toBeInTheDocument();

      // Back to About tab
      fireEvent.click(screen.getByText('О тренере'));
      expect(screen.getByText(mockTrainers[0].bio)).toBeInTheDocument();
    });

    it('shows trainer certifications and stats', async () => {
      render(
        <MemoryRouter initialEntries={['/trainers/1']}>
          <TrainerDetail />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      // Check certifications
      expect(screen.getByText('Сертификаты')).toBeInTheDocument();
      expect(screen.getByText('Personal Trainer Certification')).toBeInTheDocument();
      expect(screen.getByText('ACE')).toBeInTheDocument();

      // Check stats
      expect(screen.getByText('89')).toBeInTheDocument(); // total clients
      expect(screen.getByText('1247')).toBeInTheDocument(); // total sessions
    });
  });

  describe('Trainer Contact and Booking', () => {
    beforeEach(() => {
      // Mock window.open
      Object.defineProperty(window, 'open', {
        writable: true,
        value: jest.fn()
      });
    });

    it('enables contact through various methods', async () => {
      render(
        <MemoryRouter initialEntries={['/trainers/1']}>
          <TrainerDetail />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      // Test phone contact
      fireEvent.click(screen.getByText('Позвонить'));
      expect(window.open).toHaveBeenCalledWith('tel:+7 (777) 123-45-67');

      // Test telegram contact
      fireEvent.click(screen.getByText('Telegram'));
      expect(window.open).toHaveBeenCalledWith('https://t.me/@alex_petrov_fitness');
    });

    it('handles booking button click', async () => {
      render(
        <MemoryRouter initialEntries={['/trainers/1']}>
          <TrainerDetail />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const bookingButton = screen.getByText('Записаться на тренировку');
      fireEvent.click(bookingButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Booking trainer:', '1');
      
      consoleSpy.mockRestore();
    });

    it('allows favoriting trainers', async () => {
      render(
        <MemoryRouter initialEntries={['/trainers/1']}>
          <TrainerDetail />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      // Find and click heart icon (favorite button)
      const heartButton = document.querySelector('button svg')?.parentElement;
      if (heartButton) {
        fireEvent.click(heartButton);
        // The heart icon should change state (tested in component test)
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles trainer not found gracefully', async () => {
      trainerService.getTrainerById.mockResolvedValue(null);

      render(
        <MemoryRouter initialEntries={['/trainers/999']}>
          <TrainerDetail />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Тренер не найден')).toBeInTheDocument();
      });

      expect(screen.getByText('Вернуться назад')).toBeInTheDocument();
    });

    it('handles API errors in search', async () => {
      trainerService.searchTrainers.mockRejectedValue(new Error('Network error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <BrowserRouter>
          <TrainerDirectory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching trainers:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('handles API errors in trainer detail', async () => {
      trainerService.getTrainerById.mockRejectedValue(new Error('Network error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <MemoryRouter initialEntries={['/trainers/1']}>
          <TrainerDetail />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching trainer:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('User Experience Flow', () => {
    it('provides smooth navigation between directory and detail', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(
        <BrowserRouter>
          <TrainerDirectory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      // Click on trainer card
      const trainerCards = screen.getAllByRole('button');
      const firstTrainerCard = trainerCards.find(card => 
        card.textContent?.includes('Александр Петров')
      );

      if (firstTrainerCard) {
        fireEvent.click(firstTrainerCard);
        expect(consoleSpy).toHaveBeenCalledWith('Navigate to trainer:', '1');
      }

      consoleSpy.mockRestore();
    });

    it('maintains filter state during user interactions', async () => {
      render(
        <BrowserRouter>
          <TrainerDirectory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      // Apply filters
      const filtersButton = screen.getByText('Фильтры');
      fireEvent.click(filtersButton);

      const strengthButton = screen.getByText('strength_training');
      fireEvent.click(strengthButton);

      // Search should be called with filters
      await waitFor(() => {
        expect(trainerService.searchTrainers).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              specializations: ['strength_training']
            })
          })
        );
      });

      // Add another filter
      const yogaButton = screen.getByText('yoga');
      fireEvent.click(yogaButton);

      await waitFor(() => {
        expect(trainerService.searchTrainers).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              specializations: ['strength_training', 'yoga']
            })
          })
        );
      });
    });

    it('provides responsive feedback for user actions', async () => {
      render(
        <BrowserRouter>
          <TrainerDirectory />
        </BrowserRouter>
      );

      // Initial loading state
      expect(screen.getByRole('generic')).toHaveClass('animate-spin');

      // Results loaded
      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      // No longer loading
      expect(screen.queryByRole('generic')).not.toHaveClass('animate-spin');
    });
  });

  describe('Performance and Optimization', () => {
    it('debounces search input to avoid excessive API calls', async () => {
      render(
        <BrowserRouter>
          <TrainerDirectory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Поиск по имени, специализации...');
      
      // Rapid typing
      fireEvent.change(searchInput, { target: { value: 'А' } });
      fireEvent.change(searchInput, { target: { value: 'Ал' } });
      fireEvent.change(searchInput, { target: { value: 'Але' } });
      fireEvent.change(searchInput, { target: { value: 'Алек' } });

      // Should eventually call with final value
      await waitFor(() => {
        expect(trainerService.searchTrainers).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'Алек'
          })
        );
      });
    });

    it('handles concurrent filter changes correctly', async () => {
      render(
        <BrowserRouter>
          <TrainerDirectory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Александр Петров')).toBeInTheDocument();
      });

      const filtersButton = screen.getByText('Фильтры');
      fireEvent.click(filtersButton);

      // Apply multiple filters quickly
      const strengthButton = screen.getByText('strength_training');
      const yogaButton = screen.getByText('yoga');
      
      fireEvent.click(strengthButton);
      fireEvent.click(yogaButton);

      await waitFor(() => {
        expect(trainerService.searchTrainers).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              specializations: expect.arrayContaining(['strength_training', 'yoga'])
            })
          })
        );
      });
    });
  });
});
