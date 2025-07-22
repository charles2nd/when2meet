// App constants and configuration

export const COLORS = {
  primary: '#8B5CF6', // Purple
  secondary: '#3B82F6', // Blue
  accent: '#EC4899', // Pink
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  dark: '#0F172A',
  darker: '#020617',
  light: '#F8FAFC',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

export const EVENT_COLORS = {
  game: '#EF4444',
  practice: '#3B82F6',
  scrim: '#8B5CF6',
  tournament: '#F59E0B',
  day_off: '#6B7280',
  check_in: '#10B981',
};

export const EVENT_LABELS = {
  game: 'Game Day',
  practice: 'Practice',
  scrim: 'Scrim',
  tournament: 'Tournament',
  day_off: 'Day Off',
  check_in: 'Check In',
};

export const GAME_LABELS = {
  csgo: 'Counter-Strike',
  valorant: 'VALORANT',
  lol: 'League of Legends',
  dota2: 'Dota 2',
  other: 'Other',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  mono: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const API_ENDPOINTS = {
  tracker: {
    csgo: 'https://api.tracker.gg/api/v2/csgo/standard/profile/',
    valorant: 'https://api.tracker.gg/api/v2/valorant/standard/profile/',
  },
  steam: {
    api: 'https://api.steampowered.com/',
  },
};

export const MOCK_CONFIG = {
  useRealAPI: false, // Set to true to use real APIs
  apiDelay: 500, // Simulate network delay
};
