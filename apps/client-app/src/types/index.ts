export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'trainer' | 'admin';
  is_active: boolean;
  phone?: string;
  telegram_id?: string;
  created_at: string;
  updated_at: string;
  preferences?: {
    age?: number;
    gender?: 'Мужской' | 'Женский';
    nutrition_goal?: string;
    food_preferences?: string[];
    allergies?: string[];
  };
  client_profile?: {
    id: string;
    subscription_status?: string;
    subscription_expires?: string;
    goals?: string[];
    fitness_level?: string;
    equipment_available?: string[];
    limitations?: string[];
    body_metrics?: {
      height?: number;
      weight?: number;
    };
  };
  trainer_profile?: {
    id:string;
    qualifications?: string[];
    specializations?: string[];
    experience_years?: number;
    bio?: string;
    rating?: number;
  };
  // Client-side augmented fields for UI display
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface Workout {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'group' | 'personal';
  date: Date;
  duration: number; // minutes
  location: string;
  trainer: {
    id: string;
    name: string;
    avatar?: string;
  };
  description?: string;
  exercises?: Exercise[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string; // может быть "до отказа"
  weight?: number;
  restTime?: number;
  description?: string;
  videoUrl?: string;
  completed?: boolean;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  duration: number; // weeks
  level: 'beginner' | 'intermediate' | 'advanced';
  workouts: Workout[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Progress {
  id: string;
  date: Date;
  weight?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thigh?: number;
  };
  strengthMetrics?: {
    benchPress?: number;
    squat?: number;
    deadlift?: number;
    pullUps?: number;
  };
  endurance?: {
    runTime5k?: number;
    plankTime?: number;
  };
  photos?: string[];
  notes?: string;
}

export interface Subscription {
  id: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'unlimited';
  name: string;
  price: number;
  currency: string;
  sessionsIncluded?: number;
  sessionsUsed?: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenewal: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  date: Date;
  type: 'subscription' | 'single_session' | 'package';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  subscriptionId?: string;
  receipt?: string;
  description: string;
}

export interface HomeTask {
  id: string;
  title: string;
  description: string;
  type: 'exercise' | 'nutrition' | 'recovery' | 'reading';
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  exercises?: Exercise[];
  videoUrl?: string;
  notes?: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  date: Date;
  type: 'general' | 'workout' | 'nutrition' | 'injury' | 'mood';
  workoutId?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  fatigue?: 1 | 2 | 3 | 4 | 5;
  motivation?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'flexibility' | 'other';
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  targetDate: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number; // percentage
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  completed: boolean;
  completedAt?: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'workout_reminder' | 'payment_due' | 'program_update' | 'achievement' | 'general';
  read: boolean;
  date: Date;
  actionUrl?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'strength' | 'endurance' | 'consistency' | 'progress' | 'special';
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'trainer' | 'ai';
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'video' | 'file';
  mediaUrl?: string;
  replyTo?: string;
}

export interface NutritionRecommendation {
  id: string;
  goal: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: Meal[];
  supplements?: string[];
  notes?: string;
  createdAt: Date;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  recipe?: string;
}

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  specialization?: string;
  experience?: number; // years
  certifications?: string[];
  phone?: string;
  telegramId?: string;
  whatsappNumber?: string;
  isActive: boolean;
  joinDate: Date;
  status: 'active' | 'inactive';
  expiresAt: string;
}

// Export progress and analytics types
export * from './progress';

// Apple Health types
export type HealthDataType = 
  | 'steps'
  | 'distance'
  | 'activeEnergyBurned'
  | 'basalEnergyBurned'
  | 'heartRate'
  | 'bodyMass'
  | 'height'
  | 'bodyFatPercentage'
  | 'leanBodyMass'
  | 'workouts'
  | 'sleepAnalysis'
  | 'restingHeartRate'
  | 'vo2Max'
  | 'bloodPressure'
  | 'bloodGlucose';

export interface HealthKitDataPoint {
  value: number;
  unit: string;
  date: Date;
  source: string;
  metadata?: Record<string, any>;
}

export interface WorkoutData {
  id: string;
  type: WorkoutType;
  startDate: Date;
  endDate: Date;
  duration: number; // minutes
  totalEnergyBurned?: number; // calories
  totalDistance?: number; // meters
  averageHeartRate?: number;
  maxHeartRate?: number;
  metadata?: {
    indoorWorkout?: boolean;
    swimmingLocationType?: string;
    elevation?: number;
  };
}

export type WorkoutType = 
  | 'running'
  | 'walking'
  | 'cycling'
  | 'swimming'
  | 'strength'
  | 'yoga'
  | 'pilates'
  | 'dancing'
  | 'boxing'
  | 'climbing'
  | 'rowing'
  | 'crossTraining'
  | 'other';

export interface HealthMetrics {
  steps: HealthKitDataPoint[];
  calories: HealthKitDataPoint[];
  weight: HealthKitDataPoint[];
  heartRate: HealthKitDataPoint[];
  workouts: WorkoutData[];
  sleep: SleepData[];
  bodyComposition: {
    bodyFat?: HealthKitDataPoint[];
    leanMass?: HealthKitDataPoint[];
  };
}

export interface SleepData {
  startDate: Date;
  endDate: Date;
  value: number; // hours
  stage: 'inBed' | 'asleep' | 'awake' | 'core' | 'deep' | 'rem';
}
}

// Спортивные организации
export interface SportOrganization {
  id: string;
  name: string;
  type: OrganizationType;
  description?: string;
  specializations: SportSpecialization[];
  packages: ServicePackage[];
  contact: ContactInfo;
  location: LocationInfo;
  legalInfo: LegalInfo;
  media: MediaInfo;
  socialMedia: SocialMediaLinks;
  trainers: TrainerInfo[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationType = 
  | 'personal_trainer'
  | 'gym'
  | 'sports_club'
  | 'fitness_studio'
  | 'sports_section'
  | 'martial_arts_school'
  | 'yoga_studio'
  | 'dance_studio'
  | 'swimming_pool'
  | 'other';

export type SportSpecialization = 
  | 'strength_training'
  | 'cardio'
  | 'yoga'
  | 'pilates'
  | 'martial_arts'
  | 'boxing'
  | 'swimming'
  | 'running'
  | 'crossfit'
  | 'bodybuilding'
  | 'powerlifting'
  | 'gymnastics'
  | 'dance'
  | 'stretching'
  | 'rehabilitation'
  | 'group_classes'
  | 'personal_training'
  | 'nutrition_consulting'
  | 'other';

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration?: number; // дни
  sessionsCount?: number;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
}

export interface ContactInfo {
  phone: string[];
  email: string[];
  website?: string;
  workingHours: WorkingHours;
  paymentMethods: PaymentMethod[];
}

export interface WorkingHours {
  monday?: TimeSlot;
  tuesday?: TimeSlot;
  wednesday?: TimeSlot;
  thursday?: TimeSlot;
  friday?: TimeSlot;
  saturday?: TimeSlot;
  sunday?: TimeSlot;
  is24Hours?: boolean;
  holidays?: string[];
}

export interface TimeSlot {
  open: string; // HH:MM
  close: string; // HH:MM
  isOpen: boolean;
}

export type PaymentMethod = 
  | 'cash'
  | 'card'
  | 'bank_transfer'
  | 'qr_code'
  | 'kaspi'
  | 'halyk'
  | 'sber'
  | 'installments';

export interface LocationInfo {
  country: string;
  city: string;
  address: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  landmarks?: string;
  parking?: boolean;
  publicTransport?: string;
}

export interface LegalInfo {
  bin?: string; // БИН организации
  legalName?: string;
  registrationDate?: Date;
  taxRegime?: string;
  director?: string;
  isIndividualEntrepreneur: boolean;
  licenses?: License[];
}

export interface License {
  id: string;
  type: string;
  number: string;
  issueDate: Date;
  expiryDate?: Date;
  issuer: string;
  documentUrl?: string;
}

export interface MediaInfo {
  logo?: string;
  cover?: string;
  gallery: string[];
  videos?: string[];
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
  telegram?: string;
  vk?: string;
}

export interface TrainerInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  specializations: SportSpecialization[];
  experience: number; // лет
  certifications: Certification[];
  bio?: string;
  rating?: number;
  isActive: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
} 