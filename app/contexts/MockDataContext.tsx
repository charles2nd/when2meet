import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'Coach' | 'IGL' | 'Player' | 'Sub';
  teamId: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  members: User[];
  description?: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityEvent {
  id: string;
  title: string;
  description?: string;
  teamId: string;
  createdBy: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timeSlots: TimeSlot[];
  shareLink: string;
  requiresPassword: boolean;
  password?: string;
}

export interface AvailabilityResponse {
  eventId: string;
  userId: string;
  selectedSlots: string[];
  lastUpdated: Date;
}

export interface CalendarEvent {
  id: string;
  teamId: string;
  title: string;
  type: 'Game' | 'Practice' | 'Scrim' | 'Tournament' | 'Day Off';
  date: string;
  startTime: string;
  endTime: string;
  participants: string[];
  linkedAvailabilityEventId?: string;
}

interface MockDataContextType {
  // Loading state
  isLoaded: boolean;
  
  // User management
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  createUser: (userData: Omit<User, 'id'>) => Promise<string>;
  
  // Team management
  teams: Team[];
  currentTeam: Team | null;
  setCurrentTeam: (team: Team) => void;
  createTeam: (teamData: Omit<Team, 'id'>) => Promise<string>;
  addMemberToTeam: (teamId: string, user: User) => Promise<void>;
  
  // Availability Events
  availabilityEvents: AvailabilityEvent[];
  createAvailabilityEvent: (event: Omit<AvailabilityEvent, 'id' | 'shareLink'>) => string;
  getAvailabilityEvent: (id: string) => AvailabilityEvent | undefined;
  
  // Availability Responses
  availabilityResponses: AvailabilityResponse[];
  updateAvailabilityResponse: (eventId: string, userId: string, selectedSlots: string[]) => void;
  getEventResponses: (eventId: string) => AvailabilityResponse[];
  
  // Calendar Events
  calendarEvents: CalendarEvent[];
  createCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => string;
  
  // Helper functions
  generateTimeSlots: (startDate: string, endDate: string, startTime: string, endTime: string) => TimeSlot[];
  getOptimalTimeSlots: (eventId: string) => { slotId: string; availableCount: number; percentage: number }[];
  
  // Storage management
  clearAllData: () => Promise<void>;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export const useMockData = () => {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
};

// No initial mock data - everything starts empty

// Storage keys
const STORAGE_KEYS = {
  CURRENT_USER: 'when2meet_current_user',
  TEAMS: 'when2meet_teams',
  CURRENT_TEAM: 'when2meet_current_team',
  AVAILABILITY_EVENTS: 'when2meet_availability_events',
  AVAILABILITY_RESPONSES: 'when2meet_availability_responses',
  CALENDAR_EVENTS: 'when2meet_calendar_events',
  INITIALIZED: 'when2meet_initialized'
};

export const MockDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [availabilityEvents, setAvailabilityEvents] = useState<AvailabilityEvent[]>([]);
  const [availabilityResponses, setAvailabilityResponses] = useState<AvailabilityResponse[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from storage on initialization
  useEffect(() => {
    loadDataFromStorage();
  }, []);

  // Save data to storage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      saveDataToStorage();
    }
  }, [currentUser, teams, currentTeam, availabilityEvents, availabilityResponses, calendarEvents, isLoaded]);

  const loadDataFromStorage = async () => {
    try {
      const initialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
      
      if (!initialized) {
        // First time initialization with empty data
        await initializeWithEmptyData();
      } else {
        // Load existing data from storage
        const [
          storedCurrentUser,
          storedTeams,
          storedCurrentTeam,
          storedAvailabilityEvents,
          storedAvailabilityResponses,
          storedCalendarEvents
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
          AsyncStorage.getItem(STORAGE_KEYS.TEAMS),
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TEAM),
          AsyncStorage.getItem(STORAGE_KEYS.AVAILABILITY_EVENTS),
          AsyncStorage.getItem(STORAGE_KEYS.AVAILABILITY_RESPONSES),
          AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS)
        ]);

        setCurrentUser(storedCurrentUser ? JSON.parse(storedCurrentUser) : null);
        setTeams(storedTeams ? JSON.parse(storedTeams) : []);
        setCurrentTeam(storedCurrentTeam ? JSON.parse(storedCurrentTeam) : null);
        setAvailabilityEvents(storedAvailabilityEvents ? JSON.parse(storedAvailabilityEvents) : []);
        setAvailabilityResponses(storedAvailabilityResponses ? JSON.parse(storedAvailabilityResponses) : []);
        setCalendarEvents(storedCalendarEvents ? JSON.parse(storedCalendarEvents) : []);
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading data from storage:', error);
      // Fallback to empty data
      await initializeWithEmptyData();
      setIsLoaded(true);
    }
  };

  const initializeWithEmptyData = async () => {
    // Initialize with empty data
    setCurrentUser(null);
    setTeams([]);
    setCurrentTeam(null);
    setCalendarEvents([]);
    setAvailabilityEvents([]);
    setAvailabilityResponses([]);

    // Mark as initialized
    await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  };

  const saveDataToStorage = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser)),
        AsyncStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams)),
        AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TEAM, JSON.stringify(currentTeam)),
        AsyncStorage.setItem(STORAGE_KEYS.AVAILABILITY_EVENTS, JSON.stringify(availabilityEvents)),
        AsyncStorage.setItem(STORAGE_KEYS.AVAILABILITY_RESPONSES, JSON.stringify(availabilityResponses)),
        AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(calendarEvents))
      ]);
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  };

  const generateTimeSlots = useCallback((
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string
  ): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += 30) {
          if (h === startHour && m < startMin) continue;
          if (h === endHour - 1 && m >= endMin) break;
          
          const slotStart = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          const slotEnd = m === 30 
            ? `${(h + 1).toString().padStart(2, '0')}:00`
            : `${h.toString().padStart(2, '0')}:30`;
          
          slots.push({
            id: `${dateStr}_${slotStart}`,
            date: dateStr,
            startTime: slotStart,
            endTime: slotEnd,
          });
        }
      }
    }
    
    return slots;
  }, []);

  const createAvailabilityEvent = useCallback((event: Omit<AvailabilityEvent, 'id' | 'shareLink'>): string => {
    const id = `event_${Date.now()}`;
    const shareLink = `https://when2meet.app/event/${id}`;
    const timeSlots = generateTimeSlots(event.startDate, event.endDate, event.startTime, event.endTime);
    
    const newEvent: AvailabilityEvent = {
      ...event,
      id,
      shareLink,
      timeSlots,
    };
    
    setAvailabilityEvents(prev => {
      const updated = [...prev, newEvent];
      return updated;
    });
    
    // Add mock responses for demo
    if (currentTeam) {
      const mockResponses = currentTeam.members
        .filter(member => member.id !== currentUser?.id)
        .map(member => ({
          eventId: id,
          userId: member.id,
          selectedSlots: timeSlots
            .filter(() => Math.random() > 0.3) // 70% chance of being available
            .map(slot => slot.id),
          lastUpdated: new Date(),
        }));
      
      setAvailabilityResponses(prev => {
        const updated = [...prev, ...mockResponses];
        return updated;
      });
    }
    
    return id;
  }, [currentTeam, currentUser, generateTimeSlots]);

  const getAvailabilityEvent = useCallback((id: string): AvailabilityEvent | undefined => {
    return availabilityEvents.find(event => event.id === id);
  }, [availabilityEvents]);

  const updateAvailabilityResponse = useCallback((
    eventId: string,
    userId: string,
    selectedSlots: string[]
  ) => {
    setAvailabilityResponses(prev => {
      const existing = prev.findIndex(r => r.eventId === eventId && r.userId === userId);
      const response: AvailabilityResponse = {
        eventId,
        userId,
        selectedSlots,
        lastUpdated: new Date(),
      };
      
      let updated;
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = response;
      } else {
        updated = [...prev, response];
      }
      
      return updated;
    });
  }, []);

  const getEventResponses = useCallback((eventId: string): AvailabilityResponse[] => {
    return availabilityResponses.filter(r => r.eventId === eventId);
  }, [availabilityResponses]);

  const getOptimalTimeSlots = useCallback((eventId: string): { 
    slotId: string; 
    availableCount: number; 
    percentage: number;
  }[] => {
    const event = getAvailabilityEvent(eventId);
    if (!event) return [];
    
    const responses = getEventResponses(eventId);
    const totalParticipants = currentTeam?.members.length || 1;
    
    return event.timeSlots.map(slot => {
      const availableCount = responses.filter(r => r.selectedSlots.includes(slot.id)).length;
      return {
        slotId: slot.id,
        availableCount,
        percentage: (availableCount / totalParticipants) * 100,
      };
    }).sort((a, b) => b.availableCount - a.availableCount);
  }, [currentTeam, getAvailabilityEvent, getEventResponses]);

  const createCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id'>): string => {
    const id = `cal_${Date.now()}`;
    const newEvent: CalendarEvent = { ...event, id };
    setCalendarEvents(prev => {
      const updated = [...prev, newEvent];
      return updated;
    });
    return id;
  }, []);

  const createUser = useCallback(async (userData: Omit<User, 'id'>): Promise<string> => {
    const id = `user_${Date.now()}`;
    const newUser: User = { ...userData, id };
    
    // Add to current user if none exists
    if (!currentUser) {
      setCurrentUser(newUser);
    }
    
    return id;
  }, [currentUser]);

  const createTeam = useCallback(async (teamData: Omit<Team, 'id'>): Promise<string> => {
    const id = `team_${Date.now()}`;
    const newTeam: Team = { ...teamData, id };
    
    setTeams(prev => {
      const updated = [...prev, newTeam];
      return updated;
    });
    
    // Set as current team if none exists
    if (!currentTeam) {
      setCurrentTeam(newTeam);
    }
    
    return id;
  }, [currentTeam]);

  const addMemberToTeam = useCallback(async (teamId: string, user: User): Promise<void> => {
    setTeams(prev => {
      const updated = prev.map(team => {
        if (team.id === teamId) {
          const updatedMembers = team.members.some(m => m.id === user.id) 
            ? team.members 
            : [...team.members, user];
          return { ...team, members: updatedMembers };
        }
        return team;
      });
      return updated;
    });
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER),
        AsyncStorage.removeItem(STORAGE_KEYS.TEAMS),
        AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM),
        AsyncStorage.removeItem(STORAGE_KEYS.AVAILABILITY_EVENTS),
        AsyncStorage.removeItem(STORAGE_KEYS.AVAILABILITY_RESPONSES),
        AsyncStorage.removeItem(STORAGE_KEYS.CALENDAR_EVENTS),
        AsyncStorage.removeItem(STORAGE_KEYS.INITIALIZED)
      ]);
      
      // Reset state to initial values
      setCurrentUser(null);
      setTeams([]);
      setCurrentTeam(null);
      setAvailabilityEvents([]);
      setAvailabilityResponses([]);
      setCalendarEvents([]);
      setIsLoaded(false);
      
      // Reinitialize with fresh mock data
      await loadDataFromStorage();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }, []);

  const value: MockDataContextType = {
    isLoaded,
    currentUser,
    setCurrentUser,
    createUser,
    teams,
    currentTeam,
    setCurrentTeam,
    createTeam,
    addMemberToTeam,
    availabilityEvents,
    createAvailabilityEvent,
    getAvailabilityEvent,
    availabilityResponses,
    updateAvailabilityResponse,
    getEventResponses,
    calendarEvents,
    createCalendarEvent,
    generateTimeSlots,
    getOptimalTimeSlots,
    clearAllData,
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
};