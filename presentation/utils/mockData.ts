// Mock data for presentation

import { User, Team, CalendarEvent, ChatMessage, GameNews, PlayerStats } from './types';

export const mockUser: User = {
  id: '+1234567890',
  displayName: 'FreeZe',
  avatar: 'https://i.pravatar.cc/150?u=freeze',
  teams: ['team1', 'team2'],
  steamId: '76561198123456789',
  faceitId: 'freeze-pro',
  createdAt: new Date('2023-01-01'),
  lastActive: new Date(),
};

export const mockTeams: Team[] = [
  {
    id: 'team1',
    name: 'Syko Team',
    logo: 'https://i.imgur.com/2cXRQKu.png',
    description: 'Competitive CS:GO team focused on tournament play',
    game: 'csgo',
    createdBy: 'freeze',
    createdAt: new Date('2023-01-01'),
    members: [
      {
        userId: '+1234567890',
        displayName: 'FreeZe',
        avatar: 'https://i.pravatar.cc/150?u=freeze',
        role: 'owner',
        joinedAt: new Date('2023-01-01'),
      },
      {
        userId: '+1234567891',
        displayName: 'n0thing',
        avatar: 'https://i.pravatar.cc/150?u=n0thing',
        role: 'admin',
        joinedAt: new Date('2023-01-15'),
      },
      {
        userId: '+1234567892',
        displayName: 'shroud',
        avatar: 'https://i.pravatar.cc/150?u=shroud',
        role: 'member',
        joinedAt: new Date('2023-02-01'),
      },
      {
        userId: '+1234567893',
        displayName: 'stewie2k',
        avatar: 'https://i.pravatar.cc/150?u=stewie2k',
        role: 'member',
        joinedAt: new Date('2023-02-15'),
      },
      {
        userId: '+1234567894',
        displayName: 'tarik',
        avatar: 'https://i.pravatar.cc/150?u=tarik',
        role: 'member',
        joinedAt: new Date('2023-03-01'),
      },
    ],
    links: [
      { type: 'discord', url: 'https://discord.gg/sykoteam', label: 'Team Discord' },
      { type: 'steam', url: 'https://steamcommunity.com/groups/sykoteam', label: 'Steam Group' },
      { type: 'faceit', url: 'https://faceit.com/en/teams/sykoteam', label: 'Faceit Team' },
    ],
    stats: {
      wins: 47,
      losses: 23,
      winRate: 67.1,
      ranking: 'Level 8',
    },
  },
  {
    id: 'team2',
    name: 'Valorant Squad',
    logo: 'https://i.imgur.com/3xQrKpL.png',
    description: 'Casual Valorant team for ranked matches',
    game: 'valorant',
    createdBy: 'freeze',
    createdAt: new Date('2023-06-01'),
    members: [
      {
        userId: '+1234567890',
        displayName: 'FreeZe',
        avatar: 'https://i.pravatar.cc/150?u=freeze',
        role: 'owner',
        joinedAt: new Date('2023-06-01'),
      },
      {
        userId: '+1234567895',
        displayName: 'TenZ',
        avatar: 'https://i.pravatar.cc/150?u=tenz',
        role: 'member',
        joinedAt: new Date('2023-06-05'),
      },
      {
        userId: '+1234567896',
        displayName: 'Sick',
        avatar: 'https://i.pravatar.cc/150?u=sick',
        role: 'member',
        joinedAt: new Date('2023-06-10'),
      },
    ],
    links: [{ type: 'discord', url: 'https://discord.gg/valsquad', label: 'Squad Discord' }],
    stats: {
      wins: 28,
      losses: 19,
      winRate: 59.6,
      ranking: 'Diamond 2',
    },
  },
];

export const mockEvents: CalendarEvent[] = [
  {
    id: 'event1',
    teamId: 'team1',
    type: 'tournament',
    title: 'ESL Weekly Cup',
    description: 'Weekly tournament registration closes at 7 PM',
    startTime: new Date(2025, 0, 25, 20, 0), // Jan 25, 2025, 8 PM
    endTime: new Date(2025, 0, 25, 23, 0),
    participants: ['+1234567890', '+1234567891', '+1234567892'],
    createdBy: '+1234567890',
  },
  {
    id: 'event2',
    teamId: 'team1',
    type: 'practice',
    title: 'Aim Training',
    description: 'FFA DM and aim_botz practice session',
    startTime: new Date(2025, 0, 22, 19, 0), // Jan 22, 2025, 7 PM
    endTime: new Date(2025, 0, 22, 21, 0),
    participants: ['+1234567890', '+1234567891', '+1234567892', '+1234567893'],
    createdBy: '+1234567891',
  },
  {
    id: 'event3',
    teamId: 'team1',
    type: 'scrim',
    title: 'Scrim vs Team Alpha',
    description: 'BO3 scrim match on Mirage, Dust2, Inferno',
    startTime: new Date(2025, 0, 23, 21, 0), // Jan 23, 2025, 9 PM
    endTime: new Date(2025, 0, 23, 23, 30),
    participants: ['+1234567890', '+1234567891', '+1234567892', '+1234567893', '+1234567894'],
    createdBy: '+1234567890',
  },
  {
    id: 'event4',
    teamId: 'team2',
    type: 'game',
    title: 'Ranked Queue',
    description: 'Grinding ranked matches',
    startTime: new Date(2025, 0, 24, 20, 0), // Jan 24, 2025, 8 PM
    endTime: new Date(2025, 0, 24, 22, 0),
    participants: ['+1234567890', '+1234567895', '+1234567896'],
    createdBy: '+1234567890',
  },
  {
    id: 'event5',
    teamId: 'team1',
    type: 'day_off',
    title: 'Rest Day',
    description: 'No team activities scheduled',
    startTime: new Date(2025, 0, 26, 0, 0), // Jan 26, 2025
    endTime: new Date(2025, 0, 26, 23, 59),
    participants: [],
    createdBy: '+1234567890',
  },
];

export const mockMessages: ChatMessage[] = [
  {
    id: 'msg1',
    teamId: 'team1',
    senderId: '+1234567891',
    senderName: 'n0thing',
    senderAvatar: 'https://i.pravatar.cc/150?u=n0thing',
    content: "Ready for tonight's scrim?",
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: 'msg2',
    teamId: 'team1',
    senderId: '+1234567890',
    senderName: 'FreeZe',
    senderAvatar: 'https://i.pravatar.cc/150?u=freeze',
    content: 'Yeah, been practicing smokes on Mirage all day',
    createdAt: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
  },
  {
    id: 'msg3',
    teamId: 'team1',
    senderId: '+1234567892',
    senderName: 'shroud',
    senderAvatar: 'https://i.pravatar.cc/150?u=shroud',
    content: 'Should we ban Dust2? Their AWPer is insane on that map',
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
  },
  {
    id: 'msg4',
    teamId: 'team1',
    senderId: '+1234567893',
    senderName: 'stewie2k',
    senderAvatar: 'https://i.pravatar.cc/150?u=stewie2k',
    content: "Agreed. Let's go with our Inferno strats",
    createdAt: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
  },
  {
    id: 'msg5',
    teamId: 'team1',
    senderId: '+1234567894',
    senderName: 'tarik',
    senderAvatar: 'https://i.pravatar.cc/150?u=tarik',
    content: "I'll IGL tonight, been watching their demos",
    createdAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago
  },
];

export const mockNews: GameNews[] = [
  {
    id: 'news1',
    title: 'CS2 Major Paris 2025 Announced',
    summary: 'Valve announces the first CS2 Major tournament in Paris with $2M prize pool',
    url: 'https://example.com/news1',
    imageUrl: 'https://i.imgur.com/example1.jpg',
    source: 'HLTV',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    game: 'csgo',
  },
  {
    id: 'news2',
    title: 'New Mirage Updates Coming Soon',
    summary: 'Valve teases upcoming changes to the iconic map',
    url: 'https://example.com/news2',
    imageUrl: 'https://i.imgur.com/example2.jpg',
    source: 'Steam News',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    game: 'csgo',
  },
  {
    id: 'news3',
    title: 'VALORANT Champions 2025 Schedule',
    summary: 'Full tournament schedule and format revealed',
    url: 'https://example.com/news3',
    imageUrl: 'https://i.imgur.com/example3.jpg',
    source: 'Riot Games',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    game: 'valorant',
  },
];

export const mockPlayerStats: PlayerStats[] = [
  {
    playerId: '+1234567890',
    game: 'csgo',
    platform: 'faceit',
    stats: {
      kills: 1247,
      deaths: 1089,
      kd: 1.15,
      headshots: 623,
      wins: 67,
      matches: 98,
      hours: 2840,
      rank: 'Level 8',
    },
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    playerId: '+1234567891',
    game: 'csgo',
    platform: 'faceit',
    stats: {
      kills: 1856,
      deaths: 1456,
      kd: 1.27,
      headshots: 834,
      wins: 89,
      matches: 127,
      hours: 3520,
      rank: 'Level 9',
    },
    lastUpdated: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
  },
];
