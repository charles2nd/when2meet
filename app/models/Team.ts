import { TeamMember } from './TeamMember';

export interface ITeam {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
  code?: string; // Team join code
  maxMembers?: number;
}

export class Team implements ITeam {
  public id: string;
  public name: string;
  public description?: string;
  public members: TeamMember[];
  public createdAt: string;
  public updatedAt: string;
  public code?: string;
  public maxMembers?: number;

  constructor(data: Partial<ITeam>) {
    this.id = data.id || this.generateId();
    this.name = this.validateName(data.name || '');
    this.description = data.description || '';
    this.members = data.members || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.code = data.code || this.generateCode();
    this.maxMembers = data.maxMembers || 50;
  }

  private generateId(): string {
    return `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private validateName(name: string): string {
    if (!name || name.trim().length === 0) {
      throw new Error('Team name is required');
    }
    if (name.trim().length > 50) {
      throw new Error('Team name must be 50 characters or less');
    }
    return name.trim();
  }

  public addMember(member: TeamMember): boolean {
    if (this.members.length >= (this.maxMembers || 50)) {
      throw new Error('Team has reached maximum member limit');
    }
    
    const existingMember = this.members.find(m => m.id === member.id || m.email === member.email);
    if (existingMember) {
      throw new Error('Member already exists in team');
    }

    this.members.push(member);
    this.updatedAt = new Date().toISOString();
    return true;
  }

  public removeMember(memberId: string): boolean {
    const memberIndex = this.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      return false;
    }

    this.members.splice(memberIndex, 1);
    this.updatedAt = new Date().toISOString();
    return true;
  }

  public updateMember(memberId: string, updates: Partial<TeamMember>): boolean {
    const memberIndex = this.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      return false;
    }

    this.members[memberIndex] = { ...this.members[memberIndex], ...updates };
    this.updatedAt = new Date().toISOString();
    return true;
  }

  public getMemberCount(): number {
    return this.members.length;
  }

  public getAdmins(): TeamMember[] {
    return this.members.filter(m => m.role === 'admin');
  }

  public isAdmin(memberId: string): boolean {
    const member = this.members.find(m => m.id === memberId);
    return member?.role === 'admin' || false;
  }

  public updateInfo(name?: string, description?: string): void {
    if (name !== undefined) {
      this.name = this.validateName(name);
    }
    if (description !== undefined) {
      this.description = description;
    }
    this.updatedAt = new Date().toISOString();
  }

  public toJSON(): ITeam {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      members: this.members.map(m => m.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      code: this.code,
      maxMembers: this.maxMembers
    };
  }

  public static fromJSON(data: ITeam): Team {
    const team = new Team(data);
    team.members = data.members.map(memberData => TeamMember.fromJSON(memberData));
    return team;
  }

  public validate(): boolean {
    if (!this.id || !this.name || !this.createdAt) {
      return false;
    }
    if (this.members.length === 0) {
      return false;
    }
    return this.members.every(member => member.validate());
  }
}