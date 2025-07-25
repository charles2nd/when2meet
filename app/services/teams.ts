import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { Team, TeamMember, User } from '../utils/types';

const TEAMS_COLLECTION = 'teams';
const USERS_COLLECTION = 'users';

export class TeamsService {
  static async createTeam(teamData: Omit<Team, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, TEAMS_COLLECTION), {
      ...teamData,
      createdAt: new Date(),
      inviteCode: this.generateInviteCode()
    });
    return docRef.id;
  }

  static async getTeam(teamId: string): Promise<Team | null> {
    const docRef = doc(db, TEAMS_COLLECTION, teamId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Team;
    }
    return null;
  }

  static async getUserTeams(userId: string): Promise<Team[]> {
    const q = query(
      collection(db, TEAMS_COLLECTION),
      where('members', 'array-contains-any', [{ userId }])
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Team[];
  }

  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const team = await this.getTeam(teamId);
    return team?.members || [];
  }

  static async addTeamMember(teamId: string, member: TeamMember): Promise<void> {
    const teamRef = doc(db, TEAMS_COLLECTION, teamId);
    await updateDoc(teamRef, {
      members: arrayUnion(member)
    });
  }

  static async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) return;

    const memberToRemove = team.members.find(member => member.userId === userId);
    if (!memberToRemove) return;

    const teamRef = doc(db, TEAMS_COLLECTION, teamId);
    await updateDoc(teamRef, {
      members: arrayRemove(memberToRemove)
    });
  }

  static async updateTeamMemberRole(teamId: string, userId: string, role: TeamMember['role']): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) return;

    const updatedMembers = team.members.map(member => 
      member.userId === userId ? { ...member, role } : member
    );

    const teamRef = doc(db, TEAMS_COLLECTION, teamId);
    await updateDoc(teamRef, {
      members: updatedMembers
    });
  }

  static async getUser(userId: string): Promise<User | null> {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  }

  private static generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  static async joinTeamByInviteCode(inviteCode: string, userId: string): Promise<string | null> {
    const q = query(
      collection(db, TEAMS_COLLECTION),
      where('inviteCode', '==', inviteCode)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const teamDoc = querySnapshot.docs[0];
    const team = { id: teamDoc.id, ...teamDoc.data() } as Team;
    
    const user = await this.getUser(userId);
    if (!user) return null;

    const newMember: TeamMember = {
      userId: user.id,
      username: user.username,
      role: 'Player',
      joinedAt: new Date(),
      permissions: []
    };

    await this.addTeamMember(team.id, newMember);
    return team.id;
  }
}