export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  telegramId?: string;
  joinDate: Date;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
}

export interface TrainingSession {
  id: string;
  clientId: string;
  date: Date;
  trainingType: string;
  duration: number;
  attendance: "present" | "absent" | "late";
  notes?: string;
  checkInMethod?: "manual" | "qr";
  checkInTime?: Date;
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  date: Date;
  membershipType: "monthly" | "quarterly" | "yearly" | "session";
  status: "paid" | "pending" | "overdue";
  expiryDate?: Date;
  description?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  description?: string;
  targetMuscles: string[];
}

export interface WorkoutSet {
  reps: number;
  weight?: number;
  duration?: number;
  rest?: number;
  completed: boolean;
  notes?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  order: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  day: number;
  exercises: WorkoutExercise[];
}

export interface TrainingProgram {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  status: "active" | "completed" | "paused";
  workoutDays: WorkoutDay[];
}

export interface ProgramExecution {
  id: string;
  programId: string;
  clientId: string;
  workoutDayId: string;
  date: Date;
  exercises: {
    exerciseId: string;
    sets: WorkoutSet[];
  }[];
  duration?: number;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  clientId: string;
  senderId: string;
  senderType: "client" | "trainer";
  message: string;
  messageType: "text" | "voice" | "image";
  timestamp: Date;
  read: boolean;
  replyToId?: string;
}

export interface AttendanceSummary {
  clientId: string;
  totalSessions: number;
  attendedSessions: number;
  missedSessions: number;
  attendanceRate: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface PaymentSummary {
  clientId: string;
  totalPaid: number;
  outstandingAmount: number;
  lastPaymentDate?: Date;
  nextDueDate?: Date;
  status: "current" | "overdue" | "warning";
}
