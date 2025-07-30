/**
 * Counter-Strike 2 Theme System
 * Clean, functional, tactical design without unnecessary decorations
 */

// CS2 Color Palette - Based on actual CS2 UI
export const CS2Colors = {
  // Primary - Terrorist/Bomb Orange
  primary: '#FF6B35',
  primaryLight: '#FF8A65',
  primaryDark: '#E64A19',
  
  // Secondary - Counter-Terrorist Blue
  secondary: '#2196F3',
  secondaryLight: '#64B5F6',
  secondaryDark: '#1976D2',
  
  // Accent - CS2 Gold (weapon skins, rare items)
  accent: '#FFD700',
  accentLight: '#FFF176',
  accentDark: '#F57C00',
  
  // Status Colors
  success: '#4CAF50', // Money/wins
  warning: '#FF9800', // Alerts
  error: '#F44336',   // Damage/danger
  info: '#03A9F4',    // Information
  
  // Background Colors - Dark tactical
  background: '#1A1A1A',    // Main dark background
  surface: '#2D2D2D',       // Cards, panels
  card: '#333333',          // Elevated surfaces
  
  // Tactical Colors (nested for compatibility)
  tactical: {
    dark: '#0F0F0F',   // Deepest black
    medium: '#1E1E1E', // Medium dark
    light: '#404040',  // Lighter tactical
  },
  
  // Text Colors (nested for compatibility)
  text: {
    primary: '#FFFFFF',    // High contrast white
    secondary: '#B0B0B0',  // Medium gray
    tertiary: '#808080',   // Light gray
    inverse: '#1A1A1A',    // Dark on light
    accent: '#FFD700',     // Gold highlights
  },
  
  // Border Colors (nested for compatibility)
  border: {
    light: '#404040',
    medium: '#555555',
    dark: '#666666',
  },
  
  // Shadow Colors (nested for compatibility)
  shadow: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },
  
  // Flat versions for new components (backwards compatible)
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textInverse: '#1A1A1A',
  textAccent: '#FFD700',
  tacticalDark: '#0F0F0F',
  tacticalMed: '#1E1E1E',
  tacticalLight: '#404040',
  borderLight: '#404040',
  borderMed: '#555555',
  borderDark: '#666666',
} as const;

// Typography - Clean and readable
export const CS2Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// Spacing - Consistent scale
export const CS2Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border Radius - Clean edges
export const CS2BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

// Shadows - Tactical depth
export const CS2Shadows = {
  sm: {
    shadowColor: CS2Colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: CS2Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: CS2Colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// Complete CS2 Theme Object
export const cs2Theme = {
  colors: CS2Colors,
  typography: CS2Typography,
  spacing: CS2Spacing,
  borderRadius: CS2BorderRadius,
  shadows: CS2Shadows,
} as const;

// Theme type for TypeScript
export type CS2Theme = typeof cs2Theme;

// Export individual parts for direct import
export { CS2Colors as Colors };
export { CS2Typography as Typography };
export { CS2Spacing as Spacing };
export { CS2BorderRadius as BorderRadius };
export { CS2Shadows as Shadows };