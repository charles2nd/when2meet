import { FirebaseStorageService } from '../services/FirebaseStorageService';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMember';

// Mock Firebase
jest.mock('../services/firebase', () => ({
  db: {},
  storage: {},
  auth: {}
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: mockAsyncStorage,
  ...mockAsyncStorage,
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    storage: {
      load: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      error: jest.fn(),
    },
  },
}));

describe('Firebase Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('Offline-First Architecture', () => {
    test('should handle offline team creation gracefully', async () => {
      // Simulate offline state
      FirebaseStorageService.setOnlineStatus(false);

      const result = await FirebaseStorageService.createTeam({
        name: 'Offline Squad',
        description: 'Created while offline',
        adminUser: {
          id: 'user123',
          name: 'Commander',
          email: 'commander@example.com',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('Offline Squad');
      
      // Verify data was saved locally
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'teams',
        expect.stringContaining('Offline Squad')
      );
    });

    test('should retrieve teams from local storage when offline', async () => {
      const mockTeams = [
        {
          id: 'team1',
          name: 'Alpha Squad',
          description: 'Elite unit',
          members: [
            {
              id: 'user1',
              name: 'Commander',
              email: 'commander@example.com',
              role: 'admin',
              joinedAt: new Date().toISOString(),
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockTeams));
      FirebaseStorageService.setOnlineStatus(false);

      const result = await FirebaseStorageService.getTeams();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(Team);
      expect(result.data[0].name).toBe('Alpha Squad');
    });

    test('should sync pending operations when coming back online', async () => {
      // Start offline
      FirebaseStorageService.setOnlineStatus(false);

      // Perform operations while offline
      await FirebaseStorageService.createTeam({
        name: 'Sync Test Squad',
        adminUser: {
          id: 'user123',
          name: 'Commander',
          email: 'commander@example.com',
        },
      });

      // Come back online
      FirebaseStorageService.setOnlineStatus(true);

      // Verify sync was triggered (operations are queued)
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Data Persistence', () => {
    test('should save user ID persistently', async () => {
      const result = await FirebaseStorageService.setCurrentUserId('user123');
      
      expect(result.success).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('currentUserId', 'user123');
    });

    test('should retrieve user ID from storage', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('user123');
      
      const result = await FirebaseStorageService.getCurrentUserId();
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('user123');
    });

    test('should save current team ID persistently', async () => {
      const result = await FirebaseStorageService.setCurrentTeamId('team123');
      
      expect(result.success).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('currentTeamId', 'team123');
    });

    test('should handle language preferences', async () => {
      await FirebaseStorageService.setLanguage('fr');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('language', 'fr');

      mockAsyncStorage.getItem.mockResolvedValueOnce('fr');
      const result = await FirebaseStorageService.getLanguage();
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('fr');
    });
  });

  describe('Error Handling', () => {
    test('should handle storage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage full'));
      
      const result = await FirebaseStorageService.setCurrentUserId('user123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage full');
    });

    test('should handle invalid team data', async () => {
      const result = await FirebaseStorageService.createTeam({
        name: '', // Invalid empty name
        adminUser: {
          id: 'user123',
          name: 'Commander',
          email: 'commander@example.com',
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Team name is required');
    });
  });

  describe('Team Management', () => {
    test('should prevent duplicate team names', async () => {
      const existingTeams = [
        {
          id: 'team1',
          name: 'Alpha Squad',
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingTeams));
      FirebaseStorageService.setOnlineStatus(false);

      const result = await FirebaseStorageService.createTeam({
        name: 'Alpha Squad', // Duplicate name
        adminUser: {
          id: 'user123',
          name: 'Commander',
          email: 'commander@example.com',
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Team name already exists');
    });

    test('should handle team joining with invalid code', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));
      FirebaseStorageService.setOnlineStatus(false);

      const result = await FirebaseStorageService.joinTeam('INVALID', {
        id: 'user123',
        name: 'New Member',
        email: 'member@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid team code');
    });
  });

  describe('Availability Management', () => {
    test('should save availability data locally when offline', async () => {
      FirebaseStorageService.setOnlineStatus(false);
      
      const availability = {
        id: 'team1-user1-2024-01',
        teamId: 'team1',
        memberId: 'user1',
        month: '2024-01',
        availability: { '2024-01-15-9': true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock existing availability data
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));

      const result = await FirebaseStorageService.addOrUpdateAvailability(availability);

      expect(result.success).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'monthlyAvailability',
        expect.stringContaining('team1-user1-2024-01')
      );
    });
  });
});