import AsyncStorage from '@react-native-async-storage/async-storage';
import { Team, ITeam } from '../models/Team';
import { TeamMember, ITeamMember } from '../models/TeamMember';
import { MonthlyAvailability, IMonthlyAvailability } from '../models/Availability';
import { logger } from '../utils/logger';

export const StorageKeys = {
  TEAMS: 'teams',
  MONTHLY_AVAILABILITY: 'monthlyAvailability',
  CURRENT_TEAM_ID: 'currentTeamId',
  CURRENT_USER_ID: 'currentUserId',
  CURRENT_USER: 'currentUser',
  LANGUAGE: 'language',
} as const;

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class TeamStorageService {
  private static async getItem<T>(key: string): Promise<StorageResult<T>> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item === null) {
        return { success: true, data: undefined };
      }
      
      const parsedData = JSON.parse(item);
      logger.storage.load(key, true);
      return { success: true, data: parsedData };
    } catch (error) {
      const errorMessage = `Failed to get item ${key}: ${error}`;
      logger.storage.error(key, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  private static async setItem<T>(key: string, value: T): Promise<StorageResult<void>> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      logger.storage.save(key, true);
      return { success: true };
    } catch (error) {
      const errorMessage = `Failed to set item ${key}: ${error}`;
      logger.storage.error(key, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  private static async removeItem(key: string): Promise<StorageResult<void>> {
    try {
      await AsyncStorage.removeItem(key);
      logger.storage.delete(key, true);
      return { success: true };
    } catch (error) {
      const errorMessage = `Failed to remove item ${key}: ${error}`;
      logger.storage.error(key, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Team Management
  static async getTeams(): Promise<StorageResult<Team[]>> {
    const result = await this.getItem<ITeam[]>(StorageKeys.TEAMS);
    
    if (!result.success) {
      return result as StorageResult<Team[]>;
    }

    try {
      const teams = (result.data || []).map(teamData => Team.fromJSON(teamData));
      return { success: true, data: teams };
    } catch (error) {
      const errorMessage = `Failed to parse teams: ${error}`;
      logger.storage.error('teams', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  static async saveTeams(teams: Team[]): Promise<StorageResult<void>> {
    try {
      const teamData = teams.map(team => team.toJSON());
      return await this.setItem(StorageKeys.TEAMS, teamData);
    } catch (error) {
      const errorMessage = `Failed to serialize teams: ${error}`;
      logger.storage.error('teams', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  static async createTeam(teamData: {
    name: string;
    description?: string;
    adminUser: {
      id: string;
      name: string;
      email: string;
    };
  }): Promise<StorageResult<Team>> {
    try {
      // Create admin member
      const adminMember = new TeamMember({
        id: teamData.adminUser.id,
        name: teamData.adminUser.name,
        email: teamData.adminUser.email,
        role: 'admin',
        joinedAt: new Date().toISOString(),
      });

      // Create team with admin member
      const team = new Team({
        name: teamData.name,
        description: teamData.description,
        members: [adminMember],
      });

      // Validate team
      if (!team.validate()) {
        return { success: false, error: 'Invalid team data' };
      }

      // Get existing teams
      const teamsResult = await this.getTeams();
      if (!teamsResult.success) {
        return { success: false, error: teamsResult.error };
      }

      const teams = teamsResult.data || [];
      
      // Check for duplicate team names
      const existingTeam = teams.find(t => t.name.toLowerCase() === team.name.toLowerCase());
      if (existingTeam) {
        return { success: false, error: 'Team name already exists' };
      }

      // Add new team
      teams.push(team);
      
      // Save teams
      const saveResult = await this.saveTeams(teams);
      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      // Set as current team
      await this.setCurrentTeamId(team.id);
      await this.setCurrentUserId(adminMember.id);

      logger.info('TEAM_CREATED', `Team created: ${team.name} (${team.id})`);
      return { success: true, data: team };

    } catch (error) {
      const errorMessage = `Failed to create team: ${error}`;
      logger.error('CREATE_TEAM', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  static async addTeam(team: Team): Promise<StorageResult<void>> {
    const teamsResult = await this.getTeams();
    if (!teamsResult.success) {
      return { success: false, error: teamsResult.error };
    }

    const teams = teamsResult.data || [];
    teams.push(team);
    
    return await this.saveTeams(teams);
  }

  static async updateTeam(teamId: string, updates: Partial<ITeam>): Promise<StorageResult<Team>> {
    const teamsResult = await this.getTeams();
    if (!teamsResult.success) {
      return { success: false, error: teamsResult.error };
    }

    const teams = teamsResult.data || [];
    const teamIndex = teams.findIndex(t => t.id === teamId);
    
    if (teamIndex === -1) {
      return { success: false, error: 'Team not found' };
    }

    try {
      const updatedTeamData = { ...teams[teamIndex].toJSON(), ...updates, updatedAt: new Date().toISOString() };
      const updatedTeam = Team.fromJSON(updatedTeamData);
      
      if (!updatedTeam.validate()) {
        return { success: false, error: 'Invalid team data after update' };
      }

      teams[teamIndex] = updatedTeam;
      
      const saveResult = await this.saveTeams(teams);
      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      return { success: true, data: updatedTeam };
    } catch (error) {
      return { success: false, error: `Failed to update team: ${error}` };
    }
  }

  static async deleteTeam(teamId: string): Promise<StorageResult<void>> {
    const teamsResult = await this.getTeams();
    if (!teamsResult.success) {
      return { success: false, error: teamsResult.error };
    }

    const teams = teamsResult.data || [];
    const filteredTeams = teams.filter(t => t.id !== teamId);
    
    return await this.saveTeams(filteredTeams);
  }

  static async getTeamById(teamId: string): Promise<StorageResult<Team>> {
    const teamsResult = await this.getTeams();
    if (!teamsResult.success) {
      return { success: false, error: teamsResult.error };
    }

    const teams = teamsResult.data || [];
    const team = teams.find(t => t.id === teamId);
    
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    return { success: true, data: team };
  }

  static async joinTeam(teamCode: string, user: { id: string; name: string; email: string }): Promise<StorageResult<Team>> {
    const teamsResult = await this.getTeams();
    if (!teamsResult.success) {
      return { success: false, error: teamsResult.error };
    }

    const teams = teamsResult.data || [];
    const team = teams.find(t => t.code === teamCode.toUpperCase());
    
    if (!team) {
      return { success: false, error: 'Invalid team code' };
    }

    try {
      const newMember = new TeamMember({
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'member',
      });

      team.addMember(newMember);
      
      const saveResult = await this.saveTeams(teams);
      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      await this.setCurrentTeamId(team.id);
      await this.setCurrentUserId(user.id);

      return { success: true, data: team };
    } catch (error) {
      return { success: false, error: `Failed to join team: ${error}` };
    }
  }

  // Current Team Management
  static async getCurrentTeamId(): Promise<StorageResult<string>> {
    return await this.getItem<string>(StorageKeys.CURRENT_TEAM_ID);
  }

  static async setCurrentTeamId(teamId: string): Promise<StorageResult<void>> {
    return await this.setItem(StorageKeys.CURRENT_TEAM_ID, teamId);
  }

  static async getCurrentTeam(): Promise<StorageResult<Team>> {
    const teamIdResult = await this.getCurrentTeamId();
    if (!teamIdResult.success || !teamIdResult.data) {
      return { success: false, error: 'No current team set' };
    }

    return await this.getTeamById(teamIdResult.data);
  }

  // User Management
  static async getCurrentUserId(): Promise<StorageResult<string>> {
    return await this.getItem<string>(StorageKeys.CURRENT_USER_ID);
  }

  static async setCurrentUserId(userId: string): Promise<StorageResult<void>> {
    return await this.setItem(StorageKeys.CURRENT_USER_ID, userId);
  }

  // Availability Management
  static async getMonthlyAvailability(): Promise<StorageResult<MonthlyAvailability[]>> {
    const result = await this.getItem<IMonthlyAvailability[]>(StorageKeys.MONTHLY_AVAILABILITY);
    
    if (!result.success) {
      return result as StorageResult<MonthlyAvailability[]>;
    }

    try {
      const availability = (result.data || []).map(data => MonthlyAvailability.fromJSON(data));
      return { success: true, data: availability };
    } catch (error) {
      return { success: false, error: `Failed to parse availability: ${error}` };
    }
  }

  static async saveMonthlyAvailability(availability: MonthlyAvailability[]): Promise<StorageResult<void>> {
    try {
      const availabilityData = availability.map(a => a.toJSON());
      return await this.setItem(StorageKeys.MONTHLY_AVAILABILITY, availabilityData);
    } catch (error) {
      return { success: false, error: `Failed to serialize availability: ${error}` };
    }
  }

  static async addOrUpdateAvailability(newAvailability: MonthlyAvailability): Promise<StorageResult<void>> {
    const availabilityResult = await this.getMonthlyAvailability();
    if (!availabilityResult.success) {
      return { success: false, error: availabilityResult.error };
    }

    const allAvailability = availabilityResult.data || [];
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

    return await this.saveMonthlyAvailability(allAvailability);
  }

  static async getUserAvailability(teamId: string, memberId: string, month: string): Promise<StorageResult<MonthlyAvailability>> {
    const availabilityResult = await this.getMonthlyAvailability();
    if (!availabilityResult.success) {
      return { success: false, error: availabilityResult.error };
    }

    const allAvailability = availabilityResult.data || [];
    const userAvailability = allAvailability.find(
      a => a.teamId === teamId && a.memberId === memberId && a.month === month
    );

    if (!userAvailability) {
      return { success: false, error: 'User availability not found' };
    }

    return { success: true, data: userAvailability };
  }

  // Language Management
  static async getLanguage(): Promise<StorageResult<string>> {
    return await this.getItem<string>(StorageKeys.LANGUAGE);
  }

  static async setLanguage(language: string): Promise<StorageResult<void>> {
    return await this.setItem(StorageKeys.LANGUAGE, language);
  }

  // Utility Methods
  static async clearAllData(): Promise<StorageResult<void>> {
    try {
      await AsyncStorage.clear();
      logger.info('STORAGE', 'All data cleared');
      return { success: true };
    } catch (error) {
      const errorMessage = `Failed to clear all data: ${error}`;
      logger.error('STORAGE', errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}