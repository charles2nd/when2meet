import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, IUser } from '../models/User';
import { Group, IGroup } from '../models/Group';
import { Availability, IAvailability } from '../models/SimpleAvailability';

export class LocalStorage {
  // User Management
  static async saveUser(user: User): Promise<void> {
    console.log('[STORAGE] Saving user:', user.id);
    await AsyncStorage.setItem('current_user', JSON.stringify(user.toJSON()));
  }

  static async getUser(): Promise<User | null> {
    console.log('[STORAGE] Loading user...');
    const data = await AsyncStorage.getItem('current_user');
    if (!data) return null;
    return User.fromJSON(JSON.parse(data));
  }

  static async clearUser(): Promise<void> {
    console.log('[STORAGE] Clearing user...');
    await AsyncStorage.removeItem('current_user');
  }

  // Group Management
  static async saveGroup(group: Group): Promise<void> {
    console.log('[STORAGE] Saving group:', group.id);
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

  static async findGroupByCode(code: string): Promise<Group | null> {
    console.log('[STORAGE] Finding group by code:', code);
    const groups = await this.getAllGroups();
    return groups.find(g => g.code === code) || null;
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

  // Clear all data
  static async clearAll(): Promise<void> {
    console.log('[STORAGE] Clearing all data...');
    await AsyncStorage.clear();
  }
}