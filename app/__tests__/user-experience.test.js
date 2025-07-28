import { StorageService } from '../services/storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('Complete User Experience Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle new user complete flow', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    
    // Mock no existing team (new user)
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    AsyncStorage.setItem.mockResolvedValue();

    // User logs in and has no team
    const teamId = await StorageService.getCurrentTeamId();
    expect(teamId).toBe(null);

    // User creates a team via FindGroupScreen quick join
    const newTeam = {
      id: 'team-quick-join-123',
      name: 'Team ABC',
      description: 'Team joined with code: ABC',
      members: [{
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'member',
        joinedAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save team
    const addResult = await StorageService.addTeam(newTeam);
    expect(addResult).toBe(true);

    // Set as current team
    const setResult = await StorageService.setCurrentTeamId(newTeam.id);
    expect(setResult).toBe(true);

    // User sets availability on calendar
    const availability = {
      id: 'team-quick-join-123-user-123-2024-01',
      teamId: 'team-quick-join-123',
      memberId: 'user-123',
      month: '2024-01',
      availability: {
        '2024-01-20-9': true,
        '2024-01-20-10': true,
        '2024-01-20-11': true,
        '2024-01-20-14': true,
        '2024-01-20-15': false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const availabilityResult = await StorageService.addOrUpdateAvailability(availability);
    expect(availabilityResult).toBe(true);
  });

  test('should handle returning user with team', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    
    const existingTeam = {
      id: 'existing-team-456',
      name: 'My Existing Team',
      description: 'User already has this team',
      members: [{
        id: 'user-456',
        name: 'Returning User',
        email: 'returning@example.com',
        role: 'member',
        joinedAt: '2024-01-01T00:00:00.000Z'
      }],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    // Mock existing team
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify('existing-team-456'));
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([existingTeam]));

    // User has existing team - should go directly to calendar
    const teamId = await StorageService.getCurrentTeamId();
    expect(teamId).toBe('existing-team-456');

    const teams = await StorageService.getTeams();
    expect(teams).toHaveLength(1);
    expect(teams[0].name).toBe('My Existing Team');
  });

  test('should handle availability updates', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    
    const initialAvailability = {
      id: 'team-1-user-1-2024-01',
      teamId: 'team-1',
      memberId: 'user-1',
      month: '2024-01',
      availability: {
        '2024-01-15-9': true,
        '2024-01-15-10': false
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    // Mock existing availability
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([initialAvailability]));
    AsyncStorage.setItem.mockResolvedValue();

    // Update availability
    const updatedAvailability = {
      ...initialAvailability,
      availability: {
        '2024-01-15-9': true,
        '2024-01-15-10': true, // Changed to true
        '2024-01-15-11': true  // Added new slot
      },
      updatedAt: new Date().toISOString()
    };

    const result = await StorageService.addOrUpdateAvailability(updatedAvailability);
    expect(result).toBe(true);
    
    // Verify it called setItem to save the updated availability
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'monthlyAvailability',
      expect.stringContaining('"2024-01-15-10":true')
    );
  });
});