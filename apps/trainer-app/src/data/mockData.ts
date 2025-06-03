import { Client, TrainingSession, Payment, TrainingProgram, Exercise, ChatMessage } from "../types";

export const mockClients: Client[] = [
  {
    id: "1",
    name: "Анна Иванова",
    email: "anna@example.com",
    phone: "+7 900 123 4567",
    telegramId: "@anna_ivanova",
    joinDate: new Date("2024-01-15"),
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150",
    status: "active"
  },
  {
    id: "2",
    name: "Михаил Петров",
    email: "mikhail@example.com",
    phone: "+7 900 234 5678",
    telegramId: "@mikhail_petrov",
    joinDate: new Date("2024-02-20"),
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    status: "active"
  },
  {
    id: "3",
    name: "Елена Сидорова",
    email: "elena@example.com",
    phone: "+7 900 345 6789",
    joinDate: new Date("2024-03-10"),
    status: "inactive"
  }
];

export const mockSessions: TrainingSession[] = [
  {
    id: "1",
    clientId: "1",
    date: new Date("2024-05-28"),
    trainingType: "Силовая тренировка",
    duration: 60,
    attendance: "present",
    checkInMethod: "manual",
    checkInTime: new Date("2024-05-28T10:00:00")
  },
  {
    id: "2",
    clientId: "1",
    date: new Date("2024-05-30"),
    trainingType: "Кардио",
    duration: 45,
    attendance: "present",
    checkInMethod: "qr",
    checkInTime: new Date("2024-05-30T11:00:00")
  },
  {
    id: "3",
    clientId: "2",
    date: new Date("2024-05-29"),
    trainingType: "Функциональная тренировка",
    duration: 50,
    attendance: "absent"
  }
];

export const mockPayments: Payment[] = [
  {
    id: "1",
    clientId: "1",
    amount: 8000,
    date: new Date("2024-05-01"),
    membershipType: "monthly",
    status: "paid",
    expiryDate: new Date("2024-06-01"),
    description: "Месячный абонемент - май"
  },
  {
    id: "2",
    clientId: "2",
    amount: 20000,
    date: new Date("2024-04-01"),
    membershipType: "quarterly",
    status: "paid",
    expiryDate: new Date("2024-07-01"),
    description: "Квартальный абонемент"
  },
  {
    id: "3",
    clientId: "3",
    amount: 8000,
    date: new Date("2024-04-15"),
    membershipType: "monthly",
    status: "overdue",
    expiryDate: new Date("2024-05-15"),
    description: "Месячный абонемент - апрель"
  }
];

export const mockExercises: Exercise[] = [
  {
    id: "1",
    name: "Приседания",
    category: "Ноги",
    description: "Базовое упражнение для развития мышц ног",
    targetMuscles: ["Квадрицепсы", "Ягодицы", "Икры"]
  },
  {
    id: "2",
    name: "Жим лежа",
    category: "Грудь",
    description: "Базовое упражнение для грудных мышц",
    targetMuscles: ["Грудные", "Трицепсы", "Передние дельты"]
  },
  {
    id: "3",
    name: "Подтягивания",
    category: "Спина",
    description: "Упражнение для развития широчайших мышц спины",
    targetMuscles: ["Широчайшие", "Бицепсы", "Задние дельты"]
  },
  {
    id: "4",
    name: "Становая тяга",
    category: "Спина",
    description: "Базовое упражнение для всего тела",
    targetMuscles: ["Спина", "Ягодицы", "Бицепсы бедра"]
  },
  {
    id: "5",
    name: "Жим стоя",
    category: "Плечи",
    description: "Упражнение для развития дельтовидных мышц",
    targetMuscles: ["Передние дельты", "Средние дельты", "Трицепсы"]
  },
  {
    id: "6",
    name: "Планка",
    category: "Пресс",
    description: "Статическое упражнение для укрепления кора",
    targetMuscles: ["Пресс", "Кор", "Стабилизаторы"]
  }
];

export const mockPrograms: TrainingProgram[] = [
  {
    id: "1",
    clientId: "1",
    name: "Программа для начинающих",
    description: "3-дневная программа для новичков",
    startDate: new Date("2024-05-01"),
    status: "active",
    workoutDays: [
      {
        id: "day1",
        name: "День 1 - Верх тела",
        day: 1,
        exercises: [
          {
            exerciseId: "2",
            exercise: mockExercises[1], // Жим лежа
            sets: [
              { reps: 10, weight: 40, completed: false, rest: 90 },
              { reps: 8, weight: 45, completed: false, rest: 90 },
              { reps: 6, weight: 50, completed: false, rest: 90 }
            ],
            order: 1
          },
          {
            exerciseId: "3",
            exercise: mockExercises[2], // Подтягивания
            sets: [
              { reps: 8, weight: 0, completed: false, rest: 60 },
              { reps: 6, weight: 0, completed: false, rest: 60 },
              { reps: 5, weight: 0, completed: false, rest: 60 }
            ],
            order: 2
          }
        ]
      },
      {
        id: "day2",
        name: "День 2 - Низ тела",
        day: 2,
        exercises: [
          {
            exerciseId: "1",
            exercise: mockExercises[0], // Приседания
            sets: [
              { reps: 12, weight: 30, completed: false, rest: 90 },
              { reps: 10, weight: 35, completed: false, rest: 90 },
              { reps: 8, weight: 40, completed: false, rest: 90 }
            ],
            order: 1
          },
          {
            exerciseId: "4",
            exercise: mockExercises[3], // Становая тяга
            sets: [
              { reps: 8, weight: 50, completed: false, rest: 120 },
              { reps: 6, weight: 55, completed: false, rest: 120 },
              { reps: 5, weight: 60, completed: false, rest: 120 }
            ],
            order: 2
          }
        ]
      }
    ]
  }
];

export const mockMessages: ChatMessage[] = [
  {
    id: "1",
    clientId: "1",
    senderId: "1",
    senderType: "client",
    message: "Привет! Можно ли перенести завтрашнюю тренировку на час позже?",
    messageType: "text",
    timestamp: new Date("2024-06-01T09:30:00"),
    read: true
  },
  {
    id: "2",
    clientId: "1",
    senderId: "trainer",
    senderType: "trainer",
    message: "Конечно! Перенесем на 11:00. Не забудьте про разминку дома.",
    messageType: "text",
    timestamp: new Date("2024-06-01T09:45:00"),
    read: true
  },
  {
    id: "3",
    clientId: "2",
    senderId: "2",
    senderType: "client",
    message: "После вчерашней тренировки болят мышцы ног. Это нормально?",
    messageType: "text",
    timestamp: new Date("2024-06-01T08:00:00"),
    read: false
  }
];
