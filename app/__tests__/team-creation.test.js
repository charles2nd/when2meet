import { TeamStorageService } from '../services/TeamStorageService';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMember';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  multiRemove: jest.fn(),
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

describe('Team Creation with OOP Models', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Default return empty arrays
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('Team Model', () => {
    test('should create a valid team with proper data', () => {
      const teamData = {
        name: 'Alpha Squad',
        description: 'Elite tactical unit',
      };

      const team = new Team(teamData);

      expect(team.name).toBe('Alpha Squad');
      expect(team.description).toBe('Elite tactical unit');
      expect(team.id).toBeDefined();
      expect(team.code).toBeDefined();
      expect(team.code).toHaveLength(8);
      expect(team.members).toEqual([]);
      expect(team.maxMembers).toBe(50);
    });

    test('should validate team name requirements', () => {
      expect(() => new Team({ name: '' })).toThrow('Team name is required');
      expect(() => new Team({ name: '   ' })).toThrow('Team name is required');
      expect(() => new Team({ name: 'A'.repeat(51) })).toThrow('Team name must be 50 characters or less');
    });

    test('should add and manage team members', () => {
      const team = new Team({ name: 'Test Squad' });
      
      const member = new TeamMember({
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'member',
      });

      expect(team.addMember(member)).toBe(true);
      expect(team.getMemberCount()).toBe(1);
      expect(team.members[0]).toBe(member);
    });

    test('should prevent duplicate members', () => {
      const team = new Team({ name: 'Test Squad' });
      
      const member1 = new TeamMember({
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
      });

      const member2 = new TeamMember({
        id: 'user1',
        name: 'John Smith',
        email: 'john@example.com',
      });

      team.addMember(member1);
      expect(() => team.addMember(member2)).toThrow('Member already exists in team');
    });

    test('should serialize and deserialize properly', () => {
      const team = new Team({
        name: 'Alpha Squad',
        description: 'Elite unit',
      });

      const member = new TeamMember({
        id: 'user1',
        name: 'Commander',
        email: 'commander@example.com',
        role: 'admin',
      });

      team.addMember(member);

      const serialized = team.toJSON();
      const deserialized = Team.fromJSON(serialized);

      expect(deserialized.name).toBe(team.name);
      expect(deserialized.description).toBe(team.description);
      expect(deserialized.id).toBe(team.id);
      expect(deserialized.members).toHaveLength(1);
      expect(deserialized.members[0].name).toBe('Commander');
    });
  });

  describe('TeamMember Model', () => {
    test('should create a valid team member', () => {
      const member = new TeamMember({
        id: 'user1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin',
      });

      expect(member.name).toBe('John Doe');
      expect(member.email).toBe('john.doe@example.com');
      expect(member.role).toBe('admin');
      expect(member.isAdmin()).toBe(true);
      expect(member.getInitials()).toBe('JD');
    });

    test('should validate email format', () => {
      expect(() => new TeamMember({
        name: 'John Doe',
        email: 'invalid-email',
      })).toThrow('Invalid email format');

      expect(() => new TeamMember({
        name: 'John Doe',
        email: '',
      })).toThrow('Member email is required');
    });

    test('should generate proper initials', () => {
      const member1 = new TeamMember({
        name: 'John Doe',
        email: 'john@example.com',
      });

      const member2 = new TeamMember({
        name: 'Mary Elizabeth Smith',
        email: 'mary@example.com',
      });

      expect(member1.getInitials()).toBe('JD');
      expect(member2.getInitials()).toBe('ME');
    });
  });

  describe('TeamStorageService', () => {
    test('should create team successfully', async () => {
      // Mock empty teams initially
      mockAsyncStorage.getItem.mockResolvedValueOnce(null); // teams
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await TeamStorageService.createTeam({
        name: 'Alpha Squad',
        description: 'Elite tactical unit',
        adminUser: {
          id: 'user123',
          name: 'Commander Smith',
          email: 'commander@example.com',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('Alpha Squad');
      expect(result.data.members).toHaveLength(1);
      expect(result.data.members[0].role).toBe('admin');
      expect(result.data.code).toBeDefined();

      // Verify storage calls
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'teams',
        expect.stringContaining('Alpha Squad')
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'currentTeamId',
        expect.any(String)
      );
    });

    test('should prevent duplicate team names', async () => {
      // Mock existing team
      const existingTeams = [
        {
          id: 'team1',
          name: 'Alpha Squad',
          description: 'Existing team',
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingTeams));

      const result = await TeamStorageService.createTeam({
        name: 'Alpha Squad',
        description: 'New team',
        adminUser: {
          id: 'user123',
          name: 'Commander',
          email: 'commander@example.com',
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Team name already exists');
    });

    test('should join team with valid code', async () => {
      // Mock existing teams
      const existingTeams = [
        {
          id: 'team1',
          name: 'Alpha Squad',
          description: 'Elite squad',
          members: [
            {
              id: 'admin1',
              name: 'Commander',
              email: 'commander@example.com',
              role: 'admin',
              joinedAt: new Date().toISOString(),
            },
          ],
          code: 'ABC12345',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingTeams));
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await TeamStorageService.joinTeam('ABC12345', {
        id: 'user123',
        name: 'New Member',
        email: 'member@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.members).toHaveLength(2);
      expect(result.data.members[1].name).toBe('New Member');
      expect(result.data.members[1].role).toBe('member');
    });

    test('should handle invalid team code', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));

      const result = await TeamStorageService.joinTeam('INVALID', {
        id: 'user123',
        name: 'New Member',
        email: 'member@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid team code');
    });

    test('should retrieve teams correctly', async () => {
      const teamsData = [
        {
          id: 'team1',
          name: 'Alpha Squad',
          description: 'Elite squad',
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(teamsData));

      const result = await TeamStorageService.getTeams();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(Team);
      expect(result.data[0].name).toBe('Alpha Squad');
    });
  });

  describe('Integration Tests', () => {
    test('should complete full team creation workflow', async () => {
      // Start with empty storage
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      // Step 1: Create team
      const createResult = await TeamStorageService.createTeam({
        name: 'Alpha Squad',
        description: 'Elite tactical unit',
        adminUser: {
          id: 'commander1',
          name: 'Commander Smith',
          email: 'commander@example.com',
        },
      });

      expect(createResult.success).toBe(true);
      const team = createResult.data;
      expect(team.validate()).toBe(true);

      // Step 2: Mock team retrieval
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([team.toJSON()]));

      // Step 3: Add member to team
      const joinResult = await TeamStorageService.joinTeam(team.code, {
        id: 'member1',
        name: 'Operator Jones',
        email: 'jones@example.com',
      });

      expect(joinResult.success).toBe(true);
      expect(joinResult.data.members).toHaveLength(2);

      // Verify team composition
      const finalTeam = joinResult.data;
      expect(finalTeam.getAdmins()).toHaveLength(1);
      expect(finalTeam.isAdmin('commander1')).toBe(true);
      expect(finalTeam.isAdmin('member1')).toBe(false);
    });
  });
});