import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { User } from '../models/User';
import { Group } from '../models/Group';
import { Availability } from '../models/SimpleAvailability';
import { LocalStorage } from '../services/LocalStorage';
import { FirebaseGroupService } from '../services/FirebaseGroupService';
import { translations, Language, TranslationKey } from '../services/translations';
import { DemoDataService } from '../services/DemoDataService';
import { useAuth } from './AuthContext';

interface AppContextType {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Group
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
  isAdmin: boolean;  // Whether current user is admin of current group
  
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
  const { user: authUser } = useAuth(); // Get user from AuthContext
  const [user, setUser] = useState<User | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [myAvailability, setMyAvailability] = useState<Availability | null>(null);
  const [groupAvailabilities, setGroupAvailabilities] = useState<Availability[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [languageLoaded, setLanguageLoaded] = useState<boolean>(false);

  // Load saved language and initialize demo data on app start
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await LocalStorage.getLanguage();
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
          setLanguage(savedLanguage as Language);
          console.log('[APP] Loaded saved language:', savedLanguage);
        } else {
          console.log('[APP] No saved language, using default: en');
        }
      } catch (error) {
        console.error('[APP] Error loading language:', error);
      } finally {
        setLanguageLoaded(true);
      }
    };

    const initializeDemoData = async () => {
      try {
        // Force regenerate demo data once to ensure TEST999 exists
        console.log('[APP] Force regenerating demo data to ensure TEST999 exists...');
        await DemoDataService.initializeDemoGroup(true);
      } catch (error) {
        console.error('[APP] Error initializing demo data:', error);
      }
    };

    loadLanguage();
    // Initialize demo data immediately for testing
    initializeDemoData();
  }, []);

  // Sync user from AuthContext to AppContext (only after language is loaded)
  useEffect(() => {
    if (!languageLoaded) return; // Wait for language to load first
    
    if (authUser) {
      // Create or update AppContext user based on AuthContext user
      const appUser = new User({
        id: authUser.uid,
        name: authUser.displayName || 'User',
        email: authUser.email,
        language: language
      });
      setUser(appUser);
      console.log('[APP] User synced from AuthContext:', appUser.toJSON());
    } else {
      setUser(null);
      setCurrentGroup(null); // Clear group when user logs out
      console.log('[APP] User cleared from AuthContext');
    }
  }, [authUser, languageLoaded]); // Removed language dependency to prevent loops

  // Load saved data when user changes (only once per user)
  useEffect(() => {
    if (user && !isLoading && !currentGroup) { // Only load if we don't already have data and not loading
      console.log('[APP] Loading saved data for new user:', user.id);
      loadSavedData();
    }
  }, [user, isLoading]); // Add isLoading dependency to prevent race conditions

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
    console.log('[APP] Loading saved data for user:', user?.id);
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    // Prevent multiple simultaneous loads
    if (isLoading) {
      console.log('[APP] Already loading data, skipping...');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if user has a saved group
      const savedUser = await LocalStorage.getUser();
      if (savedUser && savedUser.groupId) {
        console.log('[APP] Loading group for user:', savedUser.groupId);
        const group = await LocalStorage.getGroup(savedUser.groupId);
        if (group) {
          setCurrentGroup(group);
          console.log('[APP] Group loaded:', group.name, 'Members:', group.members.length);
          
          // Load user's availability for this group
          const availability = await LocalStorage.getAvailability(user.id, group.id);
          // Ensure it's a proper Availability instance
          setMyAvailability(availability ? Availability.fromJSON(availability.toJSON()) : null);
          await loadGroupAvailabilities();
        } else {
          console.log('[APP] Group not found in storage, clearing group');
          setCurrentGroup(null);
        }
        
        // Note: Don't update user here to avoid infinite loop
        // The user already has the correct data from AuthContext sync
      } else {
        console.log('[APP] User has no group ID, clearing group');
        setCurrentGroup(null);
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
    try {
      // Clear user data but keep language preference
      await LocalStorage.clearUser();
      setUser(null);
      setCurrentGroup(null);
      setMyAvailability(null);
      setGroupAvailabilities([]);
      console.log('[APP] Logout completed successfully');
    } catch (error) {
      console.error('[APP] Error during logout:', error);
    }
  };

  const createGroup = async (name: string): Promise<Group> => {
    console.log('[APP] Creating group:', name);
    if (!user) throw new Error('User not logged in');
    
    const group = new Group({ 
      name,
      adminId: user.id  // Creator becomes admin automatically
    });
    group.addMember(user.id);
    
    // Save ONLY to LocalStorage (Firebase sync will be added later)
    await LocalStorage.saveGroup(group);
    console.log('[APP] Group saved to LocalStorage:', group.toJSON());
    
    // Update user with group association
    const updatedUser = new User({
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      groupId: group.id
    });
    setUser(updatedUser);
    await LocalStorage.saveUser(updatedUser);
    
    // Set current group (this will trigger tab visibility)
    setCurrentGroup(group);
    
    // Initialize availability for the creator
    const availability = new Availability({
      userId: user.id,
      groupId: group.id
    });
    setMyAvailability(availability);
    await LocalStorage.saveAvailability(availability);
    
    console.log('[APP] Group creation complete. User is admin:', group.isAdmin(user.id));
    return group;
  };

  const joinGroup = async (code: string): Promise<boolean> => {
    console.log('[APP] Joining group with code:', code);
    if (!user) throw new Error('User not logged in');
    
    // Debug: List all groups first
    const allGroups = await LocalStorage.getAllGroups();
    console.log('[APP] All groups in storage:', allGroups.map(g => ({ name: g.name, code: g.code })));
    
    const group = await LocalStorage.findGroupByCode(code.toUpperCase());
    if (!group) {
      console.log('[APP] Group not found with code:', code.toUpperCase());
      return false;
    }
    
    console.log('[APP] Found group:', group.name, 'Code:', group.code);
    
    // Handle demo group specially - don't add user as member, just observe
    if (DemoDataService.isDemoGroup(code.toUpperCase())) {
      console.log('[APP] Joining demo group - user will observe fake players');
    } else {
      // Add user to group members for regular groups
      group.addMember(user.id);
      await LocalStorage.saveGroup(group);
      console.log('[APP] User added to group, updated group saved');
    }
    
    // Update user with group association
    const updatedUserJoin = new User({
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      groupId: group.id
    });
    setUser(updatedUserJoin);
    await LocalStorage.saveUser(updatedUserJoin);
    
    // Set current group (this will trigger tab visibility)
    setCurrentGroup(group);
    
    // Initialize or load availability
    let availability = await LocalStorage.getAvailability(user.id, group.id);
    if (!availability) {
      availability = new Availability({
        userId: user.id,
        groupId: group.id
      });
      await LocalStorage.saveAvailability(availability);
    } else {
      // Ensure it's a proper Availability instance
      availability = Availability.fromJSON(availability.toJSON());
    }
    setMyAvailability(availability);
    
    await loadGroupAvailabilities();
    console.log('[APP] Successfully joined group. User is admin:', group.isAdmin(user.id));
    return true;
  };

  const leaveGroup = async () => {
    console.log('[APP] Leaving group...');
    if (!user || !currentGroup) return;
    
    try {
      // Remove user from group members
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
    // Ensure we have a proper Availability instance
    const properAvailability = availability instanceof Availability ? 
      availability : 
      Availability.fromJSON(availability);
    
    // Save ONLY to LocalStorage (Firebase sync will be added later)
    await LocalStorage.saveAvailability(properAvailability);
    setMyAvailability(properAvailability);
    console.log('[APP] Availability saved to LocalStorage');
  };

  const loadGroupAvailabilities = async () => {
    console.log('[APP] Loading group availabilities...');
    if (!currentGroup) return;
    
    const availabilities = await LocalStorage.getGroupAvailabilities(currentGroup.id);
    // Ensure all availabilities are proper instances
    const properAvailabilities = availabilities.map(avail => 
      avail instanceof Availability ? avail : Availability.fromJSON(avail as any)
    );
    setGroupAvailabilities(properAvailabilities);
  };

  const updateLanguage = async (lang: Language) => {
    console.log('[APP] Changing language to:', lang);
    try {
      // Save language to storage first
      await LocalStorage.saveLanguage(lang);
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
        await LocalStorage.saveUser(updatedUser);
      }
      console.log('[APP] Language changed and saved successfully');
    } catch (error) {
      console.error('[APP] Error updating language:', error);
    }
  };

  // Check if current user is admin of current group
  const isAdmin = !!(user && currentGroup && currentGroup.isAdmin(user.id));

  const value: AppContextType = useMemo(() => ({
    user,
    setUser,
    currentGroup,
    setCurrentGroup,
    isAdmin,
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
    t: translations[language] || translations.en // Fallback to English if language is invalid
  }), [
    user,
    currentGroup,
    isAdmin,
    myAvailability,
    groupAvailabilities,
    isLoading,
    language
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};