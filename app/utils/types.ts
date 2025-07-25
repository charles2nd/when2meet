export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  lastSeen: Date;
  isOnline: boolean;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdBy: string;
  createdAt: Date;
  isPrivate: boolean;
  inviteCode?: string;
}

export interface TeamMember {
  userId: string;
  username: string;
  role: 'Coach' | 'IGL' | 'Player' | 'Sub';
  joinedAt: Date;
  permissions: string[];
}

export interface CalendarEvent {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  type: 'Game' | 'Practice' | 'Scrim' | 'Tournament' | 'Day Off';
  startTime: Date;
  endTime: Date;
  participants: string[];
  createdBy: string;
  createdAt: Date;
  availabilityEventId?: string;
}

export interface AvailabilityEvent {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  
  startDate: Date;
  endDate: Date;
  timeSlots: TimeSlot[];
  timeZone: string;
  
  participants: string[];
  responses: AvailabilityResponse[];
  
  isRecurring: boolean;
  allowAnonymous: boolean;
  shareableLink: string;
  status: 'active' | 'closed' | 'archived';
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
}

export interface AvailabilityResponse {
  userId: string;
  userName: string;
  availableSlots: string[];
  lastUpdated: Date;
  isAnonymous: boolean;
}

export interface AvailabilityAnalytics {
  eventId: string;
  optimalSlots: OptimalTimeSlot[];
  participationSummary: ParticipationSummary;
  lastCalculated: Date;
}

export interface OptimalTimeSlot {
  timeSlot: TimeSlot;
  availableCount: number;
  availableUsers: string[];
  conflictingUsers: string[];
  score: number;
}

export interface ParticipationSummary {
  totalParticipants: number;
  respondedCount: number;
  responseRate: number;
  mostPopularSlots: TimeSlot[];
  leastPopularSlots: TimeSlot[];
}

export interface CellPosition {
  row: number;
  column: number;
}

export interface GridLayout {
  cellWidth: number;
  cellHeight: number;
  headerHeight: number;
  scrollOffset: number;
  maxColumns: number;
  maxRows: number;
}

export interface SelectionState {
  isSelecting: boolean;
  startPosition?: CellPosition;
  currentPosition?: CellPosition;
  selectedCells: string[];
}

export interface GestureData {
  x: number;
  y: number;
  translationX: number;
  translationY: number;
}

export const COLORS = {
  primary: '#8B5CF6',
  secondary: '#3B82F6',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  dark: '#0F172A',
  darker: '#020617',
  gray: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
} as const;