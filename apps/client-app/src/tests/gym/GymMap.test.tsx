import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GymMap, GymMapView, GymLocationMap } from '../../components/gym';

// Mock 2GIS API
const mockDG = {
  map: jest.fn(),
  marker: jest.fn(),
  icon: jest.fn(),
  divIcon: jest.fn(),
  point: jest.fn(),
  Control: {
    extend: jest.fn()
  },
  DomUtil: {
    create: jest.fn()
  },
  markerClusterGroup: jest.fn(),
  then: jest.fn()
};

// Mock window.DG
Object.defineProperty(window, 'DG', {
  value: mockDG,
  writable: true
});

// Mock data
const mockGyms = [
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
    photos: [
      {
        id: '1',
        url: 'https://example.com/gym1.jpg',
        alt: 'Fight Club Almaty',
        type: 'main' as const,
        order: 1
      }
    ],
    amenities: ['Парковка', 'Душ', 'Раздевалка'],
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
] as any; // Use any to bypass type checking for test data

describe('GymMap Components', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup 2GIS mock
    mockDG.map.mockReturnValue({
      setView: jest.fn(),
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    });
    
    mockDG.marker.mockReturnValue({
      addTo: jest.fn(),
      bindPopup: jest.fn(),
      on: jest.fn(),
      getLatLng: jest.fn().mockReturnValue({ lat: 43.2220, lng: 76.8512 })
    });
    
    mockDG.markerClusterGroup.mockReturnValue({
      addLayer: jest.fn(),
      addTo: jest.fn(),
      clearLayers: jest.fn()
    });
    
    mockDG.then.mockResolvedValue(undefined);
  });

  describe('GymMap', () => {
    test('renders map container', () => {
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    test('initializes map with gyms', async () => {
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      await waitFor(() => {
        expect(mockDG.map).toHaveBeenCalled();
        expect(mockDG.marker).toHaveBeenCalledWith([43.2220, 76.8512]);
      });
    });

    test('handles user location', async () => {
      const userLocation = { lat: 43.2500, lng: 76.9000 };
      
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={userLocation}
        />
      );
      
      await waitFor(() => {
        expect(mockDG.marker).toHaveBeenCalledWith([43.2500, 76.9000]);
      });
    });

    test('shows search controls', () => {
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      expect(screen.getByPlaceholderText('Поиск спортзалов...')).toBeInTheDocument();
      expect(screen.getByText('Фильтры')).toBeInTheDocument();
    });

    test('handles gym selection', async () => {
      const onGymSelect = jest.fn();
      
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={onGymSelect}
          userLocation={null}
        />
      );
      
      await waitFor(() => {
        // Simulate marker click
        const marker = mockDG.marker();
        const clickHandler = marker.on.mock.calls.find((call: any) => call[0] === 'click')[1];
        clickHandler();
        
        expect(onGymSelect).toHaveBeenCalledWith(mockGyms[0]);
      });
    });
  });

  describe('GymMapView', () => {
    test('renders fullscreen map view', () => {
      render(
        <GymMapView
          onGymSelect={jest.fn()}
          onClose={jest.fn()}
          initialGyms={mockGyms}
          userLocation={null}
        />
      );
      
      expect(screen.getByTestId('map-container')).toHaveClass('fullscreen');
    });

    test('shows close button', () => {
      const onClose = jest.fn();
      
      render(
        <GymMapView
          onGymSelect={jest.fn()}
          onClose={onClose}
          initialGyms={mockGyms}
          userLocation={null}
        />
      );
      
      const closeButton = screen.getByTestId('close-map-button');
      expect(closeButton).toBeInTheDocument();
      
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });

    test('displays gym count', () => {
      render(
        <GymMapView
          onGymSelect={jest.fn()}
          onClose={jest.fn()}
          initialGyms={mockGyms}
          userLocation={null}
        />
      );
      
      expect(screen.getByText('1 спортзал')).toBeInTheDocument();
    });
  });

  describe('GymLocationMap', () => {
    test('renders location map for single gym', () => {
      render(
        <GymLocationMap
          gym={mockGyms[0]}
          height="300px"
        />
      );
      
      expect(screen.getByTestId('gym-location-map')).toBeInTheDocument();
    });

    test('displays gym information', () => {
      render(
        <GymLocationMap
          gym={mockGyms[0]}
          height="300px"
        />
      );
      
      expect(screen.getByText('Fight Club Almaty')).toBeInTheDocument();
      expect(screen.getByText('ул. Абая, 150, Алматы')).toBeInTheDocument();
    });

    test('shows directions button', () => {
      render(
        <GymLocationMap
          gym={mockGyms[0]}
          height="300px"
        />
      );
      
      const directionsButton = screen.getByTestId('directions-button');
      expect(directionsButton).toBeInTheDocument();
      expect(directionsButton).toHaveAttribute('href', expect.stringContaining('maps'));
    });
  });

  describe('Map Controls', () => {
    test('shows zoom controls', () => {
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      expect(screen.getByTestId('zoom-in')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-out')).toBeInTheDocument();
    });

    test('shows location button', () => {
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      expect(screen.getByTestId('location-button')).toBeInTheDocument();
    });
  });

  describe('Search and Filter', () => {
    test('filters gyms by search query', async () => {
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Поиск спортзалов...');
      fireEvent.change(searchInput, { target: { value: 'Fight Club' } });
      
      await waitFor(() => {
        expect(screen.getByText('Fight Club Almaty')).toBeInTheDocument();
      });
    });

    test('opens filter panel', () => {
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      const filterButton = screen.getByText('Фильтры');
      fireEvent.click(filterButton);
      
      expect(screen.getByText('Виды спорта')).toBeInTheDocument();
      expect(screen.getByText('Цена')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('shows error when map fails to load', async () => {
      mockDG.map.mockImplementation(() => {
        throw new Error('Map failed to load');
      });
      
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка загрузки карты')).toBeInTheDocument();
      });
    });

    test('shows loading state', () => {
      mockDG.then.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      expect(screen.getByText('Загрузка карты...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      expect(screen.getByTestId('zoom-in')).toHaveAttribute('aria-label', 'Увеличить');
      expect(screen.getByTestId('zoom-out')).toHaveAttribute('aria-label', 'Уменьшить');
      expect(screen.getByTestId('location-button')).toHaveAttribute('aria-label', 'Мое местоположение');
    });

    test('announces map loading to screen readers', () => {
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      expect(screen.getByText('Загрузка карты...')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile screen size', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveClass('mobile');
    });

    test('shows mobile controls', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(
        <GymMap
          gyms={mockGyms}
          onGymSelect={jest.fn()}
          userLocation={null}
        />
      );
      
      expect(screen.getByTestId('mobile-controls')).toBeInTheDocument();
    });
  });
}); 