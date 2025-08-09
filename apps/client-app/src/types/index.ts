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

export interface SubscriptionHistory {
  id: string;
  subscriptionId: string;
  type: 'purchase' | 'renewal' | 'cancellation' | 'modification';
  planName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  date: Date;
  status: 'completed' | 'failed' | 'pending';
  description: string;
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
  monday?: WorkingHoursSlot;
  tuesday?: WorkingHoursSlot;
  wednesday?: WorkingHoursSlot;
  thursday?: WorkingHoursSlot;
  friday?: WorkingHoursSlot;
  saturday?: WorkingHoursSlot;
  sunday?: WorkingHoursSlot;
  is24Hours?: boolean;
  holidays?: string[];
}

export interface WorkingHoursSlot {
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

// Calendar Filter Types
export interface CalendarFilters {
  workoutTypes: WorkoutTypeFilter[];
  statuses: WorkoutStatusFilter[];
  trainers: string[];
  dateRange: {
    startDate?: Date;
    endDate?: Date;
  };
  locations: string[];
  timeOfDay: TimeOfDayFilter[];
}

export type WorkoutTypeFilter = 'strength' | 'cardio' | 'flexibility' | 'group' | 'personal';
export type WorkoutStatusFilter = 'scheduled' | 'completed' | 'cancelled' | 'missed';
export type TimeOfDayFilter = 'morning' | 'afternoon' | 'evening';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// Gym Discovery Types
export interface Gym {
  id: string;
  name: string;
  description: string;
  sportTypes: GymSportType[];
  location: GymLocation;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  photos: GymPhoto[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  reviews: GymReview[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  workingHours: WorkingHours;
  packages: GymPackage[];
  verified: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type GymSportType = 
  | 'bjj'
  | 'boxing'
  | 'mma'
  | 'muay_thai'
  | 'kickboxing'
  | 'judo'
  | 'karate'
  | 'taekwondo'
  | 'wrestling'
  | 'jiu_jitsu'
  | 'strength_training'
  | 'cardio'
  | 'crossfit'
  | 'yoga'
  | 'pilates'
  | 'swimming'
  | 'other';

export interface GymLocation {
  address: string;
  city: string;
  district?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number; // from user location in km
}

export interface GymPhoto {
  id: string;
  url: string;
  alt: string;
  type: 'main' | 'interior' | 'equipment' | 'exterior' | 'class';
  order: number;
}

export interface GymReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  photos?: string[];
  date: Date;
  helpful: number;
  verified: boolean;
}

export interface GymPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // days
  sessionsIncluded?: number;
  features: string[];
  popular: boolean;
}

export interface GymFilters {
  location?: {
    city?: string;
    district?: string;
    radius?: number; // km
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  sportTypes: GymSportType[];
  priceRange: {
    min: number;
    max: number;
  };
  rating?: number;
  amenities: string[];
  verified?: boolean;
  featured?: boolean;
  sortBy: 'rating' | 'distance' | 'price_low' | 'price_high' | 'name' | 'newest';
}

export interface GymSearchParams {
  query?: string;
  filters: GymFilters;
  page: number;
  limit: number;
}

export interface GymSearchResult {
  gyms: Gym[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    sportTypes: FilterOption[];
    priceRanges: FilterOption[];
    amenities: FilterOption[];
    cities: FilterOption[];
    districts: FilterOption[];
  };
}

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'client' | 'trainer' | 'admin';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role: 'client' | 'trainer';
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
  // Trainer-specific fields
  businessName?: string;
  specializations?: string[];
  certifications?: string[];
  experience?: string;
  bio?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthError {
  field?: string;
  message: string;
  code?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;
  accessToken: string | null;
  refreshToken: string | null;
} 

// Trainer Directory Types
export interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  specializations: TrainerSpecialization[];
  experience: number; // years
  certifications: TrainerCertification[];
  rating: number;
  reviewCount: number;
  reviews: TrainerReview[];
  availability: TrainerAvailability;
  contact: TrainerContact;
  location: TrainerLocation;
  pricing: TrainerPricing;
  languages: string[];
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  joinDate: Date;
  lastActive: Date;
  stats: TrainerStats;
}

export type TrainerSpecialization = 
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
  | 'nutrition'
  | 'weight_loss'
  | 'muscle_gain'
  | 'flexibility'
  | 'endurance'
  | 'sports_specific'
  | 'senior_fitness'
  | 'prenatal_postnatal'
  | 'kids_fitness'
  | 'functional_fitness'
  | 'meditation'
  | 'other';

export interface TrainerCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
  isVerified: boolean;
}

export interface TrainerReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  photos?: string[];
  date: Date;
  helpful: number;
  verified: boolean;
  sessionType?: string;
  sessionDate?: Date;
}

export interface TrainerAvailability {
  schedule: WeeklySchedule;
  timeSlots: TrainerTimeSlot[];
  timezone: string;
  isAvailable: boolean;
  nextAvailableSlot?: Date;
  customAvailability?: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isAvailable: boolean;
  slots: TrainerTimeSlot[];
  notes?: string;
}

export interface TrainerTimeSlot {
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
  sessionType?: 'personal' | 'group' | 'online';
  maxParticipants?: number;
}

export interface TrainerContact {
  phone?: string;
  email?: string;
  telegram?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  preferredContact: 'phone' | 'email' | 'telegram' | 'whatsapp' | 'instagram';
}

export interface TrainerLocation {
  city: string;
  district?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  travelRadius?: number; // km
  homeVisits: boolean;
  onlineSessions: boolean;
  gymLocations?: string[];
}

export interface TrainerPricing {
  personalSession: number;
  groupSession?: number;
  onlineSession?: number;
  packageDiscounts: PackageDiscount[];
  currency: string;
  paymentMethods: PaymentMethod[];
  freeConsultation: boolean;
  consultationDuration?: number; // minutes
}

export interface PackageDiscount {
  sessions: number;
  discount: number; // percentage
  price: number;
  validDays: number;
}

export interface TrainerStats {
  totalSessions: number;
  totalClients: number;
  averageRating: number;
  responseTime: number; // minutes
  completionRate: number; // percentage
  repeatClientRate: number; // percentage
}

export interface TrainerFilters {
  specializations: TrainerSpecialization[];
  experience: {
    min: number;
    max: number;
  };
  rating: number;
  priceRange: {
    min: number;
    max: number;
  };
  city?: string;
  location?: {
    city?: string;
    district?: string;
    radius?: number; // km
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availability?: {
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    timeSlot?: string; // HH:MM
  };
  sessionType: ('personal' | 'group' | 'online')[];
  languages: string[];
  verified?: boolean;
  featured?: boolean;
  sortBy: 'rating' | 'experience' | 'price_low' | 'price_high' | 'distance' | 'response_time' | 'availability';
}

export interface TrainerSearchParams {
  query?: string;
  filters: TrainerFilters;
  page: number;
  limit: number;
}

export interface TrainerSearchResult {
  trainers: Trainer[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    specializations: FilterOption[];
    experienceRanges: FilterOption[];
    priceRanges: FilterOption[];
    cities: FilterOption[];
    districts: FilterOption[];
    languages: FilterOption[];
  };
}

export interface TrainerBookingRequest {
  trainerId: string;
  sessionType: 'personal' | 'group' | 'online';
  date: Date;
  timeSlot: string;
  duration: number; // minutes
  location?: string;
  notes?: string;
  packageId?: string;
}

export interface TrainerBookingResponse {
  bookingId: string;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled';
  trainerResponse?: string;
  responseTime?: Date;
} 