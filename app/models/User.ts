export interface IUser {
  id: string;
  name: string;
  email: string;
  language: 'en' | 'fr';
  groupId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class User implements IUser {
  id: string;
  name: string;
  email: string;
  language: 'en' | 'fr';
  groupId?: string;
  createdAt?: string;
  updatedAt?: string;

  constructor(data: Partial<IUser>) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || 'Anonymous';
    this.email = data.email || 'user@example.com';
    this.language = data.language || 'fr'; // French by default
    this.groupId = data.groupId;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validation method for user data
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Name validation
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (this.name && this.name.trim().length > 100) {
      errors.push('Name must be 100 characters or less');
    }
    
    // Email validation
    if (!this.email || this.email.trim().length === 0) {
      errors.push('Email is required');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.email && !emailRegex.test(this.email)) {
      errors.push('Invalid email format');
    }
    
    // Language validation
    if (!['en', 'fr'].includes(this.language)) {
      errors.push('Language must be either "en" or "fr"');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Method to sanitize user input
  sanitize(): void {
    this.name = this.name.trim();
    this.email = this.email.trim().toLowerCase();
    this.updatedAt = new Date().toISOString();
  }

  // Method to check if user has valid permissions
  hasValidPermissions(): boolean {
    return this.validate().isValid && this.email !== 'user@example.com';
  }

  toJSON(): IUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      language: this.language,
      groupId: this.groupId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data: IUser): User {
    return new User(data);
  }
}