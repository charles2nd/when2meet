import { StorageService } from '../services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
}));

describe('StorageService Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Team Management', () => {
    const mockTeam = {
      id: 'test-team-1',
      name: 'Test Team',
      description: 'Test Description',
      members: [
        {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'member',
          joinedAt: '2024-01-01T00:00:00.000Z',
        }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    test('should save and retrieve teams correctly', async () => {
      // Mock empty teams initially
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      AsyncStorage.setItem.mockResolvedValueOnce();

      // Add team
      const result = await StorageService.addTeam(mockTeam);
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'teams',
        JSON.stringify([mockTeam])
      );
    });

    test('should set current team ID', async () => {
      AsyncStorage.setItem.mockResolvedValueOnce();

      const result = await StorageService.setCurrentTeamId('test-team-1');
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'currentTeamId',
        JSON.stringify('test-team-1')
      );
    });

    test('should get current team ID', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify('test-team-1'));

      const result = await StorageService.getCurrentTeamId();
      expect(result).toBe('test-team-1');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('currentTeamId');
    });

    test('should update team correctly', async () => {
      const existingTeams = [mockTeam];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingTeams));
      AsyncStorage.setItem.mockResolvedValueOnce();

      const updates = { name: 'Updated Team Name' };
      const result = await StorageService.updateTeam('test-team-1', updates);
      
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'teams',
        expect.stringContaining('Updated Team Name')
      );
    });
  });

  describe('Availability Management', () => {
    const mockAvailability = {
      id: 'team-1-user-1-2024-01',
      teamId: 'team-1',
      memberId: 'user-1',
      month: '2024-01',
      availability: {
        '2024-01-15-9': true,
        '2024-01-15-10': true,
        '2024-01-15-11': false,
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    test('should save availability correctly', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      AsyncStorage.setItem.mockResolvedValueOnce();

      const result = await StorageService.addOrUpdateAvailability(mockAvailability);
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'monthlyAvailability',
        JSON.stringify([mockAvailability])
      );
    });

    test('should update existing availability', async () => {
      const existingAvailability = [mockAvailability];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingAvailability));
      AsyncStorage.setItem.mockResolvedValueOnce();

      const updatedAvailability = {
        ...mockAvailability,
        availability: { '2024-01-15-9': false }
      };

      const result = await StorageService.addOrUpdateAvailability(updatedAvailability);
      expect(result).toBe(true);
    });

    test('should retrieve user availability', async () => {
      const availabilityList = [mockAvailability];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(availabilityList));

      const result = await StorageService.getUserAvailability('team-1', 'user-1', '2024-01');
      expect(result).toEqual(mockAvailability);
    });
  });

  describe('User Management', () => {
    test('should set and get current user ID', async () => {
      AsyncStorage.setItem.mockResolvedValueOnce();
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify('user-123'));

      // Set user ID
      const setResult = await StorageService.setCurrentUserId('user-123');
      expect(setResult).toBe(true);

      // Get user ID
      const getResult = await StorageService.getCurrentUserId();
      expect(getResult).toBe('user-123');
    });
  });

  describe('Language Management', () => {
    test('should set and get language preference', async () => {
      AsyncStorage.setItem.mockResolvedValueOnce();
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify('fr'));

      // Set language
      const setResult = await StorageService.setLanguage('fr');
      expect(setResult).toBe(true);

      // Get language
      const getResult = await StorageService.getLanguage();
      expect(getResult).toBe('fr');
    });
  });

  describe('Error Handling', () => {
    test('should handle storage errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const result = await StorageService.getCurrentTeamId();
      expect(result).toBe(null);
    });

    test('should handle save errors gracefully', async () => {
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

      const result = await StorageService.setCurrentTeamId('test-id');
      expect(result).toBe(false);
    });
  });
});