# 🎨 THEME SYSTEM DOCUMENTATION

## 🚨 CRITICAL REQUIREMENT
**ALL PAGES MUST USE THE GLOBAL THEME SYSTEM**
- Every screen must import from `../constants/theme`
- Use defined colors, typography, spacing, and shadows
- Follow the CS2 tactical design language
- Maintain visual consistency across the entire application

## 📁 Theme Structure

The global theme is defined in `/constants/theme.ts` and exports:

### Colors
```typescript
import { Colors } from '../constants/theme';
```

#### Primary Colors (CS2 Orange - Bomb/Terrorist)
- `Colors.primary`: '#FF6B35'
- `Colors.primaryLight`: '#FF8A65'  
- `Colors.primaryDark`: '#E64A19'

#### Secondary Colors (CS2 Blue - Counter-Terrorist)
- `Colors.secondary`: '#2196F3'
- `Colors.secondaryLight`: '#64B5F6'
- `Colors.secondaryDark`: '#1976D2'

#### Accent Colors (CS2 Gold - Rare Skins)
- `Colors.accent`: '#FFD700'
- `Colors.accentLight`: '#FFF176'
- `Colors.accentDark`: '#F57C00'

#### Status Colors
- `Colors.success`: '#4CAF50' (CS2 Green - Money/Wins)
- `Colors.warning`: '#FF9800' (CS2 Orange Warning)
- `Colors.error`: '#F44336' (CS2 Red - Damage/Danger)

#### Background Colors
- `Colors.background`: '#1A1A1A' (Dark tactical background)
- `Colors.surface`: '#2D2D2D' (CS2 UI panels)
- `Colors.card`: '#333333' (Elevated surfaces)

#### Tactical Colors
- `Colors.tactical.dark`: '#0F0F0F' (Deep black)
- `Colors.tactical.medium`: '#1E1E1E' (Medium dark)
- `Colors.tactical.light`: '#404040' (Lighter tactical)

#### Text Colors
- `Colors.text.primary`: '#FFFFFF' (High contrast white)
- `Colors.text.secondary`: '#B0B0B0' (Medium gray)
- `Colors.text.tertiary`: '#808080' (Light gray)
- `Colors.text.inverse`: '#1A1A1A' (Dark text on light backgrounds)
- `Colors.text.accent`: '#FFD700' (Gold highlights)

#### Border Colors
- `Colors.border.light`: '#404040'
- `Colors.border.medium`: '#555555'
- `Colors.border.dark`: '#666666'

### Typography
```typescript
import { Typography } from '../constants/theme';
```

#### Font Sizes
- `Typography.sizes.xs`: 12
- `Typography.sizes.sm`: 14
- `Typography.sizes.md`: 16
- `Typography.sizes.lg`: 18
- `Typography.sizes.xl`: 20
- `Typography.sizes.xxl`: 24
- `Typography.sizes.xxxl`: 32

#### Font Weights
- `Typography.weights.regular`: '400'
- `Typography.weights.medium`: '500'
- `Typography.weights.semibold`: '600'
- `Typography.weights.bold`: '700'

#### Line Heights
- `Typography.lineHeights.tight`: 1.2
- `Typography.lineHeights.normal`: 1.4
- `Typography.lineHeights.relaxed`: 1.6

### Spacing
```typescript
import { Spacing } from '../constants/theme';
```

- `Spacing.xs`: 4
- `Spacing.sm`: 8
- `Spacing.md`: 16
- `Spacing.lg`: 24
- `Spacing.xl`: 32
- `Spacing.xxl`: 48

### Border Radius
```typescript
import { BorderRadius } from '../constants/theme';
```

- `BorderRadius.sm`: 6
- `BorderRadius.md`: 12
- `BorderRadius.lg`: 16
- `BorderRadius.xl`: 24
- `BorderRadius.full`: 999

### Shadows
```typescript
import { Shadows } from '../constants/theme';
```

- `Shadows.sm`: Light shadow for subtle elevation
- `Shadows.md`: Medium shadow for cards and panels
- `Shadows.lg`: Large shadow for important elements

## 🎯 Design Language: CS2 Tactical Theme

### Visual Identity
- **Dark tactical interface** inspired by Counter-Strike 2
- **High contrast text** for readability
- **Orange/Gold accents** for highlights and actions
- **Military/tactical terminology** in UI text
- **Sharp, geometric elements** with defined borders

### Component Patterns

#### Headers
```typescript
<LinearGradient
  colors={[Colors.primary, Colors.primaryDark]}
  style={styles.header}
>
  <Text style={styles.headerTitle}>TACTICAL TITLE</Text>
  <Text style={styles.headerSubtitle}>Mission description</Text>
</LinearGradient>
```

#### Panels/Cards
```typescript
<View
  style={[
    styles.panel,
    {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.border.medium,
      ...Shadows.md,
    }
  ]}
>
```

#### Buttons
```typescript
<TouchableOpacity style={styles.button}>
  <LinearGradient
    colors={[Colors.accent, Colors.accentDark]}
    style={styles.buttonGradient}
  >
    <Ionicons name="icon-name" size={20} color={Colors.text.inverse} />
    <Text style={styles.buttonText}>ACTION TEXT</Text>
  </LinearGradient>
</TouchableOpacity>
```

#### Inputs
```typescript
<TextInput
  style={[
    {
      backgroundColor: Colors.tactical.medium,
      borderWidth: 2,
      borderColor: Colors.border.medium,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: Typography.sizes.md,
      color: Colors.text.primary,
    },
    getWebStyle('textInput')
  ]}
/>
```

## 📋 Screen Template

Every screen should follow this structure:

```typescript
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { getWebStyle } from '../utils/webStyles';

const YourScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.tactical.dark} />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>SCREEN TITLE</Text>
        <Text style={styles.headerSubtitle}>Description</Text>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Your content here */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
});

export default YourScreen;
```

## ✅ Compliance Checklist

Before submitting any screen, ensure:

- [ ] Imports theme constants from `../constants/theme`
- [ ] Uses `Colors.*` for all color values
- [ ] Uses `Typography.*` for font sizes and weights
- [ ] Uses `Spacing.*` for margins and padding
- [ ] Uses `BorderRadius.*` for rounded corners
- [ ] Uses `Shadows.*` for elevation effects
- [ ] Includes `getWebStyle()` for inputs and touchable elements
- [ ] Sets `StatusBar` with consistent styling
- [ ] Uses tactical/military terminology in UI text
- [ ] Follows the gradient header pattern
- [ ] Maintains dark theme with high contrast
- [ ] Uses Ionicons for consistent iconography

## 🚨 Common Mistakes to Avoid

❌ **DON'T:**
```typescript
// Hard-coded colors
backgroundColor: '#1A1A1A'
color: '#FFFFFF'

// Hard-coded spacing
margin: 16
padding: 24

// Inconsistent font sizes
fontSize: 18
```

✅ **DO:**
```typescript
// Use theme constants
backgroundColor: Colors.background
color: Colors.text.primary

// Use spacing constants
margin: Spacing.md
padding: Spacing.lg

// Use typography constants
fontSize: Typography.sizes.lg
```

## 🔄 Theme Updates

When updating the theme:

1. **Only modify** `/constants/theme.ts`
2. **Never use inline styles** with hard-coded values
3. **Test changes** across all screens
4. **Update documentation** if adding new constants
5. **Maintain backwards compatibility** when possible

## 📱 Screens Currently Using Proper Theming

✅ **Confirmed Themed Screens:**
- ModernLoginScreen
- ProfileScreen  
- SettingsScreen
- FindGroupScreen
- CreateTeamScreen
- JoinTeamScreen
- MeetScreen

❌ **Screens REQUIRING Immediate Theme Update:**
- **GroupScreen** - Uses old AppContext, no theme imports
- **SimpleLoginScreen** - Old login screen (replaced by ModernLoginScreen)
- **SimpleProfileScreen** - Uses AppContext instead of AuthContext

📋 **Screens Requiring Theme Audit:**
- CalendarScreen
- CalendarHeatmapScreen
- CreateAvailabilityScreen
- DateDetailScreen
- GroupChatScreen
- GroupSettingsScreen
- LoginScreen
- MonthlyAvailabilityScreen
- MonthlyCalendarScreen
- SetAvailabilityScreen
- TeamAvailabilityScreen

---

## 🚀 New Reusable Theme Architecture

### Import Pattern
```typescript
// ✅ NEW: Use reusable theme system
import { 
  Colors, 
  Typography, 
  Spacing, 
  BorderRadius, 
  Shadows,
  CommonStyles,
  HeaderStyles
} from '../theme';

// ❌ OLD: Direct constants import (deprecated)
import { Colors } from '../constants/theme';
```

### Common Styles Usage
```typescript
// Use pre-built common styles
<View style={[CommonStyles.container]}>
  <View style={[CommonStyles.panel]}>
    <Text style={[CommonStyles.heading]}>Title</Text>
    <TextInput style={[CommonStyles.input]} />
    <TouchableOpacity style={[CommonStyles.buttonBase]}>
      <LinearGradient style={CommonStyles.buttonGradient}>
        <Text style={CommonStyles.buttonText}>Action</Text>
      </LinearGradient>
    </TouchableOpacity>
  </View>
</View>
```

### Theme Hooks (Alternative)
```typescript
import { useTheme, useThemeColors } from '../theme';

const Component = () => {
  const theme = useTheme();
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Content</Text>
    </View>
  );
};
```

## 📱 Updated Screen Status

✅ **Properly Themed with New Architecture:**
- ModernLoginScreen
- ProfileScreen  
- SettingsScreen
- FindGroupScreen
- CreateTeamScreen
- JoinTeamScreen
- MeetScreen
- **GroupScreen** ← Newly updated!

**Remember: Clean Counter-Strike 2 theme only - no decorative elements, just functional tactical design!**