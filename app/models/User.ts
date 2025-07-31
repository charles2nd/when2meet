export interface IUser {
  id: string;
  name: string;
  email?: string; // Make optional for phone-only users
  phoneNumber?: string; // Add phone number field
  language: 'en' | 'fr';
  groupId?: string;
  authMethod: 'email' | 'phone' | 'google'; // Track auth method
  createdAt?: string;
  updatedAt?: string;
}

export class User implements IUser {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  language: 'en' | 'fr';
  groupId?: string;
  authMethod: 'email' | 'phone' | 'google';
  createdAt?: string;
  updatedAt?: string;

  constructor(data: Partial<IUser>) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || 'Anonymous';
    this.email = data.email;
    this.phoneNumber = data.phoneNumber;
    this.language = data.language || 'fr'; // French by default
    this.groupId = data.groupId;
    this.authMethod = data.authMethod || 'phone';
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
    
    // Validate based on auth method
    if (this.authMethod === 'phone') {
      if (!this.phoneNumber) {
        errors.push('Phone number is required');
      } else if (!this.validatePhoneNumber(this.phoneNumber)) {
        errors.push('Invalid phone number format');
      }
    } else if (this.authMethod === 'google') {
      // Google auth requires email
      if (!this.email) {
        errors.push('Email is required for Google authentication');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
          errors.push('Invalid email format for Google authentication');
        }
      }
    }
    // Note: Removed 'email' auth method validation since app is phone-only
    // Email field is optional for phone auth users
    
    // Language validation
    if (!['en', 'fr'].includes(this.language)) {
      errors.push('Language must be either "en" or "fr"');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Phone number validation method
  private validatePhoneNumber(phoneNumber: string): boolean {
    // International format validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Method to sanitize user input
  sanitize(): void {
    this.name = this.name.trim();
    if (this.email) {
      this.email = this.email.trim().toLowerCase();
    }
    if (this.phoneNumber) {
      this.phoneNumber = this.phoneNumber.trim();
    }
    this.updatedAt = new Date().toISOString();
  }

  // Method to check if user has valid permissions
  hasValidPermissions(): boolean {
    const validation = this.validate();
    if (!validation.isValid) return false;
    
    // Check for test/demo accounts
    if (this.phoneNumber === '+1234567890') return false; // Demo phone
    if (this.phoneNumber === '+11234567891') return false; // Test phone (should use real accounts in production)
    
    return true;
  }

  // Get primary identifier based on auth method
  getPrimaryIdentifier(): string {
    switch (this.authMethod) {
      case 'phone':
        return this.phoneNumber || 'Unknown';
      case 'email':
        return this.email || 'Unknown';
      case 'google':
        return this.email || 'Unknown';
      default:
        return 'Unknown';
    }
  }

  toJSON(): IUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
      language: this.language,
      groupId: this.groupId,
      authMethod: this.authMethod,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data: IUser): User {
    return new User(data);
  }
}