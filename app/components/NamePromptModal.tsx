import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { RESPONSIVE } from '../utils/responsive';
interface NamePromptModalProps {
  visible: boolean;
  onNameSet: (name: string) => void;
}

const NamePromptModal: React.FC<NamePromptModalProps> = ({ visible, onNameSet }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters long');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onNameSet(trimmedName);
      setName('');
    } catch (error) {
      console.error('[NAME_PROMPT] Error setting name:', error);
      Alert.alert('Error', 'Failed to save name. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Name Setup',
      'You can set your name later in the profile section. For now, others will see your phone number.',
      [
        { text: 'Go Back', style: 'cancel' },
        { text: 'Skip', onPress: () => onNameSet('') }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Welcome to Meet2Gether!</Text>
            <Text style={styles.subtitle}>
              Please enter your name so others can identify you in groups
            </Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.text.secondary}
              autoFocus
              maxLength={50}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isSubmitting}
            />
            
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={16} color={Colors.info} />
              <Text style={styles.infoText}>
                This name will be visible to other group members
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSubmit}
              disabled={isSubmitting || !name.trim()}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Saving...' : 'Continue'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleSkip}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: RESPONSIVE.spacing.lg,
  },
  modalContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: RESPONSIVE.spacing.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: RESPONSIVE.spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: RESPONSIVE.spacing.md,
  },
  title: {
    fontSize: RESPONSIVE.fontSizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: RESPONSIVE.spacing.sm,
  },
  subtitle: {
    fontSize: RESPONSIVE.fontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    marginBottom: RESPONSIVE.spacing.xl,
  },
  inputLabel: {
    fontSize: RESPONSIVE.fontSizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: RESPONSIVE.spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.lg,
    padding: RESPONSIVE.spacing.md,
    fontSize: RESPONSIVE.fontSizes.md,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
    marginBottom: RESPONSIVE.spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info + '20',
    padding: RESPONSIVE.spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  infoText: {
    flex: 1,
    fontSize: RESPONSIVE.fontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: RESPONSIVE.spacing.sm,
  },
  actions: {
    gap: RESPONSIVE.spacing.md,
  },
  button: {
    paddingVertical: RESPONSIVE.spacing.md,
    paddingHorizontal: RESPONSIVE.spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: RESPONSIVE.fontSizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  secondaryButtonText: {
    fontSize: RESPONSIVE.fontSizes.md,
    color: Colors.text.secondary,
  },
});

export default NamePromptModal;