/**
 * Common CS2 Styled Components and Patterns
 * Reusable styles following CS2 design principles
 */

import { StyleSheet } from 'react-native';
import { cs2Theme } from './cs2Theme';

const { colors, spacing, borderRadius, shadows, typography } = cs2Theme;

// Common layout patterns
export const CommonStyles = StyleSheet.create({
  // Flex patterns
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexColumn: { flexDirection: 'column' },
  flexCenter: { justifyContent: 'center', alignItems: 'center' },
  flexBetween: { justifyContent: 'space-between' },
  flexStart: { justifyContent: 'flex-start' },
  flexEnd: { justifyContent: 'flex-end' },
  alignCenter: { alignItems: 'center' },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },

  // Container patterns
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50, // Status bar height
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
  },

  // Card patterns
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    ...shadows.md,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.medium,
    ...shadows.lg,
  },

  // Text patterns
  textPrimary: {
    color: colors.text.primary,
    fontSize: typography.sizes.md,
  },
  textSecondary: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
  },
  heading: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  subheading: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  caption: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  // Input patterns
  input: {
    backgroundColor: colors.tactical.medium,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  inputFocused: {
    borderColor: colors.accent,
  },

  // Button patterns
  buttonBase: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },

  // Spacing utilities
  marginXs: { margin: spacing.xs },
  marginSm: { margin: spacing.sm },
  marginMd: { margin: spacing.md },
  marginLg: { margin: spacing.lg },
  marginXl: { margin: spacing.xl },
  
  paddingXs: { padding: spacing.xs },
  paddingSm: { padding: spacing.sm },
  paddingMd: { padding: spacing.md },
  paddingLg: { padding: spacing.lg },
  paddingXl: { padding: spacing.xl },

  // Border utilities
  borderRadius: { borderRadius: borderRadius.md },
  borderRadiusLg: { borderRadius: borderRadius.lg },
  borderRadiusFull: { borderRadius: borderRadius.full },

  // Shadow utilities
  shadowSm: shadows.sm,
  shadowMd: shadows.md,
  shadowLg: shadows.lg,
});

// CS2 Header Pattern
export const HeaderStyles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerCenter: {
    paddingTop: 50,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

// CS2 Panel Patterns
export const PanelStyles = StyleSheet.create({
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  panelTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    letterSpacing: 1,
  },
  panelContent: {
    gap: spacing.md,
  },
});

// Export theme for direct access
export { cs2Theme as theme };