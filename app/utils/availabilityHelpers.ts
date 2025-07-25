import { format, parse, addDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { 
  AvailabilityEvent, 
  AvailabilityResponse, 
  TimeSlot, 
  OptimalTimeSlot,
  ParticipationSummary 
} from './types';
import { 
  generateTimeSlots, 
  getTimeSlotsByDate,
  formatDate,
  formatTime,
  parseTime 
} from './helpers';
import { TIME_SLOT_DURATION, DATE_FORMAT } from './constants';

export function createAvailabilityEvent(
  title: string,
  teamId: string,
  createdBy: string,
  startDate: Date,
  endDate: Date,
  startTime: string,
  endTime: string,
  participants: string[] = [],
  options: {
    isRecurring?: boolean;
    allowAnonymous?: boolean;
    description?: string;
    timeZone?: string;
  } = {}
): Omit<AvailabilityEvent, 'id' | 'createdAt' | 'shareableLink'> {
  const timeSlots = generateTimeSlots(startDate, endDate, startTime, endTime);
  
  return {
    teamId,
    title,
    description: options.description,
    createdBy,
    startDate,
    endDate,
    timeSlots,
    timeZone: options.timeZone || 'UTC',
    participants,
    responses: [],
    isRecurring: options.isRecurring || false,
    allowAnonymous: options.allowAnonymous || false,
    status: 'active'
  };
}

export function calculateOptimalTimeSlots(
  timeSlots: TimeSlot[],
  responses: AvailabilityResponse[]
): OptimalTimeSlot[] {
  if (responses.length === 0) {
    return timeSlots.map(slot => ({
      timeSlot: slot,
      availableCount: 0,
      availableUsers: [],
      conflictingUsers: [],
      score: 0
    }));
  }

  return timeSlots.map(slot => {
    const availableUsers = responses
      .filter(response => response.availableSlots.includes(slot.id))
      .map(response => response.userId);
    
    const conflictingUsers = responses
      .filter(response => !response.availableSlots.includes(slot.id))
      .map(response => response.userId);
    
    const score = availableUsers.length / responses.length;
    
    return {
      timeSlot: slot,
      availableCount: availableUsers.length,
      availableUsers,
      conflictingUsers,
      score
    };
  }).sort((a, b) => b.score - a.score);
}

export function calculateParticipationSummary(
  event: AvailabilityEvent,
  responses: AvailabilityResponse[]
): ParticipationSummary {
  const totalParticipants = event.participants.length;
  const respondedCount = responses.length;
  const responseRate = totalParticipants > 0 ? respondedCount / totalParticipants : 0;
  
  const optimalSlots = calculateOptimalTimeSlots(event.timeSlots, responses);
  
  return {
    totalParticipants,
    respondedCount,
    responseRate,
    mostPopularSlots: optimalSlots.slice(0, 5).map(slot => slot.timeSlot),
    leastPopularSlots: optimalSlots.slice(-5).map(slot => slot.timeSlot)
  };
}

export function findBestMeetingTimes(
  optimalSlots: OptimalTimeSlot[],
  minimumParticipants: number = 1,
  preferredDuration: number = TIME_SLOT_DURATION
): OptimalTimeSlot[] {
  return optimalSlots.filter(slot => 
    slot.availableCount >= minimumParticipants &&
    slot.score >= 0.5
  );
}

export function getAvailabilityConflicts(
  responses: AvailabilityResponse[],
  timeSlot: TimeSlot
): {
  availableUsers: string[];
  unavailableUsers: string[];
  conflictRate: number;
} {
  const availableUsers = responses
    .filter(response => response.availableSlots.includes(timeSlot.id))
    .map(response => response.userName);
  
  const unavailableUsers = responses
    .filter(response => !response.availableSlots.includes(timeSlot.id))
    .map(response => response.userName);
  
  const conflictRate = responses.length > 0 
    ? unavailableUsers.length / responses.length 
    : 0;
  
  return {
    availableUsers,
    unavailableUsers,
    conflictRate
  };
}

export function mergeAvailabilityResponses(
  existing: AvailabilityResponse[],
  updates: AvailabilityResponse[]
): AvailabilityResponse[] {
  const merged = [...existing];
  
  updates.forEach(update => {
    const existingIndex = merged.findIndex(
      response => response.userId === update.userId
    );
    
    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        ...update,
        lastUpdated: new Date()
      };
    } else {
      merged.push({
        ...update,
        lastUpdated: new Date()
      });
    }
  });
  
  return merged;
}

export function filterResponsesByDateRange(
  responses: AvailabilityResponse[],
  timeSlots: TimeSlot[],
  startDate: Date,
  endDate: Date
): AvailabilityResponse[] {
  const validSlotIds = timeSlots
    .filter(slot => {
      const slotDate = parse(slot.date, DATE_FORMAT, new Date());
      return isWithinInterval(slotDate, { start: startDate, end: endDate });
    })
    .map(slot => slot.id);
  
  return responses.map(response => ({
    ...response,
    availableSlots: response.availableSlots.filter(slotId => 
      validSlotIds.includes(slotId)
    )
  }));
}

export function getResponseStatistics(
  responses: AvailabilityResponse[]
): {
  totalResponses: number;
  averageSlotsSelected: number;
  mostActivesUser: string | null;
  leastActiveUser: string | null;
  responseDistribution: Record<string, number>;
} {
  if (responses.length === 0) {
    return {
      totalResponses: 0,
      averageSlotsSelected: 0,
      mostActivesUser: null,
      leastActiveUser: null,
      responseDistribution: {}
    };
  }
  
  const totalSlots = responses.reduce(
    (sum, response) => sum + response.availableSlots.length,
    0
  );
  
  const averageSlotsSelected = totalSlots / responses.length;
  
  const sortedByActivity = [...responses].sort(
    (a, b) => b.availableSlots.length - a.availableSlots.length
  );
  
  const mostActivesUser = sortedByActivity[0]?.userName || null;
  const leastActiveUser = sortedByActivity[sortedByActivity.length - 1]?.userName || null;
  
  const responseDistribution = responses.reduce((dist, response) => {
    const slotCount = response.availableSlots.length;
    const range = `${Math.floor(slotCount / 5) * 5}-${Math.floor(slotCount / 5) * 5 + 4}`;
    dist[range] = (dist[range] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);
  
  return {
    totalResponses: responses.length,
    averageSlotsSelected,
    mostActivesUser,
    leastActiveUser,
    responseDistribution
  };
}

export function generateShareableEventSummary(
  event: AvailabilityEvent,
  responses: AvailabilityResponse[]
): string {
  const summary = calculateParticipationSummary(event, responses);
  const optimalSlots = calculateOptimalTimeSlots(event.timeSlots, responses);
  const topSlots = optimalSlots.slice(0, 3);
  
  let text = `${event.title}\n\n`;
  text += `${formatDate(event.startDate)} - ${formatDate(event.endDate)}\n`;
  text += `👥 ${summary.respondedCount}/${summary.totalParticipants} responses (${Math.round(summary.responseRate * 100)}%)\n\n`;
  
  if (topSlots.length > 0) {
    text += `🏆 Best times:\n`;
    topSlots.forEach((slot, index) => {
      text += `${index + 1}. ${slot.timeSlot.date} ${slot.timeSlot.startTime}-${slot.timeSlot.endTime} (${slot.availableCount} available)\n`;
    });
  }
  
  return text;
}

export function validateAvailabilityEvent(
  eventData: Partial<AvailabilityEvent>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!eventData.title || eventData.title.trim().length === 0) {
    errors.push('Event title is required');
  }
  
  if (!eventData.teamId) {
    errors.push('Team ID is required');
  }
  
  if (!eventData.startDate || !eventData.endDate) {
    errors.push('Start and end dates are required');
  }
  
  if (eventData.startDate && eventData.endDate && eventData.startDate > eventData.endDate) {
    errors.push('Start date must be before end date');
  }
  
  if (!eventData.timeSlots || eventData.timeSlots.length === 0) {
    errors.push('At least one time slot is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function cloneEventForNewDates(
  originalEvent: AvailabilityEvent,
  newStartDate: Date,
  newEndDate: Date,
  newTitle?: string
): Omit<AvailabilityEvent, 'id' | 'createdAt' | 'shareableLink'> {
  const firstSlot = originalEvent.timeSlots[0];
  const lastSlot = originalEvent.timeSlots[originalEvent.timeSlots.length - 1];
  
  if (!firstSlot || !lastSlot) {
    throw new Error('Original event must have time slots');
  }
  
  const startTime = firstSlot.startTime;
  const endTime = lastSlot.endTime;
  
  return createAvailabilityEvent(
    newTitle || originalEvent.title,
    originalEvent.teamId,
    originalEvent.createdBy,
    newStartDate,
    newEndDate,
    startTime,
    endTime,
    originalEvent.participants,
    {
      isRecurring: originalEvent.isRecurring,
      allowAnonymous: originalEvent.allowAnonymous,
      description: originalEvent.description,
      timeZone: originalEvent.timeZone
    }
  );
}