import { useState, useEffect, useCallback } from 'react';
import { Team, TeamMember, User } from '../utils/types';
import { TeamsService } from '../services/teams';

interface UseTeamProps {
  teamId: string;
}

interface UseTeamReturn {
  team: Team | null;
  members: TeamMember[];
  loading: boolean;
  error: string | null;
  addMember: (member: TeamMember) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  updateMemberRole: (userId: string, role: TeamMember['role']) => Promise<void>;
  refreshTeam: () => Promise<void>;
}

export const useTeam = ({ teamId }: UseTeamProps): UseTeamReturn => {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const teamData = await TeamsService.getTeam(teamId);
      if (teamData) {
        setTeam(teamData);
        setMembers(teamData.members);
      } else {
        setError('Team not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team');
      console.error('Error loading team:', err);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const addMember = useCallback(async (member: TeamMember) => {
    try {
      await TeamsService.addTeamMember(teamId, member);
      await loadTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
      throw err;
    }
  }, [teamId, loadTeam]);

  const removeMember = useCallback(async (userId: string) => {
    try {
      await TeamsService.removeTeamMember(teamId, userId);
      setMembers(prev => prev.filter(member => member.userId !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      throw err;
    }
  }, [teamId]);

  const updateMemberRole = useCallback(async (userId: string, role: TeamMember['role']) => {
    try {
      await TeamsService.updateTeamMemberRole(teamId, userId, role);
      setMembers(prev => prev.map(member => 
        member.userId === userId ? { ...member, role } : member
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
      throw err;
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) {
      loadTeam();
    }
  }, [teamId, loadTeam]);

  return {
    team,
    members,
    loading,
    error,
    addMember,
    removeMember,
    updateMemberRole,
    refreshTeam: loadTeam
  };
};

interface UseUserTeamsReturn {
  teams: Team[];
  loading: boolean;
  error: string | null;
  createTeam: (teamData: Omit<Team, 'id' | 'createdAt'>) => Promise<string>;
  joinTeamByInviteCode: (inviteCode: string, userId: string) => Promise<string | null>;
  refreshTeams: () => Promise<void>;
}

export const useUserTeams = (userId: string): UseUserTeamsReturn => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userTeams = await TeamsService.getUserTeams(userId);
      setTeams(userTeams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
      console.error('Error loading user teams:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createTeam = useCallback(async (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    try {
      const teamId = await TeamsService.createTeam(teamData);
      await loadTeams();
      return teamId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      throw err;
    }
  }, [loadTeams]);

  const joinTeamByInviteCode = useCallback(async (inviteCode: string, currentUserId: string) => {
    try {
      const teamId = await TeamsService.joinTeamByInviteCode(inviteCode, currentUserId);
      if (teamId) {
        await loadTeams();
      }
      return teamId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join team');
      throw err;
    }
  }, [loadTeams]);

  useEffect(() => {
    if (userId) {
      loadTeams();
    }
  }, [userId, loadTeams]);

  return {
    teams,
    loading,
    error,
    createTeam,
    joinTeamByInviteCode,
    refreshTeams: loadTeams
  };
};