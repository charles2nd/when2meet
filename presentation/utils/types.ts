// Core TypeScript interfaces for When2meet

export interface User {
  id: string; // Phone number
  displayName: string;
  avatar?: string;
  teams: string[];
  steamId?: string;
  faceitId?: string;
  eseaId?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  description: string;
  game: GameType;
  members: TeamMember[];
  createdBy: string;
  createdAt: Date;
  links: TeamLink[];
  stats?: TeamStats;
}

export interface TeamMember {
  userId: string;
  displayName: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface TeamLink {
  type: 'discord' | 'steam' | 'faceit' | 'esea' | 'custom';
  url: string;
  label: string;
}

export interface TeamStats {
  wins: number;
  losses: number;
  winRate: number;
  ranking?: string;
}

export type GameType = 'csgo' | 'valorant' | 'lol' | 'dota2' | 'other';

export interface CalendarEvent {
  id: string;
  teamId: string;
  type: EventType;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  recurring?: RecurringPattern;
  participants: string[];
  createdBy: string;
}

export type EventType = 'game' | 'practice' | 'scrim' | 'tournament' | 'day_off' | 'check_in';

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  endDate?: Date;
}

export interface ChatMessage {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  media?: MediaAttachment[];
  reactions?: MessageReaction[];
  createdAt: Date;
  editedAt?: Date;
}

export interface MediaAttachment {
  type: 'photo' | 'video' | 'file';
  url: string;
  thumbnailUrl?: string;
  name: string;
  size: number;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
}

export interface GameNews {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: Date;
  game: GameType;
}

export interface PlayerStats {
  playerId: string;
  game: GameType;
  platform: 'steam' | 'faceit' | 'esea';
  stats: {
    kills: number;
    deaths: number;
    kd: number;
    headshots: number;
    wins: number;
    matches: number;
    hours: number;
    rank?: string;
  };
  lastUpdated: Date;
}
