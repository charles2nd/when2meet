export interface TimeSlot {
  date: string;
  hour: number;
  available: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyAvailability {
  id: string;
  teamId: string;
  memberId: string;
  month: string; // Format: YYYY-MM
  availability: Record<string, boolean>; // Key: YYYY-MM-DD-HH, Value: available/not
  createdAt: string;
  updatedAt: string;
}

export interface DayAvailability {
  date: string;
  slots: {
    hour: number;
    available: boolean;
  }[];
}