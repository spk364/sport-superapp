import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainerCard from '../../components/trainer/TrainerCard';
import { Trainer } from '../../types';

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
  reviews: [],
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

const mockOnClick = jest.fn();

describe('TrainerCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trainer basic information', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    expect(screen.getByText('Александр Петров')).toBeInTheDocument();
    expect(screen.getByText('8 лет опыта')).toBeInTheDocument();
    expect(screen.getByText('Алматы')).toBeInTheDocument();
  });

  it('displays trainer avatar with correct alt text', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    const avatar = screen.getByAltText('Александр Петров');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/avatars/trainer-1.jpg');
  });

  it('shows rating and review count', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(127 отзывов)')).toBeInTheDocument();
  });

  it('displays pricing information correctly', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    expect(screen.getByText('8,000 ₸/час')).toBeInTheDocument();
  });

  it('shows specializations with correct labels', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    expect(screen.getByText('Силовые тренировки')).toBeInTheDocument();
    expect(screen.getByText('Функциональный фитнес')).toBeInTheDocument();
    expect(screen.getByText('Похудение')).toBeInTheDocument();
  });

  it('displays featured badge for featured trainers', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    expect(screen.getByText('Топ')).toBeInTheDocument();
  });

  it('shows verified badge for verified trainers', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    const verifiedBadge = screen.getByText('Проверен');
    expect(verifiedBadge).toBeInTheDocument();
  });

  it('indicates online sessions availability', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    expect(screen.getByText('Онлайн')).toBeInTheDocument();
  });

  it('shows availability status when trainer is available', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    expect(screen.getByText('Доступен')).toBeInTheDocument();
  });

  it('shows unavailable status when trainer is not available', () => {
    const unavailableTrainer = {
      ...mockTrainer,
      availability: {
        ...mockTrainer.availability,
        isAvailable: false
      }
    };
    
    render(<TrainerCard trainer={unavailableTrainer} onClick={mockOnClick} />);
    
    expect(screen.getByText('Недоступен')).toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledWith('1');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('formats large prices correctly', () => {
    const expensiveTrainer = {
      ...mockTrainer,
      pricing: {
        ...mockTrainer.pricing,
        personalSession: 25000
      }
    };
    
    render(<TrainerCard trainer={expensiveTrainer} onClick={mockOnClick} />);
    
    expect(screen.getByText('25,000 ₸/час')).toBeInTheDocument();
  });

  it('limits displayed specializations to 3', () => {
    const trainerWithManySpecs = {
      ...mockTrainer,
      specializations: [
        'strength_training',
        'cardio',
        'yoga',
        'pilates',
        'boxing'
      ] as any[]
    };
    
    render(<TrainerCard trainer={trainerWithManySpecs} onClick={mockOnClick} />);
    
    expect(screen.getByText('Силовые тренировки')).toBeInTheDocument();
    expect(screen.getByText('Кардио')).toBeInTheDocument();
    expect(screen.getByText('Йога')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('handles trainer without featured status', () => {
    const regularTrainer = {
      ...mockTrainer,
      isFeatured: false
    };
    
    render(<TrainerCard trainer={regularTrainer} onClick={mockOnClick} />);
    
    expect(screen.queryByText('Топ')).not.toBeInTheDocument();
  });

  it('handles trainer without verification', () => {
    const unverifiedTrainer = {
      ...mockTrainer,
      isVerified: false
    };
    
    render(<TrainerCard trainer={unverifiedTrainer} onClick={mockOnClick} />);
    
    expect(screen.queryByText('Проверен')).not.toBeInTheDocument();
  });

  it('handles trainer without online sessions', () => {
    const offlineTrainer = {
      ...mockTrainer,
      location: {
        ...mockTrainer.location,
        onlineSessions: false
      }
    };
    
    render(<TrainerCard trainer={offlineTrainer} onClick={mockOnClick} />);
    
    expect(screen.queryByText('Онлайн')).not.toBeInTheDocument();
  });

  it('displays trainer bio snippet', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    // Check if bio is truncated correctly (first part should be visible)
    expect(screen.getByText(/Сертифицированный персональный тренер/)).toBeInTheDocument();
  });

  it('handles missing avatar gracefully', () => {
    const trainerWithoutAvatar = {
      ...mockTrainer,
      avatar: undefined
    };
    
    render(<TrainerCard trainer={trainerWithoutAvatar} onClick={mockOnClick} />);
    
    const avatar = screen.getByAltText('Александр Петров');
    expect(avatar).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'border');
  });

  it('shows response time in stats', () => {
    render(<TrainerCard trainer={mockTrainer} onClick={mockOnClick} />);
    
    expect(screen.getByText('~15 мин')).toBeInTheDocument();
  });

  it('handles zero reviews correctly', () => {
    const trainerWithNoReviews = {
      ...mockTrainer,
      reviewCount: 0
    };
    
    render(<TrainerCard trainer={trainerWithNoReviews} onClick={mockOnClick} />);
    
    expect(screen.getByText('(0 отзывов)')).toBeInTheDocument();
  });

  it('displays different currency correctly', () => {
    const usdTrainer = {
      ...mockTrainer,
      pricing: {
        ...mockTrainer.pricing,
        currency: 'USD',
        personalSession: 50
      }
    };
    
    render(<TrainerCard trainer={usdTrainer} onClick={mockOnClick} />);
    
    expect(screen.getByText('50 $/час')).toBeInTheDocument();
  });
});
