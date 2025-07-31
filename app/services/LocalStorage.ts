import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, IUser } from '../models/User';
import { Group, IGroup } from '../models/Group';
import { Availability, IAvailability } from '../models/SimpleAvailability';

export class LocalStorage {
  // User Management
  static async saveUser(user: User): Promise<void> {
    console.log('[STORAGE] Saving user:', user.id);
    
    // Validate user before saving
    const validation = user.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid user data: ${validation.errors.join(', ')}`);
    }
    
    // Sanitize user data
    user.sanitize();
    
    await AsyncStorage.setItem('current_user', JSON.stringify(user.toJSON()));
    
    // Store user in registry for phone number uniqueness checking (if phone auth)
    if (user.phoneNumber) {
      await this.addUserToRegistry(user);
    }
  }

  static async getUser(): Promise<User | null> {
    console.log('[STORAGE] Loading user...');
    const data = await AsyncStorage.getItem('current_user');
    if (!data) return null;
    return User.fromJSON(JSON.parse(data));
  }

  static async clearUser(): Promise<void> {
    console.log('[STORAGE] Clearing user...');
    
    // Get current user first to remove from registry
    const currentUser = await this.getUser();
    if (currentUser && currentUser.phoneNumber) {
      await this.removeUserFromRegistry(currentUser.id);
    }
    
    await AsyncStorage.removeItem('current_user');
  }

  // Language Management
  static async saveLanguage(language: string): Promise<void> {
    console.log('[STORAGE] Saving language:', language);
    await AsyncStorage.setItem('user_language', language);
  }

  static async getLanguage(): Promise<string | null> {
    console.log('[STORAGE] Loading language...');
    return await AsyncStorage.getItem('user_language');
  }

  // Group Management
  static async saveGroup(group: Group, skipValidation: boolean = false): Promise<void> {
    console.log('[STORAGE] Saving group:', group.id, 'skipValidation:', skipValidation);
    
    if (!skipValidation) {
      // Check for duplicate codes before saving
      const existingGroups = await this.getAllGroups();
      const duplicateByCode = existingGroups.find(g => g.id !== group.id && g.code === group.code);
      if (duplicateByCode) {
        throw new Error(`Group code ${group.code} already exists`);
      }
      
      // Group names can be duplicated - only codes must be unique
    }
    
    await AsyncStorage.setItem(`group_${group.id}`, JSON.stringify(group.toJSON()));
  }

  static async getGroup(groupId: string): Promise<Group | null> {
    console.log('[STORAGE] Loading group:', groupId);
    const data = await AsyncStorage.getItem(`group_${groupId}`);
    if (!data) return null;
    return Group.fromJSON(JSON.parse(data));
  }

  static async getAllGroups(): Promise<Group[]> {
    console.log('[STORAGE] Loading all groups...');
    const keys = await AsyncStorage.getAllKeys();
    const groupKeys = keys.filter(key => key.startsWith('group_'));
    const groups: Group[] = [];
    
    for (const key of groupKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        groups.push(Group.fromJSON(JSON.parse(data)));
      }
    }
    
    return groups;
  }

  static async getUserGroups(userId: string): Promise<Group[]> {
    console.log('[STORAGE] Loading groups for user:', userId);
    const allGroups = await this.getAllGroups();
    return allGroups.filter(group => 
      group.members.includes(userId) || group.adminId === userId
    );
  }

  static async getUserAdminGroups(userId: string): Promise<Group[]> {
    console.log('[STORAGE] Loading admin groups for user:', userId);
    const allGroups = await this.getAllGroups();
    return allGroups.filter(group => group.adminId === userId);
  }

  static async findGroupByCode(code: string): Promise<Group | null> {
    console.log('[STORAGE] Finding group by code:', code);
    const groups = await this.getAllGroups();
    return groups.find(g => g.code === code.toUpperCase()) || null;
  }

  static async isGroupCodeUnique(code: string, excludeGroupId?: string): Promise<boolean> {
    console.log('[STORAGE] Checking if group code is unique:', code);
    const groups = await this.getAllGroups();
    return !groups.some(g => g.code === code.toUpperCase() && g.id !== excludeGroupId);
  }

  // REMOVED: Group names can now be duplicated - only codes must be unique
  // Use findGroupByCode() and generateUniqueGroupCode() for code-based operations

  static async generateUniqueGroupCode(): Promise<string> {
    const maxAttempts = 100;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      if (await this.isGroupCodeUnique(code)) {
        console.log('[STORAGE] Generated unique group code:', code);
        return code;
      }
      
      attempts++;
    }
    
    throw new Error('Failed to generate unique group code after 100 attempts');
  }

  static async removeGroup(groupId: string): Promise<void> {
    console.log('[STORAGE] Removing group:', groupId);
    await AsyncStorage.removeItem(`group_${groupId}`);
  }

  // Availability Management
  static async saveAvailability(availability: Availability): Promise<void> {
    console.log('[STORAGE] Saving availability for user:', availability.userId);
    const key = `availability_${availability.userId}_${availability.groupId}`;
    await AsyncStorage.setItem(key, JSON.stringify(availability.toJSON()));
  }

  static async getAvailability(userId: string, groupId: string): Promise<Availability | null> {
    console.log('[STORAGE] Loading availability:', userId, groupId);
    const key = `availability_${userId}_${groupId}`;
    const data = await AsyncStorage.getItem(key);
    if (!data) return null;
    return Availability.fromJSON(JSON.parse(data));
  }

  static async getGroupAvailabilities(groupId: string): Promise<Availability[]> {
    console.log('[STORAGE] Loading group availabilities:', groupId);
    const keys = await AsyncStorage.getAllKeys();
    const availabilityKeys = keys.filter(key => 
      key.startsWith('availability_') && key.endsWith(`_${groupId}`)
    );
    
    const availabilities: Availability[] = [];
    for (const key of availabilityKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        availabilities.push(Availability.fromJSON(JSON.parse(data)));
      }
    }
    
    return availabilities;
  }

  static async removeAvailability(userId: string, groupId: string): Promise<void> {
    console.log('[STORAGE] Removing availability for user:', userId, 'group:', groupId);
    const key = `availability_${userId}_${groupId}`;
    await AsyncStorage.removeItem(key);
  }

  // Group validation
  static async validateGroupUniqueness(group: Group): Promise<{ isValid: boolean; error?: string }> {
    try {
      const existingGroups = await this.getAllGroups();
      
      // Check for duplicate codes
      const duplicateByCode = existingGroups.find(g => 
        g.id !== group.id && g.code === group.code
      );
      if (duplicateByCode) {
        return { 
          isValid: false, 
          error: `Group code "${group.code}" already exists` 
        };
      }
      
      // Group names can be duplicated - only codes must be unique
      
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: `Validation error: ${error}` 
      };
    }
  }

  // User uniqueness management (phone-based)
  static async addUserToRegistry(user: User): Promise<void> {
    try {
      const registryData = await AsyncStorage.getItem('user_registry');
      const registry: { [key: string]: { id: string; phoneNumber?: string; name: string; authMethod: string } } = 
        registryData ? JSON.parse(registryData) : {};
      
      registry[user.id] = {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        authMethod: user.authMethod
      };
      
      await AsyncStorage.setItem('user_registry', JSON.stringify(registry));
    } catch (error) {
      console.error('[STORAGE] Error updating user registry:', error);
    }
  }

  static async removeUserFromRegistry(userId: string): Promise<void> {
    try {
      const registryData = await AsyncStorage.getItem('user_registry');
      if (registryData) {
        const registry = JSON.parse(registryData);
        delete registry[userId];
        await AsyncStorage.setItem('user_registry', JSON.stringify(registry));
      }
    } catch (error) {
      console.error('[STORAGE] Error removing user from registry:', error);
    }
  }

  static async isUserPhoneUnique(phoneNumber: string, excludeUserId?: string): Promise<boolean> {
    try {
      if (!phoneNumber) return true; // No phone number means no conflict
      
      const registryData = await AsyncStorage.getItem('user_registry');
      if (!registryData) return true;
      
      const registry = JSON.parse(registryData);
      
      for (const userId in registry) {
        if (userId !== excludeUserId && 
            registry[userId].phoneNumber === phoneNumber) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('[STORAGE] Error checking phone uniqueness:', error);
      return true; // Default to allowing if error occurs
    }
  }

  static async getUserByPhone(phoneNumber: string): Promise<User | null> {
    try {
      if (!phoneNumber) return null;
      
      const registryData = await AsyncStorage.getItem('user_registry');
      if (!registryData) return null;
      
      const registry = JSON.parse(registryData);
      
      for (const userId in registry) {
        if (registry[userId].phoneNumber === phoneNumber) {
          // Try to get the full user data
          const userData = await AsyncStorage.getItem(`user_${userId}`);
          if (userData) {
            return User.fromJSON(JSON.parse(userData));
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('[STORAGE] Error finding user by phone:', error);
      return null;
    }
  }

  // Security validation
  static validateInput(input: string, maxLength: number = 255): string {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input: must be a non-empty string');
    }
    
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      throw new Error('Input cannot be empty');
    }
    
    if (trimmed.length > maxLength) {
      throw new Error(`Input too long: maximum ${maxLength} characters`);
    }
    
    // Basic XSS prevention
    const dangerous = /<script|javascript:|on\w+=/i;
    if (dangerous.test(trimmed)) {
      throw new Error('Input contains potentially dangerous content');
    }
    
    return trimmed;
  }

  static sanitizeEmail(email: string): string {
    return this.validateInput(email, 320).toLowerCase();
  }

  static sanitizeName(name: string): string {
    return this.validateInput(name, 100);
  }

  // User Preferences Management
  static async saveUserDefaultTimeRange(userId: string, startTime: number, endTime: number): Promise<void> {
    console.log('[STORAGE] Saving default time range for user:', userId, `${startTime}:00-${endTime}:00`);
    const key = `user_default_time_${userId}`;
    const timeRange = { startTime, endTime };
    await AsyncStorage.setItem(key, JSON.stringify(timeRange));
  }

  static async getUserDefaultTimeRange(userId: string): Promise<{ startTime: number; endTime: number } | null> {
    console.log('[STORAGE] Loading default time range for user:', userId);
    const key = `user_default_time_${userId}`;
    const data = await AsyncStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data);
  }

  static async removeUserDefaultTimeRange(userId: string): Promise<void> {
    console.log('[STORAGE] Removing default time range for user:', userId);
    const key = `user_default_time_${userId}`;
    await AsyncStorage.removeItem(key);
  }

  // Clear all data
  static async clearAll(): Promise<void> {
    console.log('[STORAGE] Clearing all data...');
    await AsyncStorage.clear();
  }
}