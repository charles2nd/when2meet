import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Shadows } from '../constants/theme';

interface AppLogoProps {
  size?: number;
  variant?: 'icon' | 'calendar' | 'gradient';
  showShadow?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 60, 
  variant = 'icon',
  showShadow = true 
}) => {
  const logoStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const containerStyle = [
    styles.container,
    logoStyle,
    showShadow && styles.shadow
  ];

  // Try to use the actual app icon first, fallback to calendar icon
  if (variant === 'icon') {
    return (
      <View style={containerStyle}>
        <Image
          source={require('../assets/images/app_icon.png')}
          style={[styles.image, logoStyle]}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Gradient with calendar icon (current implementation)
  if (variant === 'calendar' || variant === 'gradient') {
    return (
      <LinearGradient
        colors={[Colors.accent, '#FF6F00']}
        style={[containerStyle, styles.gradient]}
      >
        <Ionicons 
          name="calendar" 
          size={size * 0.4} 
          color={Colors.text.inverse} 
        />
      </LinearGradient>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  image: {
    backgroundColor: 'transparent',
  },
  gradient: {
    borderWidth: 0,
  },
  shadow: {
    ...Shadows.lg,
    elevation: 8,
    shadowColor: Colors.accent,
  },
});