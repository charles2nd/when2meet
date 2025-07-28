export interface IGroup {
  id: string;
  name: string;
  code: string;
  members: string[]; // User IDs
  adminId: string; // Admin user ID
  createdAt: string;
}

export class Group implements IGroup {
  id: string;
  name: string;
  code: string;
  members: string[];
  adminId: string;
  createdAt: string;

  constructor(data: Partial<IGroup>) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || 'New Group';
    this.code = data.code || this.generateCode();
    this.members = data.members || [];
    this.adminId = data.adminId || '';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  private generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  addMember(userId: string): void {
    if (!this.members.includes(userId)) {
      this.members.push(userId);
    }
  }

  removeMember(userId: string): void {
    this.members = this.members.filter(id => id !== userId);
  }

  transferAdmin(newAdminId: string): boolean {
    if (!this.members.includes(newAdminId)) {
      return false; // New admin must be a member
    }
    this.adminId = newAdminId;
    return true;
  }

  isAdmin(userId: string): boolean {
    return this.adminId === userId;
  }

  toJSON(): IGroup {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      members: this.members,
      adminId: this.adminId,
      createdAt: this.createdAt
    };
  }

  static fromJSON(data: IGroup): Group {
    return new Group(data);
  }
}