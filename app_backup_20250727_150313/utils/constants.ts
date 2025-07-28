import { COLORS, SPACING } from './types';

export { COLORS, SPACING };

export const AVAILABILITY_COLORS = {
  available: COLORS.success,
  unavailable: COLORS.gray[200],
  partial: COLORS.warning,
  optimal: COLORS.primary,
  conflict: COLORS.danger
} as const;

export const TIME_SLOT_DURATION = 30; // minutes
export const MIN_SELECTION_SIZE = 1;
export const MAX_CONCURRENT_USERS = 50;
export const GESTURE_THRESHOLD = 10; // pixels
export const HAPTIC_FEEDBACK_ENABLED = true;

export const EVENT_TYPES = [
  'Game',
  'Practice', 
  'Scrim',
  'Tournament',
  'Day Off'
] as const;

export const TEAM_ROLES = [
  'Coach',
  'IGL',
  'Player',
  'Sub'
] as const;

export const DEFAULT_TIME_ZONE = 'UTC';
export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';