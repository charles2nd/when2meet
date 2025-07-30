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

  // Validation method
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Group name is required');
    }
    
    if (this.name && this.name.trim().length > 50) {
      errors.push('Group name must be 50 characters or less');
    }
    
    if (!this.code || this.code.length !== 6) {
      errors.push('Group code must be exactly 6 characters');
    }
    
    if (!this.adminId || this.adminId.trim().length === 0) {
      errors.push('Group must have an admin');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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

  // Helper method to ensure code is always uppercase
  setCode(code: string): void {
    this.code = code.toUpperCase();
  }

  // Helper method to ensure name is properly formatted
  setName(name: string): void {
    this.name = name.trim();
  }
}