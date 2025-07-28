import AsyncStorage from '@react-native-async-storage/async-storage';
import { Team, MonthlyAvailability } from '../utils/types';

export const StorageKeys = {
  TEAMS: 'teams',
  MONTHLY_AVAILABILITY: 'monthlyAvailability',
  CURRENT_TEAM_ID: 'currentTeamId',
  CURRENT_USER_ID: 'currentUserId',
  CURRENT_USER: 'currentUser',
  LANGUAGE: 'language',
} as const;

export class StorageService {
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  static async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      return false;
    }
  }

  static async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  }

  static async multiRemove(keys: string[]): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Error removing multiple items:', error);
      return false;
    }
  }

  static async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Team management
  static async getTeams(): Promise<Team[]> {
    const teams = await this.getItem<Team[]>(StorageKeys.TEAMS);
    return teams || [];
  }

  static async saveTeams(teams: Team[]): Promise<boolean> {
    return this.setItem(StorageKeys.TEAMS, teams);
  }

  static async addTeam(team: Team): Promise<boolean> {
    const teams = await this.getTeams();
    teams.push(team);
    return this.saveTeams(teams);
  }

  static async updateTeam(teamId: string, updates: Partial<Team>): Promise<boolean> {
    const teams = await this.getTeams();
    const teamIndex = teams.findIndex(t => t.id === teamId);
    if (teamIndex >= 0) {
      teams[teamIndex] = { ...teams[teamIndex], ...updates, updatedAt: new Date().toISOString() };
      return this.saveTeams(teams);
    }
    return false;
  }

  static async deleteTeam(teamId: string): Promise<boolean> {
    const teams = await this.getTeams();
    const filteredTeams = teams.filter(t => t.id !== teamId);
    return this.saveTeams(filteredTeams);
  }

  static async getCurrentTeamId(): Promise<string | null> {
    return this.getItem<string>(StorageKeys.CURRENT_TEAM_ID);
  }

  static async setCurrentTeamId(teamId: string): Promise<boolean> {
    return this.setItem(StorageKeys.CURRENT_TEAM_ID, teamId);
  }

  // Availability management
  static async getMonthlyAvailability(): Promise<MonthlyAvailability[]> {
    const availability = await this.getItem<MonthlyAvailability[]>(StorageKeys.MONTHLY_AVAILABILITY);
    return availability || [];
  }

  static async saveMonthlyAvailability(availability: MonthlyAvailability[]): Promise<boolean> {
    return this.setItem(StorageKeys.MONTHLY_AVAILABILITY, availability);
  }

  static async addOrUpdateAvailability(newAvailability: MonthlyAvailability): Promise<boolean> {
    const allAvailability = await this.getMonthlyAvailability();
    const existingIndex = allAvailability.findIndex(
      a => a.teamId === newAvailability.teamId && 
           a.memberId === newAvailability.memberId && 
           a.month === newAvailability.month
    );

    if (existingIndex >= 0) {
      allAvailability[existingIndex] = newAvailability;
    } else {
      allAvailability.push(newAvailability);
    }

    return this.saveMonthlyAvailability(allAvailability);
  }

  static async getUserAvailability(teamId: string, memberId: string, month: string): Promise<MonthlyAvailability | null> {
    const allAvailability = await this.getMonthlyAvailability();
    return allAvailability.find(
      a => a.teamId === teamId && a.memberId === memberId && a.month === month
    ) || null;
  }

  // User management
  static async getCurrentUserId(): Promise<string | null> {
    return this.getItem<string>(StorageKeys.CURRENT_USER_ID);
  }

  static async setCurrentUserId(userId: string): Promise<boolean> {
    return this.setItem(StorageKeys.CURRENT_USER_ID, userId);
  }

  // Language management
  static async getLanguage(): Promise<string | null> {
    return this.getItem<string>(StorageKeys.LANGUAGE);
  }

  static async setLanguage(language: string): Promise<boolean> {
    return this.setItem(StorageKeys.LANGUAGE, language);
  }
}