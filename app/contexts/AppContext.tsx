import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../models/User';
import { Group } from '../models/Group';
import { Availability } from '../models/SimpleAvailability';
import { LocalStorage } from '../services/LocalStorage';
import { FirebaseGroupService } from '../services/FirebaseGroupService';
import { translations, Language, TranslationKey } from '../services/translations';

interface AppContextType {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Group
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
  
  // Availability
  myAvailability: Availability | null;
  groupAvailabilities: Availability[];
  
  // Loading state
  isLoading: boolean;
  
  // Actions
  login: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  createGroup: (name: string) => Promise<Group>;
  joinGroup: (code: string) => Promise<boolean>;
  leaveGroup: () => Promise<void>;
  saveAvailability: (availability: Availability) => Promise<void>;
  loadGroupAvailabilities: () => Promise<void>;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [myAvailability, setMyAvailability] = useState<Availability | null>(null);
  const [groupAvailabilities, setGroupAvailabilities] = useState<Availability[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Save user when it changes
  useEffect(() => {
    if (user) {
      LocalStorage.saveUser(user);
    }
  }, [user]);

  // Save group when it changes
  useEffect(() => {
    if (currentGroup) {
      LocalStorage.saveGroup(currentGroup);
    }
  }, [currentGroup]);

  const loadSavedData = async () => {
    console.log('[APP] Loading saved data...');
    try {
      const savedUser = await LocalStorage.getUser();
      if (savedUser) {
        setUser(savedUser);
        setLanguage(savedUser.language);
        
        if (savedUser.groupId) {
          const group = await LocalStorage.getGroup(savedUser.groupId);
          if (group) {
            setCurrentGroup(group);
            const availability = await LocalStorage.getAvailability(savedUser.id, group.id);
            setMyAvailability(availability);
            await loadGroupAvailabilities();
          }
        }
      }
    } catch (error) {
      console.error('[APP] Error loading saved data:', error);
    } finally {
      setIsLoading(false);
      console.log('[APP] Data loading complete');
    }
  };

  const login = async (name: string, email: string) => {
    console.log('[APP] Logging in:', email);
    const newUser = new User({ name, email, language });
    setUser(newUser);
    await LocalStorage.saveUser(newUser);
  };

  const logout = async () => {
    console.log('[APP] Logging out...');
    await LocalStorage.clearAll();
    setUser(null);
    setCurrentGroup(null);
    setMyAvailability(null);
    setGroupAvailabilities([]);
  };

  const createGroup = async (name: string): Promise<Group> => {
    console.log('[APP] Creating group:', name);
    if (!user) throw new Error('User not logged in');
    
    const group = new Group({ 
      name,
      adminId: user.id 
    });
    group.addMember(user.id);
    
    // Save to Firebase first, then LocalStorage for offline support
    await FirebaseGroupService.saveGroup(group);
    await LocalStorage.saveGroup(group);
    
    const updatedUser = new User({
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      groupId: group.id
    });
    setUser(updatedUser);
    setCurrentGroup(group);
    
    // Initialize availability
    const availability = new Availability({
      userId: user.id,
      groupId: group.id
    });
    setMyAvailability(availability);
    
    return group;
  };

  const joinGroup = async (code: string): Promise<boolean> => {
    console.log('[APP] Joining group with code:', code);
    if (!user) throw new Error('User not logged in');
    
    const group = await LocalStorage.findGroupByCode(code.toUpperCase());
    if (!group) return false;
    
    group.addMember(user.id);
    await LocalStorage.saveGroup(group);
    
    const updatedUserJoin = new User({
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      groupId: group.id
    });
    setUser(updatedUserJoin);
    setCurrentGroup(group);
    
    // Initialize or load availability
    let availability = await LocalStorage.getAvailability(user.id, group.id);
    if (!availability) {
      availability = new Availability({
        userId: user.id,
        groupId: group.id
      });
    }
    setMyAvailability(availability);
    
    await loadGroupAvailabilities();
    return true;
  };

  const leaveGroup = async () => {
    console.log('[APP] Leaving group...');
    if (!user || !currentGroup) return;
    
    try {
      // Use Firebase to remove user from group and clean up data
      await FirebaseGroupService.removeUserFromGroup(user.id, currentGroup.id);
      
      // Also update LocalStorage for offline functionality
      currentGroup.removeMember(user.id);
      await LocalStorage.saveGroup(currentGroup);
      await LocalStorage.removeAvailability(user.id, currentGroup.id);
      
      // Update user object without groupId
      const updatedUserLeave = new User({
        id: user.id,
        name: user.name,
        email: user.email,
        language: user.language,
        groupId: undefined
      });
      setUser(updatedUserLeave);
      await LocalStorage.saveUser(updatedUserLeave);
      
      // Clear current group and availability states
      setCurrentGroup(null);
      setMyAvailability(null);
      setGroupAvailabilities([]);
      
      console.log('[APP] Successfully left group');
    } catch (error) {
      console.error('[APP] Error leaving group:', error);
      throw error;
    }
  };

  const saveAvailability = async (availability: Availability) => {
    console.log('[APP] Saving availability...');
    // Save to Firebase first, then LocalStorage
    await FirebaseGroupService.saveAvailability(availability);
    await LocalStorage.saveAvailability(availability);
    setMyAvailability(availability);
  };

  const loadGroupAvailabilities = async () => {
    console.log('[APP] Loading group availabilities...');
    if (!currentGroup) return;
    
    const availabilities = await LocalStorage.getGroupAvailabilities(currentGroup.id);
    setGroupAvailabilities(availabilities);
  };

  const updateLanguage = (lang: Language) => {
    console.log('[APP] Changing language to:', lang);
    setLanguage(lang);
    if (user) {
      const updatedUser = new User({
        id: user.id,
        name: user.name,
        email: user.email,
        language: lang,
        groupId: user.groupId
      });
      setUser(updatedUser);
    }
  };

  const value: AppContextType = {
    user,
    setUser,
    currentGroup,
    setCurrentGroup,
    myAvailability,
    groupAvailabilities,
    isLoading,
    login,
    logout,
    createGroup,
    joinGroup,
    leaveGroup,
    saveAvailability,
    loadGroupAvailabilities,
    language,
    setLanguage: updateLanguage,
    t: translations[language]
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};