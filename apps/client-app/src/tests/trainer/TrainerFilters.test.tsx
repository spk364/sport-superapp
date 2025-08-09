import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainerFilters from '../../components/trainer/TrainerFilters';
import { TrainerFilters as TrainerFiltersType } from '../../types';

const mockFilters: TrainerFiltersType = {
  specializations: [],
  experience: { min: 0, max: 20 },
  rating: 0,
  priceRange: { min: 0, max: 50000 },
  sessionType: [],
  languages: [],
  sortBy: 'rating'
};

const mockOnFiltersChange = jest.fn();
const mockOnClose = jest.fn();

describe('TrainerFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={false}
      />
    );
    
    expect(screen.queryByText('Фильтры')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
  });

  it('displays all filter sections', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    expect(screen.getByText('Специализация')).toBeInTheDocument();
    expect(screen.getByText('Опыт работы (лет)')).toBeInTheDocument();
    expect(screen.getByText('Минимальный рейтинг')).toBeInTheDocument();
    expect(screen.getByText('Цена за тренировку (тенге)')).toBeInTheDocument();
    expect(screen.getByText('Город')).toBeInTheDocument();
    expect(screen.getByText('Тип тренировок')).toBeInTheDocument();
    expect(screen.getByText('Сортировать по')).toBeInTheDocument();
    expect(screen.getByText('Дополнительно')).toBeInTheDocument();
  });

  it('handles close button click', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles specialization selection', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const strengthTrainingButton = screen.getByText('Силовые тренировки');
    fireEvent.click(strengthTrainingButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      specializations: ['strength_training']
    });
  });

  it('handles deselecting specializations', () => {
    const filtersWithSpecialization = {
      ...mockFilters,
      specializations: ['strength_training'] as any[]
    };
    
    render(
      <TrainerFilters
        filters={filtersWithSpecialization}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const strengthTrainingButton = screen.getByText('Силовые тренировки');
    fireEvent.click(strengthTrainingButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      specializations: []
    });
  });

  it('handles experience range changes', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const minExperienceInput = screen.getByDisplayValue('0');
    fireEvent.change(minExperienceInput, { target: { value: '5' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      experience: { min: 5, max: 20 }
    });
  });

  it('handles rating filter changes', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const fourStarButton = screen.getByText('4+');
    fireEvent.click(fourStarButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      rating: 4
    });
  });

  it('handles price range changes', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const priceInputs = screen.getAllByDisplayValue('0');
    const minPriceInput = priceInputs.find(input => 
      input.previousElementSibling?.textContent === 'От'
    );
    
    if (minPriceInput) {
      fireEvent.change(minPriceInput, { target: { value: '5000' } });
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        priceRange: { min: 5000, max: 50000 }
      });
    }
  });

  it('handles city selection', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const citySelect = screen.getByDisplayValue('Любой город');
    fireEvent.change(citySelect, { target: { value: 'Алматы' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      city: 'Алматы'
    });
  });

  it('handles session type selection', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const personalButton = screen.getByText('Персональные');
    fireEvent.click(personalButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sessionType: ['personal']
    });
  });

  it('handles sort by changes', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const sortSelect = screen.getByDisplayValue('Рейтинг');
    fireEvent.change(sortSelect, { target: { value: 'experience' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sortBy: 'experience'
    });
  });

  it('handles verified filter toggle', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const verifiedCheckbox = screen.getByRole('checkbox', { name: /Только проверенные/ });
    fireEvent.click(verifiedCheckbox);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      verified: true
    });
  });

  it('handles featured filter toggle', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const featuredCheckbox = screen.getByRole('checkbox', { name: /Топ тренеры/ });
    fireEvent.click(featuredCheckbox);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      featured: true
    });
  });

  it('clears all filters when "Сбросить все" is clicked', () => {
    const filtersWithData = {
      specializations: ['strength_training'] as any[],
      experience: { min: 5, max: 15 },
      rating: 4,
      priceRange: { min: 5000, max: 30000 },
      sessionType: ['personal'] as any[],
      languages: ['Русский'],
      city: 'Алматы',
      verified: true,
      featured: true,
      sortBy: 'experience' as any
    };
    
    render(
      <TrainerFilters
        filters={filtersWithData}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const clearButton = screen.getByText('Сбросить все');
    fireEvent.click(clearButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      specializations: [],
      experience: { min: 0, max: 20 },
      rating: 0,
      priceRange: { min: 0, max: 50000 },
      sessionType: [],
      languages: [],
      city: '',
      verified: undefined,
      featured: undefined,
      sortBy: 'rating'
    });
  });

  it('applies filters and closes when "Применить" is clicked', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const applyButton = screen.getByText('Применить');
    fireEvent.click(applyButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays selected specializations with correct styling', () => {
    const filtersWithSpecializations = {
      ...mockFilters,
      specializations: ['strength_training', 'yoga'] as any[]
    };
    
    render(
      <TrainerFilters
        filters={filtersWithSpecializations}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const strengthButton = screen.getByText('Силовые тренировки');
    const yogaButton = screen.getByText('Йога');
    
    expect(strengthButton).toHaveClass('bg-blue-500', 'text-white');
    expect(yogaButton).toHaveClass('bg-blue-500', 'text-white');
  });

  it('displays unselected specializations with correct styling', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const strengthButton = screen.getByText('Силовые тренировки');
    
    expect(strengthButton).toHaveClass('bg-white', 'text-gray-600');
  });

  it('handles multiple session type selections', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const personalButton = screen.getByText('Персональные');
    const groupButton = screen.getByText('Групповые');
    
    fireEvent.click(personalButton);
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sessionType: ['personal']
    });
    
    // Simulate adding group sessions to existing personal
    const updatedFilters = {
      ...mockFilters,
      sessionType: ['personal'] as any[]
    };
    
    render(
      <TrainerFilters
        filters={updatedFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const groupButtonUpdated = screen.getByText('Групповые');
    fireEvent.click(groupButtonUpdated);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sessionType: ['personal', 'group']
    });
  });

  it('validates experience input bounds', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const inputs = screen.getAllByRole('spinbutton');
    const minExperienceInput = inputs.find(input => 
      input.getAttribute('min') === '0' && input.getAttribute('max') === '30'
    );
    
    expect(minExperienceInput).toBeInTheDocument();
    expect(minExperienceInput).toHaveAttribute('min', '0');
    expect(minExperienceInput).toHaveAttribute('max', '30');
  });

  it('shows all city options', () => {
    render(
      <TrainerFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
        isOpen={true}
      />
    );
    
    const citySelect = screen.getByDisplayValue('Любой город');
    fireEvent.click(citySelect);
    
    expect(screen.getByText('Алматы')).toBeInTheDocument();
    expect(screen.getByText('Нур-Султан')).toBeInTheDocument();
    expect(screen.getByText('Шымкент')).toBeInTheDocument();
    expect(screen.getByText('Караганда')).toBeInTheDocument();
    expect(screen.getByText('Актобе')).toBeInTheDocument();
  });
});
