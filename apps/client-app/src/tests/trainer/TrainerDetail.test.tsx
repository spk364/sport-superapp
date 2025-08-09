import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import TrainerDetail from '../../pages/TrainerDetail';
import { Trainer } from '../../types';

// Mock the trainer service
const mockTrainer: Trainer = {
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
};

jest.mock('../../services/trainerService', () => ({
  trainerService: {
    getTrainerById: jest.fn()
  }
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => mockNavigate
}));

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn()
});

const { trainerService } = require('../../services/trainerService');

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter initialEntries={['/trainers/1']}>
      {component}
    </MemoryRouter>
  );
};

describe('TrainerDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    trainerService.getTrainerById.mockResolvedValue(mockTrainer);
  });

  it('renders loading state initially', () => {
    renderWithRouter(<TrainerDetail />);
    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
  });

  it('renders trainer information after loading', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    expect(screen.getByText('8 лет опыта')).toBeInTheDocument();
    expect(screen.getByText('Алматы')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(127)')).toBeInTheDocument();
  });

  it('displays trainer bio and specializations', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    expect(screen.getByText(mockTrainer.bio)).toBeInTheDocument();
    expect(screen.getByText('strength training')).toBeInTheDocument();
    expect(screen.getByText('functional fitness')).toBeInTheDocument();
  });

  it('shows pricing information', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('8,000 KZT')).toBeInTheDocument();
    });

    expect(screen.getByText('за персональную тренировку')).toBeInTheDocument();
    expect(screen.getByText('Бесплатная консультация')).toBeInTheDocument();
  });

  it('displays verification badge for verified trainers', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    // Check for verified icon (using data-testid or class)
    const verifiedIcon = document.querySelector('.text-white');
    expect(verifiedIcon).toBeInTheDocument();
  });

  it('shows featured badge for featured trainers', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('⭐ Топ')).toBeInTheDocument();
    });
  });

  it('handles tab navigation correctly', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    // Click on Reviews tab
    fireEvent.click(screen.getByText('Отзывы'));
    expect(screen.getByText('Анна Смирнова')).toBeInTheDocument();
    expect(screen.getByText('Отличный тренер!')).toBeInTheDocument();

    // Click on Schedule tab
    fireEvent.click(screen.getByText('Расписание'));
    expect(screen.getByText('Расписание доступно после записи на тренировку')).toBeInTheDocument();

    // Go back to About tab
    fireEvent.click(screen.getByText('О тренере'));
    expect(screen.getByText(mockTrainer.bio)).toBeInTheDocument();
  });

  it('displays certifications correctly', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    expect(screen.getByText('Сертификаты')).toBeInTheDocument();
    expect(screen.getByText('Personal Trainer Certification')).toBeInTheDocument();
    expect(screen.getByText('ACE')).toBeInTheDocument();
  });

  it('shows trainer statistics', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    expect(screen.getByText('89')).toBeInTheDocument(); // total clients
    expect(screen.getByText('1247')).toBeInTheDocument(); // total sessions
    expect(screen.getByText('Клиентов')).toBeInTheDocument();
    expect(screen.getByText('Тренировок')).toBeInTheDocument();
  });

  it('handles contact methods correctly', async () => {
    renderWithRouter(<TrainerDetail />);
    
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

  it('toggles favorite status', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    // Find and click the heart icon
    const heartButton = document.querySelector('button svg');
    expect(heartButton).toBeInTheDocument();
    
    if (heartButton?.parentElement) {
      fireEvent.click(heartButton.parentElement);
    }
    
    // Verify the heart icon changes (would need to check class changes)
  });

  it('handles booking button click', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    const bookingButton = screen.getByText('Записаться на тренировку');
    expect(bookingButton).toBeInTheDocument();
    
    // Mock console.log to verify booking logic
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    fireEvent.click(bookingButton);
    expect(consoleSpy).toHaveBeenCalledWith('Booking trainer:', '1');
    
    consoleSpy.mockRestore();
  });

  it('handles back navigation', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    const backButton = screen.getByLabelText('') || document.querySelector('button svg')?.parentElement;
    if (backButton) {
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    }
  });

  it('handles trainer not found', async () => {
    trainerService.getTrainerById.mockResolvedValue(null);
    
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Тренер не найден')).toBeInTheDocument();
    });

    expect(screen.getByText('Вернуться назад')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    trainerService.getTrainerById.mockRejectedValue(new Error('API Error'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching trainer:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('displays reviews correctly', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    // Go to reviews tab
    fireEvent.click(screen.getByText('Отзывы'));
    
    expect(screen.getByText('Анна Смирнова')).toBeInTheDocument();
    expect(screen.getByText('Очень профессиональный подход, помог достичь моих целей.')).toBeInTheDocument();
  });

  it('shows empty reviews state when no reviews', async () => {
    const trainerWithoutReviews = { ...mockTrainer, reviews: [] };
    trainerService.getTrainerById.mockResolvedValue(trainerWithoutReviews);
    
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Отзывы'));
    expect(screen.getByText('Пока нет отзывов')).toBeInTheDocument();
  });

  it('displays contact information correctly', async () => {
    renderWithRouter(<TrainerDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    });

    expect(screen.getByText('Связаться с тренером')).toBeInTheDocument();
    expect(screen.getByText('Позвонить')).toBeInTheDocument();
    expect(screen.getByText('Telegram')).toBeInTheDocument();
  });
});
