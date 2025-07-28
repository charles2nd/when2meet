export type MemberRole = 'member' | 'admin';

export interface ITeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
  lastActive?: string;
  avatar?: string;
}

export class TeamMember implements ITeamMember {
  public id: string;
  public name: string;
  public email: string;
  public role: MemberRole;
  public joinedAt: string;
  public lastActive?: string;
  public avatar?: string;

  constructor(data: Partial<ITeamMember>) {
    this.id = data.id || this.generateId();
    this.name = this.validateName(data.name || '');
    this.email = this.validateEmail(data.email || '');
    this.role = data.role || 'member';
    this.joinedAt = data.joinedAt || new Date().toISOString();
    this.lastActive = data.lastActive;
    this.avatar = data.avatar;
  }

  private generateId(): string {
    return `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateName(name: string): string {
    if (!name || name.trim().length === 0) {
      throw new Error('Member name is required');
    }
    if (name.trim().length > 100) {
      throw new Error('Member name must be 100 characters or less');
    }
    return name.trim();
  }

  private validateEmail(email: string): string {
    if (!email || email.trim().length === 0) {
      throw new Error('Member email is required');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Invalid email format');
    }
    
    return email.trim().toLowerCase();
  }

  public updateProfile(name?: string, email?: string): void {
    if (name !== undefined) {
      this.name = this.validateName(name);
    }
    if (email !== undefined) {
      this.email = this.validateEmail(email);
    }
    this.lastActive = new Date().toISOString();
  }

  public setRole(role: MemberRole): void {
    this.role = role;
    this.lastActive = new Date().toISOString();
  }

  public updateLastActive(): void {
    this.lastActive = new Date().toISOString();
  }

  public getInitials(): string {
    return this.name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substr(0, 2);
  }

  public isAdmin(): boolean {
    return this.role === 'admin';
  }

  public toJSON(): ITeamMember {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      joinedAt: this.joinedAt,
      lastActive: this.lastActive,
      avatar: this.avatar
    };
  }

  public static fromJSON(data: ITeamMember): TeamMember {
    return new TeamMember(data);
  }

  public validate(): boolean {
    try {
      this.validateName(this.name);
      this.validateEmail(this.email);
      return true;
    } catch {
      return false;
    }
  }
}