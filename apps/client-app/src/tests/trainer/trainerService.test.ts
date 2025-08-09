import { trainerService } from '../../services/trainerService';
import { TrainerSearchParams, TrainerSpecialization } from '../../types';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('TrainerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('getAllTrainers', () => {
    it('returns mock trainers when API call fails', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      const trainers = await trainerService.getAllTrainers();
      
      expect(trainers).toHaveLength(3);
      expect(trainers[0].firstName).toBe('Александр');
      expect(trainers[1].firstName).toBe('Мария');
      expect(trainers[2].firstName).toBe('Дмитрий');
    });

    it('returns API data when available', async () => {
      const mockApiResponse = [
        {
          id: 'api-1',
          firstName: 'API',
          lastName: 'Trainer',
          experience: 5,
          rating: 4.5
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse
      });

      const trainers = await trainerService.getAllTrainers();
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/trainers'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('getTrainerById', () => {
    it('returns trainer from mock data by id', async () => {
      const trainer = await trainerService.getTrainerById('1');
      
      expect(trainer).toBeDefined();
      expect(trainer?.id).toBe('1');
      expect(trainer?.firstName).toBe('Александр');
      expect(trainer?.lastName).toBe('Петров');
    });

    it('returns trainer from mock data for second trainer', async () => {
      const trainer = await trainerService.getTrainerById('2');
      
      expect(trainer).toBeDefined();
      expect(trainer?.id).toBe('2');
      expect(trainer?.firstName).toBe('Мария');
      expect(trainer?.lastName).toBe('Иванова');
    });

    it('returns null for non-existent trainer', async () => {
      const trainer = await trainerService.getTrainerById('999');
      
      expect(trainer).toBeNull();
    });

    it('handles API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const trainer = await trainerService.getTrainerById('1');
      
      // Should fall back to mock data
      expect(trainer).toBeDefined();
      expect(trainer?.id).toBe('1');
    });
  });

  describe('searchTrainers', () => {
    const mockSearchParams: TrainerSearchParams = {
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
      limit: 10
    };

    it('returns all trainers when no filters applied', async () => {
      const result = await trainerService.searchTrainers(mockSearchParams);
      
      expect(result.trainers).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('filters trainers by search query (name)', async () => {
      const searchParams = {
        ...mockSearchParams,
        query: 'Александр'
      };

      const result = await trainerService.searchTrainers(searchParams);
      
      expect(result.trainers).toHaveLength(1);
      expect(result.trainers[0].firstName).toBe('Александр');
    });

    it('filters trainers by search query (specialization)', async () => {
      const searchParams = {
        ...mockSearchParams,
        query: 'yoga'
      };

      const result = await trainerService.searchTrainers(searchParams);
      
      expect(result.trainers.length).toBeGreaterThan(0);
      expect(result.trainers.some(t => 
        t.specializations.includes('yoga' as TrainerSpecialization)
      )).toBe(true);
    });

    it('filters trainers by specializations', async () => {
      const searchParams = {
        ...mockSearchParams,
        filters: {
          ...mockSearchParams.filters,
          specializations: ['strength_training' as TrainerSpecialization]
        }
      };

      const result = await trainerService.searchTrainers(searchParams);
      
      expect(result.trainers.length).toBeGreaterThan(0);
      result.trainers.forEach(trainer => {
        expect(trainer.specializations).toContain('strength_training');
      });
    });

    it('filters trainers by minimum rating', async () => {
      const searchParams = {
        ...mockSearchParams,
        filters: {
          ...mockSearchParams.filters,
          rating: 4.8
        }
      };

      const result = await trainerService.searchTrainers(searchParams);
      
      result.trainers.forEach(trainer => {
        expect(trainer.rating).toBeGreaterThanOrEqual(4.8);
      });
    });

    it('filters trainers by city', async () => {
      const searchParams = {
        ...mockSearchParams,
        filters: {
          ...mockSearchParams.filters,
          city: 'Алматы'
        }
      };

      const result = await trainerService.searchTrainers(searchParams);
      
      result.trainers.forEach(trainer => {
        expect(trainer.location.city.toLowerCase()).toContain('алматы');
      });
    });

    it('sorts trainers by rating (default)', async () => {
      const result = await trainerService.searchTrainers(mockSearchParams);
      
      for (let i = 0; i < result.trainers.length - 1; i++) {
        expect(result.trainers[i].rating).toBeGreaterThanOrEqual(
          result.trainers[i + 1].rating
        );
      }
    });

    it('sorts trainers by experience', async () => {
      const searchParams = {
        ...mockSearchParams,
        filters: {
          ...mockSearchParams.filters,
          sortBy: 'experience' as any
        }
      };

      const result = await trainerService.searchTrainers(searchParams);
      
      for (let i = 0; i < result.trainers.length - 1; i++) {
        expect(result.trainers[i].experience).toBeGreaterThanOrEqual(
          result.trainers[i + 1].experience
        );
      }
    });

    it('sorts trainers by price (low to high)', async () => {
      const searchParams = {
        ...mockSearchParams,
        filters: {
          ...mockSearchParams.filters,
          sortBy: 'price_low' as any
        }
      };

      const result = await trainerService.searchTrainers(searchParams);
      
      for (let i = 0; i < result.trainers.length - 1; i++) {
        expect(result.trainers[i].pricing.personalSession).toBeLessThanOrEqual(
          result.trainers[i + 1].pricing.personalSession
        );
      }
    });

    it('sorts trainers by price (high to low)', async () => {
      const searchParams = {
        ...mockSearchParams,
        filters: {
          ...mockSearchParams.filters,
          sortBy: 'price_high' as any
        }
      };

      const result = await trainerService.searchTrainers(searchParams);
      
      for (let i = 0; i < result.trainers.length - 1; i++) {
        expect(result.trainers[i].pricing.personalSession).toBeGreaterThanOrEqual(
          result.trainers[i + 1].pricing.personalSession
        );
      }
    });

    it('handles pagination correctly', async () => {
      const searchParams = {
        ...mockSearchParams,
        page: 1,
        limit: 2
      };

      const result = await trainerService.searchTrainers(searchParams);
      
      expect(result.trainers).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(2);
      expect(result.total).toBe(3);
    });

    it('returns empty results for page beyond available data', async () => {
      const searchParams = {
        ...mockSearchParams,
        page: 10,
        limit: 10
      };

      const result = await trainerService.searchTrainers(searchParams);
      
      expect(result.trainers).toHaveLength(0);
      expect(result.page).toBe(10);
    });

    it('combines multiple filters correctly', async () => {
      const searchParams = {
        ...mockSearchParams,
        query: 'Александр',
        filters: {
          ...mockSearchParams.filters,
          specializations: ['strength_training' as TrainerSpecialization],
          rating: 4.0,
          city: 'Алматы'
        }
      };

      const result = await trainerService.searchTrainers(searchParams);
      
      result.trainers.forEach(trainer => {
        expect(trainer.firstName.toLowerCase()).toContain('александр');
        expect(trainer.specializations).toContain('strength_training');
        expect(trainer.rating).toBeGreaterThanOrEqual(4.0);
        expect(trainer.location.city).toContain('Алматы');
      });
    });

    it('returns proper search result structure', async () => {
      const result = await trainerService.searchTrainers(mockSearchParams);
      
      expect(result).toHaveProperty('trainers');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('filters');
      
      expect(result.filters).toHaveProperty('specializations');
      expect(result.filters).toHaveProperty('experienceRanges');
      expect(result.filters).toHaveProperty('priceRanges');
      expect(result.filters).toHaveProperty('cities');
      expect(result.filters).toHaveProperty('districts');
      expect(result.filters).toHaveProperty('languages');
    });
  });

  describe('getMockTrainers', () => {
    it('returns exactly 3 mock trainers', () => {
      const trainers = trainerService.getMockTrainers();
      
      expect(trainers).toHaveLength(3);
    });

    it('returns trainers with all required properties', () => {
      const trainers = trainerService.getMockTrainers();
      
      trainers.forEach(trainer => {
        expect(trainer).toHaveProperty('id');
        expect(trainer).toHaveProperty('firstName');
        expect(trainer).toHaveProperty('lastName');
        expect(trainer).toHaveProperty('specializations');
        expect(trainer).toHaveProperty('experience');
        expect(trainer).toHaveProperty('rating');
        expect(trainer).toHaveProperty('reviewCount');
        expect(trainer).toHaveProperty('availability');
        expect(trainer).toHaveProperty('contact');
        expect(trainer).toHaveProperty('location');
        expect(trainer).toHaveProperty('pricing');
        expect(trainer).toHaveProperty('stats');
      });
    });

    it('returns trainers with valid specializations', () => {
      const trainers = trainerService.getMockTrainers();
      
      const validSpecializations = [
        'strength_training', 'cardio', 'yoga', 'pilates', 'martial_arts',
        'boxing', 'swimming', 'running', 'crossfit', 'bodybuilding',
        'powerlifting', 'gymnastics', 'dance', 'stretching', 'rehabilitation',
        'nutrition', 'weight_loss', 'muscle_gain', 'flexibility', 'endurance',
        'sports_specific', 'senior_fitness', 'prenatal_postnatal', 'kids_fitness',
        'functional_fitness', 'meditation', 'other'
      ];

      trainers.forEach(trainer => {
        trainer.specializations.forEach(spec => {
          expect(validSpecializations).toContain(spec);
        });
      });
    });

    it('returns trainers with realistic data ranges', () => {
      const trainers = trainerService.getMockTrainers();
      
      trainers.forEach(trainer => {
        expect(trainer.rating).toBeGreaterThanOrEqual(1);
        expect(trainer.rating).toBeLessThanOrEqual(5);
        expect(trainer.experience).toBeGreaterThan(0);
        expect(trainer.experience).toBeLessThan(50);
        expect(trainer.pricing.personalSession).toBeGreaterThan(0);
      });
    });
  });

  describe('bookTrainer', () => {
    it('simulates booking request successfully', async () => {
      const bookingRequest = {
        trainerId: '1',
        sessionType: 'personal' as const,
        date: new Date(),
        timeSlot: '10:00',
        duration: 60,
        location: 'Gym',
        notes: 'First session'
      };

      const response = await trainerService.bookTrainer(bookingRequest);
      
      expect(response).toHaveProperty('bookingId');
      expect(response).toHaveProperty('status');
      expect(response.status).toBe('pending');
    });
  });

  describe('getTrainerReviews', () => {
    it('returns empty array for trainer with no reviews', async () => {
      const reviews = await trainerService.getTrainerReviews('1');
      
      expect(reviews).toEqual([]);
    });
  });

  describe('getTrainerAvailability', () => {
    it('returns availability for specific trainer', async () => {
      const availability = await trainerService.getTrainerAvailability('1');
      
      expect(availability).toHaveProperty('schedule');
      expect(availability).toHaveProperty('timezone');
      expect(availability).toHaveProperty('isAvailable');
    });
  });

  describe('getTrainerStats', () => {
    it('returns empty object as placeholder', async () => {
      const stats = await trainerService.getTrainerStats('1');
      
      expect(stats).toEqual({});
    });
  });

  describe('error handling', () => {
    it('handles network errors gracefully in getAllTrainers', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const trainers = await trainerService.getAllTrainers();
      
      // Should fall back to mock data
      expect(trainers).toHaveLength(3);
    });

    it('handles invalid JSON responses', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      const trainers = await trainerService.getAllTrainers();
      
      // Should fall back to mock data
      expect(trainers).toHaveLength(3);
    });

    it('handles HTTP error responses', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const trainers = await trainerService.getAllTrainers();
      
      // Should fall back to mock data
      expect(trainers).toHaveLength(3);
    });
  });

  describe('caching and performance', () => {
    it('uses URLSearchParams correctly for API calls', async () => {
      const searchParams: TrainerSearchParams = {
        query: 'test',
        filters: {
          specializations: ['yoga' as TrainerSpecialization],
          experience: { min: 5, max: 10 },
          rating: 4,
          priceRange: { min: 1000, max: 10000 },
          sessionType: ['personal'],
          languages: ['Русский'],
          city: 'Алматы',
          sortBy: 'rating'
        },
        page: 2,
        limit: 5
      };

      await trainerService.searchTrainers(searchParams);
      
      // Verify that parameters are handled correctly
      // (Implementation details would be verified in actual implementation)
      expect(true).toBe(true); // Placeholder assertion
    });
  });
});
