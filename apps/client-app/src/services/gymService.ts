import { 
  Gym, 
  GymFilters, 
  GymSearchParams, 
  GymSearchResult, 
  GymReview, 
  GymSportType,
  FilterOption 
} from '../types';

// API base URL - в production это должен быть URL вашего backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class GymService {
  private mockGyms: Gym[] = [
    {
      id: 'gym_001',
      name: 'Iron Wolves BJJ Academy',
      description: 'Профессиональная академия бразильского джиу-джитсу с опытными инструкторами и дружелюбной атмосферой.',
      sportTypes: ['bjj', 'mma', 'wrestling'],
      location: {
        address: 'ул. Абая 150/230, БЦ Аlatau Plaza, 3 этаж',
        city: 'Алматы',
        district: 'Алмалинский',
        coordinates: { lat: 43.2567, lng: 76.9286 },
        distance: 2.5
      },
      priceRange: {
        min: 15000,
        max: 25000,
        currency: 'KZT'
      },
      photos: [
        {
          id: 'photo_001',
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
          alt: 'BJJ тренировочный зал',
          type: 'main',
          order: 1
        },
        {
          id: 'photo_002',
          url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800',
          alt: 'Раздевалка',
          type: 'interior',
          order: 2
        },
        {
          id: 'photo_003',
          url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800',
          alt: 'Групповая тренировка',
          type: 'class',
          order: 3
        }
      ],
      amenities: ['Душевые', 'Раздевалки', 'Парковка', 'Wi-Fi', 'Кондиционер', 'Снаряжение в аренду'],
      rating: 4.8,
      reviewCount: 156,
      reviews: [
        {
          id: 'review_001',
          userId: 'user_001',
          userName: 'Алексей М.',
          userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          rating: 5,
          title: 'Отличная академия!',
          comment: 'Занимаюсь здесь уже год. Отличные тренеры, дружелюбная атмосфера, качественный инвентарь.',
          date: new Date('2024-01-15'),
          helpful: 12,
          verified: true
        },
        {
          id: 'review_002',
          userId: 'user_002',
          userName: 'Мария К.',
          rating: 4,
          comment: 'Хорошая академия, но было бы здорово больше женских классов.',
          date: new Date('2024-01-10'),
          helpful: 8,
          verified: false
        }
      ],
      contact: {
        phone: '+7 (727) 123-45-67',
        email: 'info@ironwolvesbjj.kz',
        website: 'https://ironwolvesbjj.kz'
      },
      workingHours: {
        monday: { open: '06:00', close: '22:00', isOpen: true },
        tuesday: { open: '06:00', close: '22:00', isOpen: true },
        wednesday: { open: '06:00', close: '22:00', isOpen: true },
        thursday: { open: '06:00', close: '22:00', isOpen: true },
        friday: { open: '06:00', close: '22:00', isOpen: true },
        saturday: { open: '08:00', close: '20:00', isOpen: true },
        sunday: { open: '10:00', close: '18:00', isOpen: true }
      },
      packages: [
        {
          id: 'package_001',
          name: 'Безлимит месяц',
          description: 'Безлимитные посещения всех классов BJJ',
          price: 25000,
          currency: 'KZT',
          duration: 30,
          features: ['Все классы BJJ', 'Открытые маты', 'Использование душевых'],
          popular: true
        },
        {
          id: 'package_002',
          name: '8 занятий',
          description: '8 занятий в месяц',
          price: 15000,
          currency: 'KZT',
          duration: 30,
          sessionsIncluded: 8,
          features: ['8 занятий в месяц', 'Использование душевых'],
          popular: false
        }
      ],
      verified: true,
      featured: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'gym_002',
      name: 'Thunder Boxing Club',
      description: 'Профессиональный боксерский клуб с опытными тренерами и современным оборудованием.',
      sportTypes: ['boxing', 'kickboxing'],
      location: {
        address: 'проспект Достык 200, ТРЦ Mega Alma-Ata',
        city: 'Алматы',
        district: 'Медеуский',
        coordinates: { lat: 43.2220, lng: 76.8512 },
        distance: 5.2
      },
      priceRange: {
        min: 12000,
        max: 20000,
        currency: 'KZT'
      },
      photos: [
        {
          id: 'photo_004',
          url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
          alt: 'Боксерский ринг',
          type: 'main',
          order: 1
        },
        {
          id: 'photo_005',
          url: 'https://images.unsplash.com/photo-1517438984742-1262db08379e?w=800',
          alt: 'Тренировочная зона',
          type: 'interior',
          order: 2
        }
      ],
      amenities: ['Ринг', 'Тяжелые мешки', 'Лапы', 'Душевые', 'Раздевалки', 'Парковка'],
      rating: 4.6,
      reviewCount: 89,
      reviews: [
        {
          id: 'review_003',
          userId: 'user_003',
          userName: 'Дмитрий С.',
          rating: 5,
          comment: 'Отличные тренеры, профессиональная подготовка. Рекомендую!',
          date: new Date('2024-01-12'),
          helpful: 15,
          verified: true
        }
      ],
      contact: {
        phone: '+7 (727) 234-56-78',
        email: 'info@thunderboxing.kz'
      },
      workingHours: {
        monday: { open: '07:00', close: '23:00', isOpen: true },
        tuesday: { open: '07:00', close: '23:00', isOpen: true },
        wednesday: { open: '07:00', close: '23:00', isOpen: true },
        thursday: { open: '07:00', close: '23:00', isOpen: true },
        friday: { open: '07:00', close: '23:00', isOpen: true },
        saturday: { open: '09:00', close: '21:00', isOpen: true },
        sunday: { open: '09:00', close: '21:00', isOpen: true }
      },
      packages: [
        {
          id: 'package_003',
          name: 'Безлимит',
          description: 'Безлимитные посещения всех классов',
          price: 20000,
          currency: 'KZT',
          duration: 30,
          features: ['Все группы', 'Индивидуальные тренировки', 'Использование оборудования'],
          popular: true
        }
      ],
      verified: true,
      featured: false,
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: 'gym_003',
      name: 'Samurai MMA Dojo',
      description: 'Школа смешанных единоборств с полным спектром дисциплин.',
      sportTypes: ['mma', 'bjj', 'muay_thai', 'boxing'],
      location: {
        address: 'ул. Макатаева 127, 2 этаж',
        city: 'Алматы',
        district: 'Алмалинский',
        coordinates: { lat: 43.2630, lng: 76.9300 },
        distance: 3.8
      },
      priceRange: {
        min: 18000,
        max: 30000,
        currency: 'KZT'
      },
      photos: [
        {
          id: 'photo_006',
          url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
          alt: 'MMA тренировочная зона',
          type: 'main',
          order: 1
        }
      ],
      amenities: ['Октагон', 'Татами', 'Тяжелые мешки', 'Душевые', 'Раздевалки', 'Сауна'],
      rating: 4.9,
      reviewCount: 203,
      reviews: [],
      contact: {
        phone: '+7 (727) 345-67-89',
        email: 'info@samuraimma.kz',
        website: 'https://samuraimma.kz'
      },
      workingHours: {
        monday: { open: '06:00', close: '23:00', isOpen: true },
        tuesday: { open: '06:00', close: '23:00', isOpen: true },
        wednesday: { open: '06:00', close: '23:00', isOpen: true },
        thursday: { open: '06:00', close: '23:00', isOpen: true },
        friday: { open: '06:00', close: '23:00', isOpen: true },
        saturday: { open: '08:00', close: '22:00', isOpen: true },
        sunday: { open: '10:00', close: '20:00', isOpen: true }
      },
      packages: [
        {
          id: 'package_004',
          name: 'VIP членство',
          description: 'Полный доступ ко всем дисциплинам',
          price: 30000,
          currency: 'KZT',
          duration: 30,
          features: ['Все дисциплины', 'Персональные тренировки', 'Сауна', 'Питание'],
          popular: true
        }
      ],
      verified: true,
      featured: true,
      createdAt: new Date('2022-11-01'),
      updatedAt: new Date('2024-01-14')
    },
    {
      id: 'gym_004',
      name: 'CrossFit Almaty',
      description: 'Современный CrossFit бокс с профессиональным оборудованием.',
      sportTypes: ['crossfit', 'strength_training'],
      location: {
        address: 'ул. Жандосова 10А',
        city: 'Алматы',
        district: 'Ауэзовский',
        coordinates: { lat: 43.2155, lng: 76.8700 },
        distance: 7.1
      },
      priceRange: {
        min: 20000,
        max: 28000,
        currency: 'KZT'
      },
      photos: [
        {
          id: 'photo_007',
          url: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800',
          alt: 'CrossFit зал',
          type: 'main',
          order: 1
        }
      ],
      amenities: ['Профессиональное оборудование', 'Олимпийские штанги', 'Душевые', 'Парковка'],
      rating: 4.7,
      reviewCount: 142,
      reviews: [],
      contact: {
        phone: '+7 (727) 456-78-90'
      },
      workingHours: {
        monday: { open: '05:00', close: '22:00', isOpen: true },
        tuesday: { open: '05:00', close: '22:00', isOpen: true },
        wednesday: { open: '05:00', close: '22:00', isOpen: true },
        thursday: { open: '05:00', close: '22:00', isOpen: true },
        friday: { open: '05:00', close: '22:00', isOpen: true },
        saturday: { open: '07:00', close: '20:00', isOpen: true },
        sunday: { open: '08:00', close: '18:00', isOpen: true }
      },
      packages: [
        {
          id: 'package_005',
          name: 'Безлимит CrossFit',
          description: 'Безлимитные WOD тренировки',
          price: 25000,
          currency: 'KZT',
          duration: 30,
          features: ['Все WOD классы', 'Open Gym', 'Программирование'],
          popular: true
        }
      ],
      verified: false,
      featured: false,
      createdAt: new Date('2023-05-01'),
      updatedAt: new Date('2024-01-08')
    }
  ];

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Ошибка сервера' }));
        throw new Error(error.detail || 'Ошибка при обращении к серверу');
      }

      return response.json();
    } catch (error: any) {
      console.warn('API request failed, using mock data:', error.message);
      throw error;
    }
  }

  /**
   * Поиск спортзалов
   */
  async searchGyms(params: GymSearchParams): Promise<GymSearchResult> {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        sort: params.filters.sortBy,
      });

      if (params.query) {
        queryParams.append('query', params.query);
      }

      if (params.filters.sportTypes.length > 0) {
        queryParams.append('sport_types', params.filters.sportTypes.join(','));
      }

      if (params.filters.location?.city) {
        queryParams.append('city', params.filters.location.city);
      }

      const endpoint = `/gyms/search?${queryParams.toString()}`;
      return await this.makeRequest<GymSearchResult>(endpoint);
    } catch (error) {
      // Return mock data for development
      return this.getMockSearchResult(params);
    }
  }

  /**
   * Получить информацию о спортзале
   */
  async getGym(id: string): Promise<Gym> {
    try {
      return await this.makeRequest<Gym>(`/gyms/${id}`);
    } catch (error) {
      // Return mock data for development
      const gym = this.mockGyms.find(g => g.id === id);
      if (!gym) {
        throw new Error('Спортзал не найден');
      }
      return gym;
    }
  }

  /**
   * Получить отзывы о спортзале
   */
  async getGymReviews(gymId: string, page: number = 1, limit: number = 10): Promise<{
    reviews: GymReview[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      return await this.makeRequest(`/gyms/${gymId}/reviews?${queryParams.toString()}`);
    } catch (error) {
      // Return mock data for development
      const gym = this.mockGyms.find(g => g.id === gymId);
      const reviews = gym?.reviews || [];
      
      return {
        reviews,
        total: reviews.length,
        page,
        totalPages: Math.ceil(reviews.length / limit)
      };
    }
  }

  /**
   * Добавить отзыв
   */
  async addReview(gymId: string, review: Omit<GymReview, 'id' | 'date' | 'helpful'>): Promise<GymReview> {
    try {
      return await this.makeRequest(`/gyms/${gymId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(review),
      });
    } catch (error) {
      // Mock response for development
      const newReview: GymReview = {
        ...review,
        id: `review_${Date.now()}`,
        date: new Date(),
        helpful: 0,
      };
      return newReview;
    }
  }

  /**
   * Получить доступные фильтры
   */
  async getAvailableFilters(): Promise<{
    sportTypes: FilterOption[];
    cities: FilterOption[];
    districts: FilterOption[];
    amenities: FilterOption[];
    priceRanges: FilterOption[];
  }> {
    try {
      return await this.makeRequest('/gyms/filters');
    } catch (error) {
      // Return mock filters for development
      return this.getMockFilters();
    }
  }

  /**
   * Mock данные для разработки
   */
  private getMockSearchResult(params: GymSearchParams): GymSearchResult {
    let filteredGyms = [...this.mockGyms];

    // Фильтрация по запросу
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredGyms = filteredGyms.filter(gym =>
        gym.name.toLowerCase().includes(query) ||
        gym.description.toLowerCase().includes(query)
      );
    }

    // Фильтрация по типам спорта
    if (params.filters.sportTypes.length > 0) {
      filteredGyms = filteredGyms.filter(gym =>
        gym.sportTypes.some(type => params.filters.sportTypes.includes(type))
      );
    }

    // Фильтрация по городу
    if (params.filters.location?.city) {
      filteredGyms = filteredGyms.filter(gym =>
        gym.location.city === params.filters.location?.city
      );
    }

    // Фильтрация по цене
    if (params.filters.priceRange.min > 0 || params.filters.priceRange.max < 100000) {
      filteredGyms = filteredGyms.filter(gym =>
        gym.priceRange.min >= params.filters.priceRange.min &&
        gym.priceRange.max <= params.filters.priceRange.max
      );
    }

    // Фильтрация по рейтингу
    if (params.filters.rating) {
      filteredGyms = filteredGyms.filter(gym => gym.rating >= params.filters.rating!);
    }

    // Фильтрация по удобствам
    if (params.filters.amenities.length > 0) {
      filteredGyms = filteredGyms.filter(gym =>
        params.filters.amenities.every(amenity => gym.amenities.includes(amenity))
      );
    }

    // Сортировка
    switch (params.filters.sortBy) {
      case 'rating':
        filteredGyms.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        filteredGyms.sort((a, b) => (a.location.distance || 0) - (b.location.distance || 0));
        break;
      case 'price_low':
        filteredGyms.sort((a, b) => a.priceRange.min - b.priceRange.min);
        break;
      case 'price_high':
        filteredGyms.sort((a, b) => b.priceRange.max - a.priceRange.max);
        break;
      case 'name':
        filteredGyms.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filteredGyms.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    // Пагинация
    const total = filteredGyms.length;
    const totalPages = Math.ceil(total / params.limit);
    const start = (params.page - 1) * params.limit;
    const gyms = filteredGyms.slice(start, start + params.limit);

    return {
      gyms,
      total,
      page: params.page,
      totalPages,
      filters: this.getMockFilters()
    };
  }

  private getMockFilters() {
    return {
      sportTypes: [
        { value: 'bjj', label: 'BJJ', count: 2 },
        { value: 'boxing', label: 'Бокс', count: 2 },
        { value: 'mma', label: 'MMA', count: 2 },
        { value: 'muay_thai', label: 'Муай Тай', count: 1 },
        { value: 'crossfit', label: 'CrossFit', count: 1 },
        { value: 'strength_training', label: 'Силовые тренировки', count: 1 }
      ],
      cities: [
        { value: 'Алматы', label: 'Алматы', count: 4 }
      ],
      districts: [
        { value: 'Алмалинский', label: 'Алмалинский', count: 2 },
        { value: 'Медеуский', label: 'Медеуский', count: 1 },
        { value: 'Ауэзовский', label: 'Ауэзовский', count: 1 }
      ],
      amenities: [
        { value: 'Душевые', label: 'Душевые', count: 4 },
        { value: 'Раздевалки', label: 'Раздевалки', count: 4 },
        { value: 'Парковка', label: 'Парковка', count: 3 },
        { value: 'Wi-Fi', label: 'Wi-Fi', count: 1 },
        { value: 'Сауна', label: 'Сауна', count: 1 }
      ],
      priceRanges: [
        { value: '0-15000', label: 'До 15,000 ₸', count: 0 },
        { value: '15000-25000', label: '15,000 - 25,000 ₸', count: 3 },
        { value: '25000-35000', label: '25,000 - 35,000 ₸', count: 1 },
        { value: '35000+', label: 'Свыше 35,000 ₸', count: 0 }
      ]
    };
  }
}

export const gymService = new GymService();