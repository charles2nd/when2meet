import { Platform } from 'react-native';

export const webStyles = {
  // Maximum width for better web experience
  maxWidth: Platform.OS === 'web' ? 1200 : undefined,
  
  // Better spacing on web
  webPadding: Platform.OS === 'web' ? 40 : 16,
  
  // Hover effects for web
  webHover: Platform.OS === 'web' ? {
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } : {},
  
  // Button hover effects
  webButtonHover: Platform.OS === 'web' ? {
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      opacity: 0.8,
      transform: 'scale(1.02)',
    }
  } : {},
  
  // Card shadows for web
  webCardShadow: Platform.OS === 'web' ? {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  } : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Responsive container
  webContainer: Platform.OS === 'web' ? {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  } : {},
  
  // Better scrollbars on web
  webScrollbar: Platform.OS === 'web' ? {
    '::-webkit-scrollbar': {
      width: 8,
      height: 8,
    },
    '::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: 4,
    },
    '::-webkit-scrollbar-thumb': {
      background: '#c1c1c1',
      borderRadius: 4,
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: '#a1a1a1',
    },
  } : {},
};

export const getWebStyle = (baseStyle: any, webOverrides: any = {}) => {
  if (Platform.OS === 'web') {
    return { ...baseStyle, ...webOverrides };
  }
  return baseStyle;
};