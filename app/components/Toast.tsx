import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: Colors.success };
      case 'error':
        return { name: 'alert-circle', color: Colors.error };
      case 'warning':
        return { name: 'warning', color: Colors.warning };
      case 'info':
      default:
        return { name: 'information-circle', color: Colors.info };
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      case 'info':
      default:
        return Colors.primary;
    }
  };

  const icon = getIcon();
  const backgroundColor = getBackgroundColor();

  return (
    <SafeAreaView style={styles.safeArea} pointerEvents="none">
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
            backgroundColor,
          },
        ]}
      >
        <Ionicons name={icon.name as any} size={24} color={Colors.text.inverse} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

// Toast Manager
let toastInstance: ((props: ToastProps) => void) | null = null;

export const showToast = (message: string, type?: ToastProps['type'], duration?: number) => {
  if (toastInstance) {
    toastInstance({ message, type, duration });
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    toastInstance = (props: ToastProps) => {
      setToast(props);
    };

    return () => {
      toastInstance = null;
    };
  }, []);

  return (
    <>
      {children}
      {toast && (
        <View style={styles.toastContainer}>
          <Toast
            {...toast}
            onHide={() => setToast(null)}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Platform.OS === 'ios' ? Spacing.xs : Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.lg,
  },
  message: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text.inverse,
  },
});