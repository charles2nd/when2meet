import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMockData } from '../contexts/MockDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORS } from '../utils/constants';

interface InitialSetupProps {
  onComplete: () => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ onComplete }) => {
  const { createUser, createTeam, addMemberToTeam } = useMockData();
  const { t } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: 'Player' as 'Coach' | 'IGL' | 'Player' | 'Sub',
  });
  
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
  });

  const roles = ['Player', 'IGL', 'Coach', 'Sub'];

  const handleCreateUser = async () => {
    if (!userForm.username.trim()) {
      Alert.alert(t('common.error'), 'Le nom d\'utilisateur est requis');
      return;
    }

    try {
      const userId = await createUser({
        username: userForm.username,
        email: userForm.email,
        role: userForm.role,
        teamId: '', // Will be set later
      });
      setStep(2);
    } catch (error) {
      Alert.alert(t('common.error'), 'Erreur lors de la création du profil');
    }
  };

  const handleCreateTeam = async () => {
    if (!teamForm.name.trim()) {
      Alert.alert(t('common.error'), 'Le nom de l\'équipe est requis');
      return;
    }

    try {
      const teamId = await createTeam({
        name: teamForm.name,
        description: teamForm.description,
        members: [], // Will add current user
      });
      
      onComplete();
    } catch (error) {
      Alert.alert(t('common.error'), 'Erreur lors de la création de l\'équipe');
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Coach': '#ef4444',
      'IGL': '#8b5cf6',
      'Player': '#3b82f6',
      'Sub': '#10b981',
    };
    return colors[role] || '#6b7280';
  };

  const getRoleTranslation = (role: string) => {
    const translations: Record<string, string> = {
      'Coach': 'Entraîneur',
      'IGL': 'Leader',
      'Player': 'Joueur',
      'Sub': 'Remplaçant',
    };
    return translations[role] || role;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuration Initiale</Text>
        <Text style={styles.subtitle}>
          {step === 1 ? 'Créez votre profil' : 'Créez votre équipe'}
        </Text>
      </View>

      <View style={styles.content}>
        {step === 1 ? (
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nom d'utilisateur *</Text>
              <TextInput
                style={styles.formInput}
                value={userForm.username}
                onChangeText={(text) => setUserForm(prev => ({ ...prev, username: text }))}
                placeholder="Votre nom d'utilisateur"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email (optionnel)</Text>
              <TextInput
                style={styles.formInput}
                value={userForm.email}
                onChangeText={(text) => setUserForm(prev => ({ ...prev, email: text }))}
                placeholder="votre@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Rôle dans l'équipe</Text>
              <View style={styles.roleGrid}>
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      { backgroundColor: getRoleColor(role) },
                      userForm.role === role && styles.roleButtonSelected
                    ]}
                    onPress={() => setUserForm(prev => ({ ...prev, role: role as any }))}
                  >
                    <Text style={styles.roleButtonText}>
                      {getRoleTranslation(role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
              <Text style={styles.buttonText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nom de l'équipe *</Text>
              <TextInput
                style={styles.formInput}
                value={teamForm.name}
                onChangeText={(text) => setTeamForm(prev => ({ ...prev, name: text }))}
                placeholder="ex. Les Champions"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description (optionnel)</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={teamForm.description}
                onChangeText={(text) => setTeamForm(prev => ({ ...prev, description: text }))}
                placeholder="Description de votre équipe"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleCreateTeam}>
              <Text style={styles.buttonText}>Créer l'équipe</Text>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    opacity: 0.8,
  },
  roleButtonSelected: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  roleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default InitialSetup;