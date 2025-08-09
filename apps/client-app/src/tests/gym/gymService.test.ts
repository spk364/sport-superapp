import { gymService } from '../../services/gymService';

// Mock fetch
global.fetch = jest.fn();

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv, REACT_APP_API_URL: 'http://localhost:8000' };
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

describe('gymService', () => {
  describe('searchGyms', () => {
    test('fetches gyms successfully', async () => {
      const mockResponse = {
        gyms: [
          {
            id: '1',
            name: 'Fight Club Almaty',
            description: 'Professional MMA and boxing gym',
            sportTypes: ['mma', 'boxing', 'bjj'],
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
            photos: [],
            amenities: ['Парковка', 'Душ', 'Раздевалка'],
            rating: 4.8,
            reviewCount: 127,
            reviews: [],
            contact: {
              phone: '+7 777 123 4567',
              email: 'info@fightclub.kz',
              website: 'https://fightclub.kz'
            },
            workingHours: {},
            packages: [],
            verified: true,
            featured: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: 1,
        page: 1,
        totalPages: 1,
        filters: {
          sportTypes: [],
          cities: [],
          districts: [],
          amenities: [],
          priceRanges: []
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await gymService.searchGyms({
        query: 'Fight Club',
        filters: {
          sportTypes: [],
          priceRange: { min: 0, max: 50000 },
          amenities: [],
          sortBy: 'rating'
        },
        page: 1,
        limit: 10
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/gyms/search',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: 'Fight Club',
            filters: {
              sportTypes: [],
              priceRange: { min: 0, max: 50000 },
              amenities: [],
              sortBy: 'rating'
            },
            page: 1,
            limit: 10
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('handles API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(gymService.searchGyms({
        query: '',
        filters: {
          sportTypes: [],
          priceRange: { min: 0, max: 50000 },
          amenities: [],
          sortBy: 'rating'
        },
        page: 1,
        limit: 10
      })).rejects.toThrow('Failed to search gyms');
    });

    test('handles network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(gymService.searchGyms({
        query: '',
        filters: {
          sportTypes: [],
          priceRange: { min: 0, max: 50000 },
          amenities: [],
          sortBy: 'rating'
        },
        page: 1,
        limit: 10
      })).rejects.toThrow('Network error');
    });
  });

  describe('getGym', () => {
    test('fetches gym by ID successfully', async () => {
      const mockGym = {
        id: '1',
        name: 'Fight Club Almaty',
        description: 'Professional MMA and boxing gym',
        sportTypes: ['mma', 'boxing', 'bjj'],
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
        photos: [],
        amenities: ['Парковка', 'Душ', 'Раздевалка'],
        rating: 4.8,
        reviewCount: 127,
        reviews: [],
        contact: {
          phone: '+7 777 123 4567',
          email: 'info@fightclub.kz',
          website: 'https://fightclub.kz'
        },
        workingHours: {},
        packages: [],
        verified: true,
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGym
      });

      const result = await gymService.getGym('1');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/gyms/1',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      expect(result).toEqual(mockGym);
    });

    test('handles gym not found', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(gymService.getGym('999')).rejects.toThrow('Gym not found');
    });
  });

  describe('getGymReviews', () => {
    test('fetches gym reviews successfully', async () => {
      const mockReviews = {
        reviews: [
          {
            id: 'review_1',
            userId: 'user_1',
            userName: 'Дмитрий К.',
            userAvatar: 'https://example.com/avatar1.jpg',
            rating: 5,
            title: 'Отличный зал!',
            comment: 'Отличный зал! Тренеры профессионалы.',
            date: new Date('2024-01-15'),
            helpful: 12,
            verified: true
          }
        ],
        total: 1,
        page: 1,
        totalPages: 1
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReviews
      });

      const result = await gymService.getGymReviews('1', 1, 10);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/gyms/1/reviews?page=1&limit=10',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      expect(result).toEqual(mockReviews);
    });
  });

  describe('addReview', () => {
    test('adds review successfully', async () => {
      const mockReview = {
        id: 'new_review',
        userId: 'user_3',
        userName: 'Новый пользователь',
        rating: 5,
        comment: 'Отличный зал!',
        date: new Date(),
        helpful: 0,
        verified: false
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReview
      });

      const reviewData = {
        userId: 'user_3',
        userName: 'Новый пользователь',
        rating: 5,
        comment: 'Отличный зал!',
        verified: false
      };

      const result = await gymService.addReview('1', reviewData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/gyms/1/reviews',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reviewData)
        })
      );

      expect(result).toEqual(mockReview);
    });

    test('handles review validation errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid review data' })
      });

      const reviewData = {
        userId: 'user_3',
        userName: 'Новый пользователь',
        rating: 6, // Invalid rating
        comment: 'Отличный зал!',
        verified: false
      };

      await expect(gymService.addReview('1', reviewData)).rejects.toThrow('Invalid review data');
    });
  });

  describe('getAvailableFilters', () => {
    test('fetches available filters successfully', async () => {
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

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilters
      });

      const result = await gymService.getAvailableFilters();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/gyms/filters',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      expect(result).toEqual(mockFilters);
    });
  });

  describe('Error Handling', () => {
    test('handles authentication errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(gymService.searchGyms({
        query: '',
        filters: {
          sportTypes: [],
          priceRange: { min: 0, max: 50000 },
          amenities: [],
          sortBy: 'rating'
        },
        page: 1,
        limit: 10
      })).rejects.toThrow('Authentication required');
    });

    test('handles rate limiting', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      await expect(gymService.searchGyms({
        query: '',
        filters: {
          sportTypes: [],
          priceRange: { min: 0, max: 50000 },
          amenities: [],
          sortBy: 'rating'
        },
        page: 1,
        limit: 10
      })).rejects.toThrow('Rate limit exceeded');
    });

    test('handles server errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(gymService.searchGyms({
        query: '',
        filters: {
          sportTypes: [],
          priceRange: { min: 0, max: 50000 },
          amenities: [],
          sortBy: 'rating'
        },
        page: 1,
        limit: 10
      })).rejects.toThrow('Failed to search gyms');
    });
  });

  describe('Request Configuration', () => {
    test('includes authentication headers when token is available', async () => {
      // Mock localStorage
      const mockToken = 'test-token';
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(mockToken)
        },
        writable: true
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ gyms: [], total: 0, page: 1, totalPages: 1, filters: {} })
      });

      await gymService.searchGyms({
        query: '',
        filters: {
          sportTypes: [],
          priceRange: { min: 0, max: 50000 },
          amenities: [],
          sortBy: 'rating'
        },
        page: 1,
        limit: 10
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
    });

    test('handles missing API URL', async () => {
      process.env.REACT_APP_API_URL = undefined;

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ gyms: [], total: 0, page: 1, totalPages: 1, filters: {} })
      });

      await gymService.searchGyms({
        query: '',
        filters: {
          sportTypes: [],
          priceRange: { min: 0, max: 50000 },
          amenities: [],
          sortBy: 'rating'
        },
        page: 1,
        limit: 10
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/gyms/search',
        expect.any(Object)
      );
    });
  });
}); 