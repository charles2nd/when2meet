export interface IUser {
  id: string;
  name: string;
  email: string;
  language: 'en' | 'fr';
  groupId?: string;
}

export class User implements IUser {
  id: string;
  name: string;
  email: string;
  language: 'en' | 'fr';
  groupId?: string;

  constructor(data: Partial<IUser>) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || 'Anonymous';
    this.email = data.email || 'user@example.com';
    this.language = data.language || 'en';
    this.groupId = data.groupId;
  }

  toJSON(): IUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      language: this.language,
      groupId: this.groupId
    };
  }

  static fromJSON(data: IUser): User {
    return new User(data);
  }
}