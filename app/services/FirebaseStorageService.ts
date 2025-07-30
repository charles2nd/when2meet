import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, storage } from './firebase';
import { Team, ITeam } from '../models/Team';
import { TeamMember, ITeamMember } from '../models/TeamMember';
import { MonthlyAvailability, IMonthlyAvailability } from '../models/Availability';
// Logger utility for consistent debugging
const logger = {
  info: (category: string, message: string, data?: any) => {
    console.log(`[${category}] ${message}`, data || '');
  },
  error: (category: string, message: string, error?: any) => {
    console.error(`[${category}] ${message}`, error || '');
  },
  storage: {
    load: (key: string, fromFirebase: boolean) => {
      console.log(`[STORAGE] Loading ${key} from ${fromFirebase ? 'Firebase' : 'AsyncStorage'}`);
    }
  }
};

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FirebaseConfig {
  useOfflineFirst: boolean;
  syncInterval: number;
  retryAttempts: number;
}

export class FirebaseStorageService {
  private static config: FirebaseConfig = {
    useOfflineFirst: true,
    syncInterval: 30000, // 30 seconds
    retryAttempts: 3
  };

  private static pendingOperations: Array<() => Promise<void>> = [];
  private static isOnline = true;

  // Network status handling
  static setOnlineStatus(online: boolean) {
    const wasOffline = !this.isOnline;
    this.isOnline = online;
    console.log('[FIREBASE_STORAGE] Network status changed:', online ? 'ONLINE' : 'OFFLINE');
    
    if (online && wasOffline) {
      console.log('[FIREBASE_STORAGE] Back online, syncing pending operations...');
      this.syncPendingOperations();
    }
  }

  private static async syncPendingOperations() {
    logger.info('FIREBASE', `Syncing ${this.pendingOperations.length} pending operations`);
    
    while (this.pendingOperations.length > 0) {
      const operation = this.pendingOperations.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          logger.error('FIREBASE', 'Failed to sync operation', error);
        }
      }
    }
  }

  private static async executeWithFallback<T>(
    firebaseOperation: () => Promise<T>,
    localFallback: () => Promise<T>,
    offlineOperation?: () => Promise<void>
  ): Promise<T> {
    try {
      if (this.isOnline) {
        return await firebaseOperation();
      }
    } catch (error) {
      logger.error('FIREBASE', 'Firebase operation failed, falling back to local', error);
      this.isOnline = false;
    }

    // Execute offline operation if provided
    if (offlineOperation) {
      this.pendingOperations.push(firebaseOperation);
    }

    return await localFallback();
  }

  // User Management
  static async getCurrentUserId(): Promise<StorageResult<string>> {
    return this.executeWithFallback(
      async () => {
        const userId = await AsyncStorage.getItem('currentUserId');
        return { success: true, data: userId || undefined };
      },
      async () => {
        const userId = await AsyncStorage.getItem('currentUserId');
        return { success: true, data: userId || undefined };
      }
    );
  }

  static async setCurrentUserId(userId: string): Promise<StorageResult<void>> {
    return this.executeWithFallback(
      async () => {
        await AsyncStorage.setItem('currentUserId', userId);
        return { success: true };
      },
      async () => {
        await AsyncStorage.setItem('currentUserId', userId);
        return { success: true };
      }
    );
  }

  // Team Management with Firebase
  static async getTeams(userId?: string): Promise<StorageResult<Team[]>> {
    return this.executeWithFallback(
      async () => {
        try {
          let teamsQuery;
          if (userId) {
            teamsQuery = query(
              collection(db, 'teams'),
              where('memberIds', 'array-contains', userId)
            );
          } else {
            teamsQuery = collection(db, 'teams');
          }

          const snapshot = await getDocs(teamsQuery);
          const teams = snapshot.docs.map(doc => {
            const data = doc.data() as ITeam;
            return Team.fromJSON({ ...data, id: doc.id });
          });

          // Cache locally
          await AsyncStorage.setItem('teams', JSON.stringify(teams.map(t => t.toJSON())));
          
          logger.storage.load('teams-firebase', true);
          return { success: true, data: teams };
        } catch (error) {
          throw error;
        }
      },
      async () => {
        const teamsData = await AsyncStorage.getItem('teams');
        if (teamsData) {
          const teams = JSON.parse(teamsData).map((t: ITeam) => Team.fromJSON(t));
          logger.storage.load('teams-local', true);
          return { success: true, data: teams };
        }
        return { success: true, data: [] };
      }
    );
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
    return this.executeWithFallback(
      async () => {
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

          // Check for duplicate team names
          const existingTeamsQuery = query(
            collection(db, 'teams'),
            where('name', '==', team.name)
          );
          const existingSnapshot = await getDocs(existingTeamsQuery);
          
          if (!existingSnapshot.empty) {
            return { success: false, error: 'Team name already exists' };
          }

          // Add team to Firestore
          const teamRef = doc(collection(db, 'teams'));
          const teamDataWithId = {
            ...team.toJSON(),
            id: teamRef.id,
            memberIds: [adminMember.id], // For efficient querying
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          await setDoc(teamRef, teamDataWithId);

          // Update local team object with Firestore ID
          team.id = teamRef.id;

          // Cache locally
          const localTeams = await this.getTeamsFromLocal();
          localTeams.push(team);
          await AsyncStorage.setItem('teams', JSON.stringify(localTeams.map(t => t.toJSON())));

          // Set as current team
          await this.setCurrentTeamId(team.id);
          await this.setCurrentUserId(adminMember.id);

          logger.info('FIREBASE_TEAM_CREATED', `Team created: ${team.name} (${team.id})`);
          return { success: true, data: team };

        } catch (error) {
          throw error;
        }
      },
      async () => {
        // Fallback to local storage
        const adminMember = new TeamMember({
          id: teamData.adminUser.id,
          name: teamData.adminUser.name,
          email: teamData.adminUser.email,
          role: 'admin',
          joinedAt: new Date().toISOString(),
        });

        const team = new Team({
          name: teamData.name,
          description: teamData.description,
          members: [adminMember],
        });

        const localTeams = await this.getTeamsFromLocal();
        
        // Check for duplicates locally
        const existingTeam = localTeams.find(t => t.name.toLowerCase() === team.name.toLowerCase());
        if (existingTeam) {
          return { success: false, error: 'Team name already exists' };
        }

        localTeams.push(team);
        await AsyncStorage.setItem('teams', JSON.stringify(localTeams.map(t => t.toJSON())));
        
        await this.setCurrentTeamId(team.id);
        await this.setCurrentUserId(adminMember.id);

        logger.info('LOCAL_TEAM_CREATED', `Team created locally: ${team.name}`);
        return { success: true, data: team };
      },
      async () => {
        // Queue for later sync
        logger.info('FIREBASE', 'Team creation queued for sync');
      }
    );
  }

  static async updateTeam(teamId: string, updates: Partial<ITeam>): Promise<StorageResult<Team>> {
    return this.executeWithFallback(
      async () => {
        try {
          const teamRef = doc(db, 'teams', teamId);
          const updateData = {
            ...updates,
            updatedAt: serverTimestamp()
          };

          await updateDoc(teamRef, updateData);

          // Get updated team
          const updatedDoc = await getDoc(teamRef);
          if (!updatedDoc.exists()) {
            return { success: false, error: 'Team not found' };
          }

          const updatedTeam = Team.fromJSON({ 
            ...updatedDoc.data() as ITeam, 
            id: updatedDoc.id 
          });

          // Update local cache
          await this.updateTeamInLocal(teamId, updatedTeam);

          logger.info('FIREBASE_TEAM_UPDATED', `Team updated: ${teamId}`);
          return { success: true, data: updatedTeam };

        } catch (error) {
          throw error;
        }
      },
      async () => {
        // Fallback to local update
        const localTeams = await this.getTeamsFromLocal();
        const teamIndex = localTeams.findIndex(t => t.id === teamId);
        
        if (teamIndex === -1) {
          return { success: false, error: 'Team not found' };
        }

        const updatedTeamData = { 
          ...localTeams[teamIndex].toJSON(), 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        const updatedTeam = Team.fromJSON(updatedTeamData);
        
        localTeams[teamIndex] = updatedTeam;
        await AsyncStorage.setItem('teams', JSON.stringify(localTeams.map(t => t.toJSON())));

        return { success: true, data: updatedTeam };
      }
    );
  }

  static async joinTeam(teamCode: string, user: { id: string; name: string; email: string }): Promise<StorageResult<Team>> {
    return this.executeWithFallback(
      async () => {
        try {
          const teamsQuery = query(
            collection(db, 'teams'),
            where('code', '==', teamCode.toUpperCase())
          );
          const snapshot = await getDocs(teamsQuery);
          
          if (snapshot.empty) {
            return { success: false, error: 'Invalid team code' };
          }

          const teamDoc = snapshot.docs[0];
          const teamData = teamDoc.data() as ITeam;
          const team = Team.fromJSON({ ...teamData, id: teamDoc.id });

          const newMember = new TeamMember({
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'member',
          });

          team.addMember(newMember);

          // Update Firestore
          await updateDoc(teamDoc.ref, {
            members: team.members.map(m => m.toJSON()),
            memberIds: team.members.map(m => m.id),
            updatedAt: serverTimestamp()
          });

          // Update local cache
          await this.updateTeamInLocal(team.id, team);
          await this.setCurrentTeamId(team.id);
          await this.setCurrentUserId(user.id);

          logger.info('FIREBASE_TEAM_JOINED', `User joined team: ${team.name}`);
          return { success: true, data: team };

        } catch (error) {
          if (error.message === 'Member already exists in team') {
            return { success: false, error: error.message };
          }
          throw error;
        }
      },
      async () => {
        // Fallback to local operation
        const localTeams = await this.getTeamsFromLocal();
        const team = localTeams.find(t => t.code === teamCode.toUpperCase());
        
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
          
          await this.updateTeamInLocal(team.id, team);
          await this.setCurrentTeamId(team.id);
          await this.setCurrentUserId(user.id);

          return { success: true, data: team };
        } catch (error) {
          return { success: false, error: `Failed to join team: ${error}` };
        }
      }
    );
  }

  static async getCurrentTeamId(): Promise<StorageResult<string>> {
    const result = await AsyncStorage.getItem('currentTeamId');
    return { success: true, data: result || undefined };
  }

  static async setCurrentTeamId(teamId: string): Promise<StorageResult<void>> {
    await AsyncStorage.setItem('currentTeamId', teamId);
    return { success: true };
  }

  static async getCurrentTeam(): Promise<StorageResult<Team>> {
    try {
      const teamIdResult = await this.getCurrentTeamId();
      if (!teamIdResult.success || !teamIdResult.data) {
        return { success: false, error: 'No current team set' };
      }

      return this.executeWithFallback(
        async () => {
          const teamDoc = await getDoc(doc(db, 'teams', teamIdResult.data!));
          if (!teamDoc.exists()) {
            return { success: false, error: 'Team not found' };
          }

          const team = Team.fromJSON({ 
            ...teamDoc.data() as ITeam, 
            id: teamDoc.id 
          });

          // Cache locally
          await this.updateTeamInLocal(team.id, team);

          return { success: true, data: team };
        },
        async () => {
          const localTeams = await this.getTeamsFromLocal();
          const team = localTeams.find(t => t.id === teamIdResult.data);
          
          if (!team) {
            return { success: false, error: 'Team not found locally' };
          }

          return { success: true, data: team };
        }
      );
    } catch (error) {
      return { success: false, error: `Failed to get current team: ${error}` };
    }
  }

  // Availability Management
  static async addOrUpdateAvailability(availability: MonthlyAvailability): Promise<StorageResult<void>> {
    return this.executeWithFallback(
      async () => {
        try {
          const availabilityRef = doc(db, 'availability', availability.id);
          const availabilityData = {
            ...availability.toJSON(),
            updatedAt: serverTimestamp()
          };

          await setDoc(availabilityRef, availabilityData);

          // Update local cache
          await this.updateAvailabilityInLocal(availability);

          logger.info('FIREBASE_AVAILABILITY_SAVED', `Availability saved: ${availability.id}`);
          return { success: true };

        } catch (error) {
          throw error;
        }
      },
      async () => {
        // Fallback to local storage
        await this.updateAvailabilityInLocal(availability);
        return { success: true };
      }
    );
  }

  static async getUserAvailability(teamId: string, memberId: string, month: string): Promise<StorageResult<MonthlyAvailability>> {
    const availabilityId = `${teamId}-${memberId}-${month}`;
    
    return this.executeWithFallback(
      async () => {
        try {
          const availabilityDoc = await getDoc(doc(db, 'availability', availabilityId));
          
          if (!availabilityDoc.exists()) {
            return { success: false, error: 'Availability not found' };
          }

          const availability = MonthlyAvailability.fromJSON({
            ...availabilityDoc.data() as IMonthlyAvailability,
            id: availabilityDoc.id
          });

          // Cache locally
          await this.updateAvailabilityInLocal(availability);

          return { success: true, data: availability };

        } catch (error) {
          throw error;
        }
      },
      async () => {
        // Fallback to local storage
        const localAvailability = await this.getAvailabilityFromLocal();
        const availability = localAvailability.find(a => a.id === availabilityId);
        
        if (!availability) {
          return { success: false, error: 'Availability not found locally' };
        }

        return { success: true, data: availability };
      }
    );
  }

  // Language Management
  static async getLanguage(): Promise<StorageResult<string>> {
    const language = await AsyncStorage.getItem('language');
    return { success: true, data: language || undefined };
  }

  static async setLanguage(language: string): Promise<StorageResult<void>> {
    await AsyncStorage.setItem('language', language);
    return { success: true };
  }

  // Real-time subscriptions
  static subscribeToTeam(teamId: string, callback: (team: Team | null) => void): () => void {
    if (!this.isOnline) {
      // Return local data immediately
      this.getCurrentTeam().then(result => {
        callback(result.success ? result.data! : null);
      });
      return () => {}; // No-op unsubscribe
    }

    const unsubscribe = onSnapshot(
      doc(db, 'teams', teamId),
      { includeMetadataChanges: true },
      (doc) => {
        console.log('[FIREBASE_SUBSCRIPTION] Team data received, from cache:', doc.metadata.fromCache);
        if (doc.exists()) {
          const team = Team.fromJSON({ 
            ...doc.data() as ITeam, 
            id: doc.id 
          });
          
          // Update local cache
          this.updateTeamInLocal(team.id, team);
          callback(team);
        } else {
          callback(null);
        }
      },
      (error) => {
        logger.error('FIREBASE_SUBSCRIPTION', 'Team subscription error', error);
        this.isOnline = false;
        // Fallback to local data
        this.getCurrentTeam().then(result => {
          callback(result.success ? result.data! : null);
        });
      }
    );

    return unsubscribe;
  }

  // Helper methods for local storage
  private static async getTeamsFromLocal(): Promise<Team[]> {
    try {
      const teamsData = await AsyncStorage.getItem('teams');
      if (teamsData) {
        return JSON.parse(teamsData).map((t: ITeam) => Team.fromJSON(t));
      }
      return [];
    } catch (error) {
      logger.error('LOCAL_STORAGE', 'Failed to get teams from local', error);
      return [];
    }
  }

  private static async updateTeamInLocal(teamId: string, team: Team): Promise<void> {
    try {
      const localTeams = await this.getTeamsFromLocal();
      const teamIndex = localTeams.findIndex(t => t.id === teamId);
      
      if (teamIndex >= 0) {
        localTeams[teamIndex] = team;
      } else {
        localTeams.push(team);
      }
      
      await AsyncStorage.setItem('teams', JSON.stringify(localTeams.map(t => t.toJSON())));
    } catch (error) {
      logger.error('LOCAL_STORAGE', 'Failed to update team in local', error);
    }
  }

  private static async getAvailabilityFromLocal(): Promise<MonthlyAvailability[]> {
    try {
      const availabilityData = await AsyncStorage.getItem('monthlyAvailability');
      if (availabilityData) {
        return JSON.parse(availabilityData).map((a: IMonthlyAvailability) => MonthlyAvailability.fromJSON(a));
      }
      return [];
    } catch (error) {
      logger.error('LOCAL_STORAGE', 'Failed to get availability from local', error);
      return [];
    }
  }

  private static async updateAvailabilityInLocal(availability: MonthlyAvailability): Promise<void> {
    try {
      const localAvailability = await this.getAvailabilityFromLocal();
      const existingIndex = localAvailability.findIndex(a => a.id === availability.id);
      
      if (existingIndex >= 0) {
        localAvailability[existingIndex] = availability;
      } else {
        localAvailability.push(availability);
      }
      
      await AsyncStorage.setItem('monthlyAvailability', JSON.stringify(localAvailability.map(a => a.toJSON())));
    } catch (error) {
      logger.error('LOCAL_STORAGE', 'Failed to update availability in local', error);
    }
  }

  // Utility Methods
  static async clearAllData(): Promise<StorageResult<void>> {
    try {
      await AsyncStorage.clear();
      logger.info('STORAGE', 'All local data cleared');
      return { success: true };
    } catch (error) {
      const errorMessage = `Failed to clear all data: ${error}`;
      logger.error('STORAGE', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  static async forceSyncWithFirebase(): Promise<StorageResult<void>> {
    try {
      this.isOnline = true;
      await this.syncPendingOperations();
      
      // Sync teams
      const teamsResult = await this.getTeams();
      if (!teamsResult.success) {
        throw new Error(teamsResult.error);
      }

      logger.info('FIREBASE', 'Force sync completed successfully');
      return { success: true };
    } catch (error) {
      logger.error('FIREBASE', 'Force sync failed', error);
      return { success: false, error: `Sync failed: ${error}` };
    }
  }

  // Load user data on app initialization
  static async loadUserData(userId: string): Promise<void> {
    console.log('[FIREBASE_STORAGE] Loading user data for:', userId);
    
    try {
      // Load user's teams
      const teamsResult = await this.getTeams(userId);
      if (teamsResult.success && teamsResult.data) {
        console.log('[FIREBASE_STORAGE] Loaded', teamsResult.data.length, 'teams from storage');
        
        // Cache teams locally
        await AsyncStorage.setItem('teams', JSON.stringify(teamsResult.data.map(team => team.toJSON())));
        
        // If user has teams, set the first one as current
        if (teamsResult.data.length > 0) {
          await AsyncStorage.setItem('currentTeamId', teamsResult.data[0].id);
          console.log('[FIREBASE_STORAGE] Set current team:', teamsResult.data[0].name);
        }
      }
      
      // Load user's availability data
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
      for (const team of teamsResult.data || []) {
        const availabilityResult = await this.getAvailability(team.id, userId, currentMonth);
        if (availabilityResult.success && availabilityResult.data) {
          console.log('[FIREBASE_STORAGE] Loaded availability for team:', team.name);
        }
      }
      
      console.log('[FIREBASE_STORAGE] User data loading complete');
    } catch (error) {
      console.error('[FIREBASE_STORAGE] Error loading user data:', error);
    }
  }
}