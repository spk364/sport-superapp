import React, { useEffect } from 'react';
import { useAppStore } from './store';
import { BottomNavigation } from './components/common/BottomNavigation';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { Progress } from './pages/Progress';

// Mock data for development
const mockUser = {
  id: '1',
  firstName: 'Иван',
  lastName: 'Петров',
  telegramId: '123456789',
  phone: '+7 999 123-45-67',
  email: 'ivan@example.com',
  level: '1 дан',
  joinDate: new Date('2024-01-15'),
};

const mockWorkouts = [
  {
    id: '1',
    title: 'Силовая тренировка',
    type: 'strength' as const,
    date: new Date('2024-12-28T18:00:00'),
    duration: 90,
    location: 'Зал №1',
    trainer: { id: '1', name: 'Александр Волков' },
    description: 'Тренировка верхней части тела',
    status: 'scheduled' as const,
  },
  {
    id: '2',
    title: 'Кардио тренировка',
    type: 'cardio' as const,
    date: new Date('2024-12-25T19:00:00'),
    duration: 60,
    location: 'Кардио зона',
    trainer: { id: '1', name: 'Александр Волков' },
    status: 'completed' as const,
  },
];

const mockHomeTasks = [
  {
    id: '1',
    title: 'Растяжка',
    description: 'Растяжка после тренировки, 15 минут',
    type: 'exercise' as const,
    dueDate: new Date('2024-12-28'),
    completed: false,
  },
  {
    id: '2',
    title: 'Кардио дома',
    description: '30 минут легкого бега или ходьбы',
    type: 'exercise' as const,
    dueDate: new Date('2024-12-29'),
    completed: false,
  },
];

const mockSubscription = {
  id: '1',
  type: 'monthly' as const,
  name: 'Безлимитный абонемент',
  price: 5000,
  currency: 'RUB',
  startDate: new Date('2024-12-01'),
  endDate: new Date('2025-01-01'),
  status: 'active' as const,
  autoRenewal: true,
};

function App() {
  const { currentPage, setUser, setWorkouts, addHomeTask, setSubscription } = useAppStore();

  useEffect(() => {
    // Initialize with mock data
    setUser(mockUser);
    setWorkouts(mockWorkouts);
    mockHomeTasks.forEach(task => addHomeTask(task));
    setSubscription(mockSubscription);
  }, [setUser, setWorkouts, addHomeTask, setSubscription]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <Calendar />;
      case 'progress':
        return <Progress />;
      case 'payments':
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Оплата</h2>
            <p className="text-gray-600">Страница в разработке</p>
          </div>
        </div>;
      case 'profile':
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Профиль</h2>
            <p className="text-gray-600">Страница в разработке</p>
          </div>
        </div>;
      case 'chat':
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Чат</h2>
            <p className="text-gray-600">Страница в разработке</p>
          </div>
        </div>;
      case 'notifications':
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Уведомления</h2>
            <p className="text-gray-600">Страница в разработке</p>
          </div>
        </div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
      <BottomNavigation />
    </div>
  );
}

export default App; 