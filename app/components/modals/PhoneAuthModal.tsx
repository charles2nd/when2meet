import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';

interface PhoneAuthModalProps {
  visible: boolean;
  type: 'success' | 'error' | 'verification';
  title: string;
  message: string;
  onClose: () => void;
  // For verification code input
  onVerificationSubmit?: (code: string) => void;
  showVerificationInput?: boolean;
  verificationCode?: string;
  onVerificationCodeChange?: (code: string) => void;
  isLoading?: boolean;
  // For resend functionality
  showResendButton?: boolean;
  onResend?: () => void;
  resendTimer?: number;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  onVerificationSubmit,
  showVerificationInput = false,
  verificationCode = '',
  onVerificationCodeChange,
  isLoading = false,
  showResendButton = false,
  onResend,
  resendTimer = 0,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'verification':
        return 'shield-checkmark';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'verification':
        return Colors.accent;
      default:
        return Colors.primary;
    }
  };

  const handleVerificationSubmit = () => {
    if (onVerificationSubmit && verificationCode.length === 6) {
      onVerificationSubmit(verificationCode);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backdropTouch}
            activeOpacity={1}
            onPress={onClose}
          />
          
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <LinearGradient
              colors={[Colors.surface, Colors.tactical.medium]}
              style={styles.modalContent}
            >
              {/* Header with Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getIconName()}
                  size={48}
                  color={getIconColor()}
                />
              </View>

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Message */}
              <Text style={styles.message}>{message}</Text>

              {/* Verification Code Input */}
              {showVerificationInput && (
                <View style={styles.verificationContainer}>
                  <Text style={styles.inputLabel}>Verification Code</Text>
                  <View style={styles.codeInputWrapper}>
                    <TextInput
                      style={styles.codeInput}
                      value={verificationCode}
                      onChangeText={onVerificationCodeChange}
                      placeholder="123456"
                      placeholderTextColor={Colors.text.tertiary}
                      keyboardType="numeric"
                      maxLength={6}
                      autoComplete="sms-otp"
                      textContentType="oneTimeCode"
                      autoFocus
                      selectTextOnFocus
                      returnKeyType="done"
                      onSubmitEditing={handleVerificationSubmit}
                    />
                  </View>
                  
                  {/* Resend Button */}
                  {showResendButton && (
                    <TouchableOpacity
                      style={[
                        styles.resendButton,
                        resendTimer > 0 && styles.resendButtonDisabled,
                      ]}
                      onPress={onResend}
                      disabled={resendTimer > 0 || isLoading}
                    >
                      <Text
                        style={[
                          styles.resendButtonText,
                          resendTimer > 0 && styles.resendButtonTextDisabled,
                        ]}
                      >
                        {resendTimer > 0
                          ? `Resend in ${resendTimer}s`
                          : 'Resend Code'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {showVerificationInput ? (
                  <>
                    <TouchableOpacity
                      style={[styles.secondaryButton]}
                      onPress={onClose}
                      disabled={isLoading}
                    >
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        verificationCode.length !== 6 && styles.primaryButtonDisabled,
                      ]}
                      onPress={handleVerificationSubmit}
                      disabled={verificationCode.length !== 6 || isLoading}
                    >
                      <LinearGradient
                        colors={[Colors.success, '#388E3C']}
                        style={styles.buttonGradient}
                      >
                        {isLoading ? (
                          <Text style={styles.primaryButtonText}>Verifying...</Text>
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle" size={18} color={Colors.text.inverse} />
                            <Text style={styles.primaryButtonText}>Verify</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
                    <LinearGradient
                      colors={[Colors.accent, Colors.accentDark]}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.primaryButtonText}>OK</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.accent,
    ...Shadows.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.tactical.dark,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  verificationContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  codeInputWrapper: {
    backgroundColor: Colors.tactical.light,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  codeInput: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    letterSpacing: 8,
    paddingVertical: Spacing.md,
  },
  resendButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: Colors.text.tertiary,
    textDecorationLine: 'none',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.tactical.medium,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  primaryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  secondaryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
  },
});