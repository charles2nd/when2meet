export const Colors = {
  primary: '#FF6B35', // CS2 Orange (bomb/terrorist)
  primaryLight: '#FF8A65',
  primaryDark: '#E64A19',
  
  secondary: '#2196F3', // CS2 Blue (counter-terrorist)
  secondaryLight: '#64B5F6',
  secondaryDark: '#1976D2',
  
  accent: '#FFD700', // CS2 Gold (rare skins)
  accentLight: '#FFF176',
  accentDark: '#F57C00',
  
  success: '#4CAF50', // CS2 Green (money/wins)
  warning: '#FF9800', // CS2 Orange warning
  error: '#F44336', // CS2 Red (damage/danger)
  
  background: '#1A1A1A', // Dark tactical background
  surface: '#2D2D2D', // CS2 UI panels
  card: '#333333', // Elevated surfaces
  
  tactical: {
    dark: '#0F0F0F', // Deep black
    medium: '#1E1E1E', // Medium dark
    light: '#404040', // Lighter tactical
  },
  
  text: {
    primary: '#FFFFFF', // High contrast white
    secondary: '#B0B0B0', // Medium gray
    tertiary: '#808080', // Light gray
    inverse: '#1A1A1A', // Dark text on light backgrounds
    accent: '#FFD700', // Gold highlights
  },
  
  border: {
    light: '#404040',
    medium: '#555555',
    dark: '#666666',
  },
  
  shadow: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Typography = {
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
  }
};

export const Shadows = {
  sm: {
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
};