/**
 * CS2 Theme Hook - Simple and functional
 * Returns the CS2 theme for use in components
 */

import { cs2Theme, CS2Theme } from './cs2Theme';

/**
 * Custom hook to access CS2 theme
 * @returns CS2Theme object with colors, typography, spacing, etc.
 */
export const useTheme = (): CS2Theme => {
  return cs2Theme;
};

/**
 * Hook to get specific theme values
 */
export const useThemeColors = () => cs2Theme.colors;
export const useThemeTypography = () => cs2Theme.typography;
export const useThemeSpacing = () => cs2Theme.spacing;
export const useThemeBorderRadius = () => cs2Theme.borderRadius;
export const useThemeShadows = () => cs2Theme.shadows;