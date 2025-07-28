import { Colors, Typography, Spacing } from '../constants/theme';

describe('CS2 Theme Integration', () => {
  test('should have CS2-inspired color palette', () => {
    // CS2 Orange (bomb/terrorist color)
    expect(Colors.primary).toBe('#FF6B35');
    
    // CS2 Blue (counter-terrorist color) 
    expect(Colors.secondary).toBe('#2196F3');
    
    // CS2 Gold (rare skins)
    expect(Colors.accent).toBe('#FFD700');
    
    // Dark tactical background
    expect(Colors.background).toBe('#1A1A1A');
    
    // CS2 UI panels
    expect(Colors.surface).toBe('#2D2D2D');
  });

  test('should have tactical color variants', () => {
    expect(Colors.tactical.dark).toBe('#0F0F0F');
    expect(Colors.tactical.medium).toBe('#1E1E1E');
    expect(Colors.tactical.light).toBe('#404040');
  });

  test('should have high contrast text colors for dark theme', () => {
    expect(Colors.text.primary).toBe('#FFFFFF');
    expect(Colors.text.secondary).toBe('#B0B0B0');
    expect(Colors.text.tertiary).toBe('#808080');
    expect(Colors.text.accent).toBe('#FFD700');
  });

  test('should maintain readable typography scale', () => {
    expect(Typography.sizes.xs).toBe(12);
    expect(Typography.sizes.sm).toBe(14);
    expect(Typography.sizes.md).toBe(16);
    expect(Typography.sizes.lg).toBe(18);
    expect(Typography.sizes.xl).toBe(20);
    expect(Typography.sizes.xxl).toBe(24);
    expect(Typography.sizes.xxxl).toBe(32);
  });

  test('should have appropriate spacing for mobile', () => {
    expect(Spacing.xs).toBe(4);
    expect(Spacing.sm).toBe(8);
    expect(Spacing.md).toBe(16);
    expect(Spacing.lg).toBe(24);
    expect(Spacing.xl).toBe(32);
    expect(Spacing.xxl).toBe(48);
  });

  test('should have darker shadows for tactical theme', () => {
    expect(Colors.shadow.light).toBe('rgba(0, 0, 0, 0.3)');
    expect(Colors.shadow.medium).toBe('rgba(0, 0, 0, 0.5)');
    expect(Colors.shadow.dark).toBe('rgba(0, 0, 0, 0.7)');
  });
});