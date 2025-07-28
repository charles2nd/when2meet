import { StorageService } from '../services/storage';
import { signInAsDemo } from '../services/firebase';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock firebase
jest.mock('../services/firebase', () => ({
  signInAsDemo: jest.fn(),
}));

describe('Authentication Flow with Database', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should complete full auth flow and store user data', async () => {
    const mockUser = {
      uid: 'demo-admin-uid',
      email: 'admin@admin.com',
      displayName: 'Admin',
      role: 'admin'
    };

    // Mock successful sign in
    signInAsDemo.mockResolvedValueOnce(mockUser);
    
    // Mock storage operations
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.setItem.mockResolvedValue();

    // Test sign in
    const user = await signInAsDemo('admin@admin.com', 'admin');
    expect(user).toEqual(mockUser);

    // Test setting user ID in storage
    const setUserResult = await StorageService.setCurrentUserId(user.uid);
    expect(setUserResult).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'currentUserId',
      JSON.stringify('demo-admin-uid')
    );
  });

  test('should handle team creation after auth', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValueOnce(null); // No existing teams
    AsyncStorage.setItem.mockResolvedValue();

    const newTeam = {
      id: 'team-test-123',
      name: 'Test Team',
      description: 'Test team created after auth',
      members: [{
        id: 'demo-admin-uid',
        name: 'Admin',
        email: 'admin@admin.com',
        role: 'member',
        joinedAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Test team creation
    const addTeamResult = await StorageService.addTeam(newTeam);
    expect(addTeamResult).toBe(true);

    // Test setting current team
    const setTeamResult = await StorageService.setCurrentTeamId(newTeam.id);
    expect(setTeamResult).toBe(true);
  });

  test('should save availability after team join', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValueOnce(null); // No existing availability
    AsyncStorage.setItem.mockResolvedValue();

    const availability = {
      id: 'team-test-123-demo-admin-uid-2024-01',
      teamId: 'team-test-123',
      memberId: 'demo-admin-uid',
      month: '2024-01',
      availability: {
        '2024-01-15-9': true,
        '2024-01-15-10': true,
        '2024-01-15-14': false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await StorageService.addOrUpdateAvailability(availability);
    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'monthlyAvailability',
      JSON.stringify([availability])
    );
  });
});