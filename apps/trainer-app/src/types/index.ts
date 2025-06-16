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

// NEW TYPES FOR TRAINER/ORGANIZATION REGISTRATION

export interface TrainingDirection {
  id: string;
  name: string;
  description?: string;
  category: "fitness" | "yoga" | "crossfit" | "martial_arts" | "dancing" | "swimming" | "other";
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // in minutes
  sessionsCount: number;
  validityPeriod: number; // in days
  isActive: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "cash" | "card" | "bank_transfer" | "crypto" | "payment_system";
  name: string;
  details?: string;
  isActive: boolean;
}

export interface SocialNetwork {
  platform: "instagram" | "facebook" | "telegram" | "whatsapp" | "youtube" | "tiktok" | "vk" | "other";
  url: string;
  isActive: boolean;
}

export interface WorkingHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  isWorkingDay: boolean;
}

export interface LegalData {
  organizationType: "ip" | "ooo" | "fitness_club" | "personal";
  iin?: string; // ИИН (для ИП)
  bin?: string; // БИН (для ООО)
  companyName?: string;
  legalAddress?: string;
  bankDetails?: {
    bank: string;
    accountNumber: string;
    bik: string;
  };
  registrationData?: any; // Data from EGOV API
}

export interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  photo?: string;
  bio?: string;
  specializations: TrainingDirection[];
  experience: number; // years
  certifications: string[];
  contactInfo: {
    phone: string;
    email: string;
    telegram?: string;
  };
  isActive: boolean;
}

export interface Organization {
  id: string;
  // Basic Info
  clubName: string;
  ownerName: string;
  description?: string;
  
  // Training Directions
  trainingDirections: TrainingDirection[];
  
  // Services & Pricing
  servicePackages: ServicePackage[];
  
  // Location & Schedule
  address: {
    country: string;
    city: string;
    street: string;
    building: string;
    apartment?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  workingHours: WorkingHours[];
  
  // Branding
  logo?: string;
  coverImage?: string;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Payment Methods
  paymentMethods: PaymentMethod[];
  
  // Legal Information
  legalData: LegalData;
  
  // Social Networks
  socialNetworks: SocialNetwork[];
  
  // Staff
  trainers: Trainer[];
  
  // Settings
  settings: {
    allowOnlineBooking: boolean;
    requirePaymentUpfront: boolean;
    cancellationPolicy: string;
    isVerified: boolean;
    isActive: boolean;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  registrationStep: "basic" | "services" | "location" | "branding" | "payment" | "legal" | "completed";
}

export interface RegistrationFormData extends Partial<Organization> {
  currentStep: number;
  totalSteps: number;
}
