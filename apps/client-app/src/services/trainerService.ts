import { 
  Trainer, 
  TrainerSearchParams, 
  TrainerSearchResult, 
  TrainerFilters,
  TrainerBookingRequest,
  TrainerBookingResponse,
  TrainerSpecialization
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class TrainerService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api/v1/trainers${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Trainer service request failed:', error);
      throw error;
    }
  }

  // Get all trainers with search and filters
  async getTrainers(params: TrainerSearchParams): Promise<TrainerSearchResult> {
    const queryParams = new URLSearchParams();
    
    if (params.query) {
      queryParams.append('query', params.query);
    }
    
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());
    
    // Add filters
    if (params.filters.specializations.length > 0) {
      params.filters.specializations.forEach(spec => {
        queryParams.append('specializations', spec);
      });
    }
    
    if (params.filters.experience.min > 0) {
      queryParams.append('experience_min', params.filters.experience.min.toString());
    }
    
    if (params.filters.experience.max < 50) {
      queryParams.append('experience_max', params.filters.experience.max.toString());
    }
    
    if (params.filters.rating > 0) {
      queryParams.append('rating', params.filters.rating.toString());
    }
    
    if (params.filters.priceRange.min > 0) {
      queryParams.append('price_min', params.filters.priceRange.min.toString());
    }
    
    if (params.filters.priceRange.max < 10000) {
      queryParams.append('price_max', params.filters.priceRange.max.toString());
    }
    
    if (params.filters.location?.city) {
      queryParams.append('city', params.filters.location.city);
    }
    
    if (params.filters.location?.district) {
      queryParams.append('district', params.filters.location.district);
    }
    
    if (params.filters.location?.radius) {
      queryParams.append('radius', params.filters.location.radius.toString());
    }
    
    if (params.filters.location?.coordinates) {
      queryParams.append('lat', params.filters.location.coordinates.lat.toString());
      queryParams.append('lng', params.filters.location.coordinates.lng.toString());
    }
    
    if (params.filters.availability?.dayOfWeek !== undefined) {
      queryParams.append('day_of_week', params.filters.availability.dayOfWeek.toString());
    }
    
    if (params.filters.availability?.timeSlot) {
      queryParams.append('time_slot', params.filters.availability.timeSlot);
    }
    
    params.filters.sessionType.forEach(type => {
      queryParams.append('session_type', type);
    });
    
    params.filters.languages.forEach(lang => {
      queryParams.append('languages', lang);
    });
    
    if (params.filters.verified !== undefined) {
      queryParams.append('verified', params.filters.verified.toString());
    }
    
    if (params.filters.featured !== undefined) {
      queryParams.append('featured', params.filters.featured.toString());
    }
    
    queryParams.append('sort_by', params.filters.sortBy);

    return this.request<TrainerSearchResult>(`?${queryParams.toString()}`);
  }

  // Get trainer by ID
  async getTrainerById(trainerId: string): Promise<Trainer> {
    return this.request<Trainer>(`/${trainerId}`);
  }

  // Get featured trainers
  async getFeaturedTrainers(limit: number = 10): Promise<Trainer[]> {
    const params = new URLSearchParams({
      featured: 'true',
      limit: limit.toString(),
      sort_by: 'rating'
    });
    
    const result = await this.request<TrainerSearchResult>(`?${params.toString()}`);
    return result.trainers;
  }

  // Get trainers by specialization
  async getTrainersBySpecialization(specialization: TrainerSpecialization, limit: number = 20): Promise<Trainer[]> {
    const params = new URLSearchParams({
      specializations: specialization,
      limit: limit.toString(),
      sort_by: 'rating'
    });
    
    const result = await this.request<TrainerSearchResult>(`?${params.toString()}`);
    return result.trainers;
  }

  // Get trainers by location
  async getTrainersByLocation(city: string, district?: string, radius?: number): Promise<Trainer[]> {
    const params = new URLSearchParams({
      city,
      limit: '50',
      sort_by: 'distance'
    });
    
    if (district) {
      params.append('district', district);
    }
    
    if (radius) {
      params.append('radius', radius.toString());
    }
    
    const result = await this.request<TrainerSearchResult>(`?${params.toString()}`);
    return result.trainers;
  }

  // Get trainer availability
  async getTrainerAvailability(trainerId: string, date?: Date): Promise<any> {
    const params = new URLSearchParams();
    if (date) {
      params.append('date', date.toISOString().split('T')[0]);
    }
    
    return this.request<any>(`/${trainerId}/availability?${params.toString()}`);
  }

  // Book a session with trainer
  async bookSession(booking: TrainerBookingRequest): Promise<TrainerBookingResponse> {
    return this.request<TrainerBookingResponse>(`/${booking.trainerId}/book`, {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  // Get trainer reviews
  async getTrainerReviews(trainerId: string, page: number = 1, limit: number = 10): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return this.request<any>(`/${trainerId}/reviews?${params.toString()}`);
  }

  // Add review for trainer
  async addTrainerReview(trainerId: string, review: any): Promise<any> {
    return this.request<any>(`/${trainerId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  // Get trainer statistics
  async getTrainerStats(trainerId: string): Promise<any> {
    return this.request<any>(`/${trainerId}/stats`);
  }

  // Search trainers by query
  async searchTrainers(searchParams: TrainerSearchParams): Promise<TrainerSearchResult> {
    const urlParams = new URLSearchParams({
      page: searchParams.page.toString(),
      limit: searchParams.limit.toString(),
      sort_by: searchParams.filters.sortBy
    });
    
    if (searchParams.query) {
      urlParams.append('query', searchParams.query);
    }
    
    const filters = searchParams.filters;
    if (filters.specializations?.length) {
      filters.specializations.forEach(spec => {
        urlParams.append('specializations', spec);
      });
    }
    
    if (filters.city) {
      urlParams.append('city', filters.city);
    }
    
    if (filters.rating) {
      urlParams.append('rating', filters.rating.toString());
    }

    // For now, return mock data (simulating API call)
    const allTrainers = this.getMockTrainers();
    let filteredTrainers = allTrainers;

    // Apply search query filter
    if (searchParams.query) {
      filteredTrainers = allTrainers.filter(trainer => 
        trainer.firstName.toLowerCase().includes(searchParams.query!.toLowerCase()) ||
        trainer.lastName.toLowerCase().includes(searchParams.query!.toLowerCase()) ||
        trainer.specializations.some(spec => 
          spec.toLowerCase().includes(searchParams.query!.toLowerCase())
        )
      );
    }

    // Apply filters
    if (filters.specializations?.length) {
      filteredTrainers = filteredTrainers.filter(trainer =>
        trainer.specializations.some(spec => 
          filters.specializations!.includes(spec)
        )
      );
    }

    if (filters.rating) {
      filteredTrainers = filteredTrainers.filter(trainer =>
        trainer.rating >= filters.rating!
      );
    }

    if (filters.city) {
      filteredTrainers = filteredTrainers.filter(trainer =>
        trainer.location.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'rating':
        filteredTrainers.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        filteredTrainers.sort((a, b) => b.experience - a.experience);
        break;
      case 'price_low':
        filteredTrainers.sort((a, b) => a.pricing.personalSession - b.pricing.personalSession);
        break;
      case 'price_high':
        filteredTrainers.sort((a, b) => b.pricing.personalSession - a.pricing.personalSession);
        break;
    }

    // Pagination
    const startIndex = (searchParams.page - 1) * searchParams.limit;
    const endIndex = startIndex + searchParams.limit;
    const paginatedTrainers = filteredTrainers.slice(startIndex, endIndex);

    return {
      trainers: paginatedTrainers,
      total: filteredTrainers.length,
      page: searchParams.page,
      totalPages: Math.ceil(filteredTrainers.length / searchParams.limit),
      filters: {
        specializations: [],
        experienceRanges: [],
        priceRanges: [],
        cities: [],
        districts: [],
        languages: []
      }
    };
  }

  // Get available specializations
  async getSpecializations(): Promise<{ value: string; label: string; count: number }[]> {
    return this.request<{ value: string; label: string; count: number }[]>('/specializations');
  }

  // Get available cities
  async getCities(): Promise<{ value: string; label: string; count: number }[]> {
    return this.request<{ value: string; label: string; count: number }[]>('/cities');
  }

  // Mock data for development
  getMockTrainers(): Trainer[] {
    return [
      {
        id: '1',
        firstName: 'Александр',
        lastName: 'Петров',
        avatar: '/avatars/trainer-1.jpg',
        bio: 'Сертифицированный персональный тренер с 8-летним опытом работы. Специализируюсь на силовых тренировках и функциональном фитнесе. Помогаю клиентам достигать их целей в безопасной и эффективной манере.',
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
            { sessions: 5, discount: 10, price: 36000, validDays: 30 },
            { sessions: 10, discount: 15, price: 68000, validDays: 60 }
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
      },
      {
        id: '2',
        firstName: 'Мария',
        lastName: 'Иванова',
        avatar: '/avatars/trainer-2.jpg',
        bio: 'Йога-инструктор с 5-летним опытом. Провожу занятия по хатха-йоге, виньяса-флоу и медитации. Помогаю найти баланс между телом и разумом.',
        specializations: ['yoga', 'meditation', 'flexibility'],
        experience: 5,
        certifications: [
          {
            id: '2',
            name: 'Yoga Teacher Training',
            issuer: 'Yoga Alliance',
            issueDate: new Date('2018-06-20'),
            isVerified: true
          }
        ],
        rating: 4.9,
        reviewCount: 89,
        reviews: [],
        availability: {
          schedule: {
            monday: { isAvailable: true, slots: [{ startTime: '07:00', endTime: '20:00', isAvailable: true }] },
            tuesday: { isAvailable: true, slots: [{ startTime: '07:00', endTime: '20:00', isAvailable: true }] },
            wednesday: { isAvailable: true, slots: [{ startTime: '07:00', endTime: '20:00', isAvailable: true }] },
            thursday: { isAvailable: true, slots: [{ startTime: '07:00', endTime: '20:00', isAvailable: true }] },
            friday: { isAvailable: true, slots: [{ startTime: '07:00', endTime: '20:00', isAvailable: true }] },
            saturday: { isAvailable: true, slots: [{ startTime: '08:00', endTime: '18:00', isAvailable: true }] },
            sunday: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '16:00', isAvailable: true }] }
          },
          timeSlots: [],
          timezone: 'Asia/Almaty',
          isAvailable: true
        },
        contact: {
          phone: '+7 (777) 234-56-78',
          email: 'maria.yoga@example.com',
          instagram: '@maria_yoga_almaty',
          preferredContact: 'instagram'
        },
        location: {
          city: 'Алматы',
          district: 'Медеуский',
          homeVisits: true,
          onlineSessions: true
        },
        pricing: {
          personalSession: 6000,
          groupSession: 3000,
          onlineSession: 4000,
          packageDiscounts: [
            { sessions: 8, discount: 12, price: 42240, validDays: 45 },
            { sessions: 16, discount: 20, price: 76800, validDays: 90 }
          ],
          currency: 'KZT',
          paymentMethods: ['cash', 'card', 'kaspi'],
          freeConsultation: true,
          consultationDuration: 20
        },
        languages: ['Русский', 'English'],
        isActive: true,
        isVerified: true,
        isFeatured: false,
        joinDate: new Date('2021-03-10'),
        lastActive: new Date(),
        stats: {
          totalSessions: 892,
          totalClients: 67,
          averageRating: 4.9,
          responseTime: 8,
          completionRate: 97,
          repeatClientRate: 85
        }
      },
      {
        id: '3',
        firstName: 'Дмитрий',
        lastName: 'Сидоров',
        avatar: '/avatars/trainer-3.jpg',
        bio: 'Тренер по боксу и функциональным тренировкам. Бывший профессиональный боксер с опытом работы в фитнес-индустрии более 10 лет.',
        specializations: ['boxing', 'functional_fitness', 'cardio'],
        experience: 10,
        certifications: [
          {
            id: '3',
            name: 'Boxing Coach Certification',
            issuer: 'Kazakhstan Boxing Federation',
            issueDate: new Date('2013-09-10'),
            isVerified: true
          }
        ],
        rating: 4.7,
        reviewCount: 156,
        reviews: [],
        availability: {
          schedule: {
            monday: { isAvailable: true, slots: [{ startTime: '08:00', endTime: '21:00', isAvailable: true }] },
            tuesday: { isAvailable: true, slots: [{ startTime: '08:00', endTime: '21:00', isAvailable: true }] },
            wednesday: { isAvailable: true, slots: [{ startTime: '08:00', endTime: '21:00', isAvailable: true }] },
            thursday: { isAvailable: true, slots: [{ startTime: '08:00', endTime: '21:00', isAvailable: true }] },
            friday: { isAvailable: true, slots: [{ startTime: '08:00', endTime: '21:00', isAvailable: true }] },
            saturday: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '18:00', isAvailable: true }] },
            sunday: { isAvailable: false, slots: [] }
          },
          timeSlots: [],
          timezone: 'Asia/Almaty',
          isAvailable: true
        },
        contact: {
          phone: '+7 (777) 345-67-89',
          email: 'dmitry.boxing@example.com',
          whatsapp: '+77773456789',
          preferredContact: 'whatsapp'
        },
        location: {
          city: 'Алматы',
          district: 'Бостандыкский',
          homeVisits: false,
          onlineSessions: false,
          gymLocations: ['Fitness Club "Energy"', 'Boxing Gym "Champion"']
        },
        pricing: {
          personalSession: 10000,
          groupSession: 5000,
          packageDiscounts: [
            { sessions: 4, discount: 8, price: 36800, validDays: 30 },
            { sessions: 8, discount: 15, price: 68000, validDays: 60 }
          ],
          currency: 'KZT',
          paymentMethods: ['cash', 'card', 'kaspi'],
          freeConsultation: false,
          consultationDuration: 0
        },
        languages: ['Русский', 'Казахский'],
        isActive: true,
        isVerified: true,
        isFeatured: true,
        joinDate: new Date('2019-08-22'),
        lastActive: new Date(),
        stats: {
          totalSessions: 2034,
          totalClients: 134,
          averageRating: 4.7,
          responseTime: 25,
          completionRate: 91,
          repeatClientRate: 72
        }
      }
    ];
  }
}

export const trainerService = new TrainerService(); 