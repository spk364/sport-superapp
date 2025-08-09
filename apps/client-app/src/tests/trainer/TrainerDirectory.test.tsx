import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainerDirectory from '../../pages/TrainerDirectory';
import { Trainer } from '../../types';

const mockTrainers: Trainer[] = [
  {
    id: '1',
    firstName: 'Александр',
    lastName: 'Петров',
    avatar: '/avatars/trainer-1.jpg',
    bio: 'Сертифицированный персональный тренер',
    specializations: ['strength_training', 'weight_loss'],
    experience: 8,
    certifications: [],
    rating: 4.8,
    reviewCount: 127,
    reviews: [],
    availability: {
      isAvailable: true,
      schedule: {
        monday: { isAvailable: true, slots: [] },
        tuesday: { isAvailable: true, slots: [] },
        wednesday: { isAvailable: true, slots: [] },
        thursday: { isAvailable: true, slots: [] },
        friday: { isAvailable: true, slots: [] },
        saturday: { isAvailable: true, slots: [] },
        sunday: { isAvailable: false, slots: [] }
      },
      timeSlots: [],
      timezone: 'Asia/Almaty'
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
      packageDiscounts: [],
      currency: 'KZT',
      paymentMethods: ['cash', 'card', 'kaspi'],
      freeConsultation: true
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
  },
  {
    id: '2',
    firstName: 'Мария',
    lastName: 'Иванова',
    avatar: '/avatars/trainer-2.jpg',
    bio: 'Йога-инструктор с опытом',
    specializations: ['yoga', 'meditation'],
    experience: 5,
    certifications: [],
    rating: 4.9,
    reviewCount: 89,
    reviews: [],
    availability: {
      isAvailable: true,
      schedule: {
        monday: { isAvailable: true, slots: [] },
        tuesday: { isAvailable: true, slots: [] },
        wednesday: { isAvailable: true, slots: [] },
        thursday: { isAvailable: true, slots: [] },
        friday: { isAvailable: true, slots: [] },
        saturday: { isAvailable: true, slots: [] },
        sunday: { isAvailable: true, slots: [] }
      },
      timeSlots: [],
      timezone: 'Asia/Almaty'
    },
    contact: {
      phone: '+7 (777) 234-56-78',
      email: 'maria.yoga@example.com',
      preferredContact: 'phone'
    },
    location: {
      city: 'Алматы',
      district: 'Бостандыкский',
      homeVisits: false,
      onlineSessions: true
    },
    pricing: {
      personalSession: 6000,
      packageDiscounts: [],
      currency: 'KZT',
      paymentMethods: ['cash', 'card'],
      freeConsultation: true
    },
    languages: ['Русский', 'English'],
    isActive: true,
    isVerified: true,
    isFeatured: false,
    joinDate: new Date('2021-03-10'),
    lastActive: new Date(),
    stats: {
      totalSessions: 567,
      totalClients: 45,
      averageRating: 4.9,
      responseTime: 8,
      completionRate: 98,
      repeatClientRate: 85
    }
  }
];

// Mock the trainer service
jest.mock('../../services/trainerService', () => ({
  trainerService: {
    searchTrainers: jest.fn(),
    getMockTrainers: jest.fn(() => mockTrainers)
  }
}));

const { trainerService } = require('../../services/trainerService');

describe('TrainerDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    trainerService.searchTrainers.mockResolvedValue({
      trainers: mockTrainers,
      total: 2,
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
  });

  it('renders trainer directory page with header', () => {
    render(<TrainerDirectory />);
    expect(screen.getByText('Найти тренера')).toBeInTheDocument();
  });

  it('displays search input field', () => {
    render(<TrainerDirectory />);
    const searchInput = screen.getByPlaceholderText('Поиск по имени, специализации...');
    expect(searchInput).toBeInTheDocument();
  });

  it('displays filter button', () => {
    render(<TrainerDirectory />);
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<TrainerDirectory />);
    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
  });

  it('displays trainers after loading', async () => {
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    expect(screen.getByText('Мария Иванова')).toBeInTheDocument();
  });

  it('shows trainer count when results are loaded', async () => {
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('Найдено: 2 тренеров')).toBeInTheDocument();
    });
  });

  it('handles search input changes', async () => {
    render(<TrainerDirectory />);
    
    const searchInput = screen.getByPlaceholderText('Поиск по имени, специализации...');
    fireEvent.change(searchInput, { target: { value: 'Александр' } });
    
    await waitFor(() => {
      expect(trainerService.searchTrainers).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'Александр'
        })
      );
    });
  });

  it('toggles filters panel', async () => {
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    const filtersButton = screen.getByText('Фильтры');
    fireEvent.click(filtersButton);
    
    expect(screen.getByText('Специализация')).toBeInTheDocument();
  });

  it('applies specialization filters', async () => {
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    const filtersButton = screen.getByText('Фильтры');
    fireEvent.click(filtersButton);
    
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
  });

  it('applies rating filter', async () => {
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    const filtersButton = screen.getByText('Фильтры');
    fireEvent.click(filtersButton);
    
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

  it('applies sort filter', async () => {
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    const filtersButton = screen.getByText('Фильтры');
    fireEvent.click(filtersButton);
    
    const sortSelect = screen.getByDisplayValue('Рейтинг');
    fireEvent.change(sortSelect, { target: { value: 'experience' } });
    
    await waitFor(() => {
      expect(trainerService.searchTrainers).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            sortBy: 'experience'
          })
        })
      );
    });
  });

  it('clears all filters', async () => {
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    const filtersButton = screen.getByText('Фильтры');
    fireEvent.click(filtersButton);
    
    const clearButton = screen.getByText('Сбросить');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(trainerService.searchTrainers).toHaveBeenCalledWith(
        expect.objectContaining({
          query: '',
          filters: expect.objectContaining({
            specializations: [],
            experience: { min: 0, max: 20 },
            rating: 0,
            sortBy: 'rating'
          })
        })
      );
    });
  });

  it('displays empty state when no trainers found', async () => {
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

    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('Тренеры не найдены')).toBeInTheDocument();
    });

    expect(screen.getByText('Попробуйте изменить параметры поиска или фильтры')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    trainerService.searchTrainers.mockRejectedValue(new Error('API Error'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching trainers:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('makes trainer cards clickable', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    // Find and click on trainer card (button element)
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

  it('calls searchTrainers on component mount', async () => {
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(trainerService.searchTrainers).toHaveBeenCalledWith({
        query: '',
        filters: {
          specializations: [],
          experience: { min: 0, max: 20 },
          rating: 0,
          priceRange: { min: 0, max: 50000 },
          sessionType: [],
          languages: [],
          sortBy: 'rating'
        },
        page: 1,
        limit: 20
      });
    });
  });

  it('updates search results when filters change', async () => {
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Поиск по имени, специализации...');
    fireEvent.change(searchInput, { target: { value: 'yoga' } });
    
    await waitFor(() => {
      expect(trainerService.searchTrainers).toHaveBeenCalledTimes(2);
    });
  });

  it('displays trainer specializations correctly', async () => {
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('strength training')).toBeInTheDocument();
      expect(screen.getByText('weight loss')).toBeInTheDocument();
      expect(screen.getByText('yoga')).toBeInTheDocument();
      expect(screen.getByText('meditation')).toBeInTheDocument();
    });
  });

  it('shows trainer ratings and reviews', async () => {
    render(<TrainerDirectory />);
    
    await waitFor(() => {
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('(127 отзывов)')).toBeInTheDocument();
      expect(screen.getByText('4.9')).toBeInTheDocument();
      expect(screen.getByText('(89 отзывов)')).toBeInTheDocument();
    });
  });
});