import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// iPhone screen dimensions
export const IPHONE_SIZES = {
  // iPhone SE (1st gen), 5s
  SMALL: { width: 320, height: 568 },
  // iPhone SE (2nd/3rd gen), 6s, 7, 8
  MEDIUM: { width: 375, height: 667 },
  // iPhone 6+, 7+, 8+
  LARGE: { width: 414, height: 736 },
  // iPhone X, XS, 11 Pro
  X_SERIES: { width: 375, height: 812 },
  // iPhone XR, 11
  XR_SERIES: { width: 414, height: 896 },
  // iPhone 12 mini, 13 mini
  MINI: { width: 375, height: 812 },
  // iPhone 12/13/14, 15
  STANDARD: { width: 390, height: 844 },
  // iPhone 12/13/14 Plus, 15 Plus
  PLUS: { width: 428, height: 926 },
  // iPhone 12/13/14/15 Pro Max
  PRO_MAX: { width: 430, height: 932 }
};

export const getScreenType = () => {
  if (SCREEN_WIDTH <= 320) return 'small';
  if (SCREEN_WIDTH <= 375) return 'medium';
  if (SCREEN_WIDTH <= 414) return 'large';
  if (SCREEN_WIDTH <= 430) return 'xlarge';
  return 'xlarge';
};

export const isSmallScreen = () => SCREEN_WIDTH <= 375;
export const isMediumScreen = () => SCREEN_WIDTH > 375 && SCREEN_WIDTH <= 414;
export const isLargeScreen = () => SCREEN_WIDTH > 414;

// Responsive scaling functions
export const scale = (size: number) => {
  const baseWidth = 375; // iPhone 8 base
  return (SCREEN_WIDTH / baseWidth) * size;
};

export const verticalScale = (size: number) => {
  const baseHeight = 812; // iPhone X base
  return (SCREEN_HEIGHT / baseHeight) * size;
};

export const moderateScale = (size: number, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Safe area calculations for different iPhones
export const getSafeAreaInsets = () => {
  const screenType = getScreenType();
  
  switch (screenType) {
    case 'small':
      return { top: 20, bottom: 0, left: 0, right: 0 };
    case 'medium':
      return { top: 20, bottom: 0, left: 0, right: 0 };
    case 'large':
      return { top: 20, bottom: 0, left: 0, right: 0 };
    case 'xlarge':
      return { top: 44, bottom: 34, left: 0, right: 0 };
    default:
      return { top: 44, bottom: 34, left: 0, right: 0 };
  }
};

// Responsive spacing
export const getSpacing = () => {
  const screenType = getScreenType();
  
  return {
    xs: screenType === 'small' ? 2 : 4,
    sm: screenType === 'small' ? 4 : 8,
    md: screenType === 'small' ? 8 : 16,
    lg: screenType === 'small' ? 12 : 24,
    xl: screenType === 'small' ? 16 : 32,
  };
};

// Responsive font sizes
export const getFontSizes = () => {
  const screenType = getScreenType();
  
  return {
    xs: screenType === 'small' ? 10 : 12,
    sm: screenType === 'small' ? 12 : 14,
    md: screenType === 'small' ? 14 : 16,
    lg: screenType === 'small' ? 16 : 18,
    xl: screenType === 'small' ? 18 : 20,
    xxl: screenType === 'small' ? 20 : 24,
    xxxl: screenType === 'small' ? 24 : 32,
  };
};

export const RESPONSIVE = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  scale,
  verticalScale,
  moderateScale,
  isSmallScreen: isSmallScreen(),
  isMediumScreen: isMediumScreen(),
  isLargeScreen: isLargeScreen(),
  spacing: getSpacing(),
  fontSizes: getFontSizes(),
  safeArea: getSafeAreaInsets(),
};