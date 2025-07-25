import { format, parse, addMinutes, isSameDay, isWithinInterval } from 'date-fns';
import { TimeSlot } from './types';
import { TIME_SLOT_DURATION, DATE_FORMAT, TIME_FORMAT } from './constants';

export const formatDate = (date: Date, formatString: string = DATE_FORMAT): string => {
  return format(date, formatString);
};

export const formatTime = (date: Date): string => {
  return format(date, TIME_FORMAT);
};

export const parseTime = (timeString: string, date: Date): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

export const generateTimeSlots = (
  startDate: Date,
  endDate: Date,
  startTime: string,
  endTime: string,
  duration: number = TIME_SLOT_DURATION
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const daySlots = generateDayTimeSlots(currentDate, startTime, endTime, duration);
    slots.push(...daySlots);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
};

export const generateDayTimeSlots = (
  date: Date,
  startTime: string,
  endTime: string,
  duration: number = TIME_SLOT_DURATION
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startDateTime = parseTime(startTime, date);
  const endDateTime = parseTime(endTime, date);
  
  let current = new Date(startDateTime);
  
  while (current < endDateTime) {
    const next = addMinutes(current, duration);
    
    slots.push({
      id: `${formatDate(date)}_${formatTime(current)}_${formatTime(next)}`,
      startTime: formatTime(current),
      endTime: formatTime(next),
      date: formatDate(date)
    });
    
    current = next;
  }
  
  return slots;
};

export const getTimeSlotsByDate = (timeSlots: TimeSlot[]): Record<string, TimeSlot[]> => {
  return timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);
};

export const sortTimeSlots = (timeSlots: TimeSlot[]): TimeSlot[] => {
  return [...timeSlots].sort((a, b) => {
    const dateComparison = a.date.localeCompare(b.date);
    if (dateComparison !== 0) return dateComparison;
    return a.startTime.localeCompare(b.startTime);
  });
};

export const getUniqueTimeLabels = (timeSlots: TimeSlot[]): string[] => {
  const times = new Set<string>();
  timeSlots.forEach(slot => {
    times.add(slot.startTime);
  });
  return Array.from(times).sort();
};

export const getUniqueDateLabels = (timeSlots: TimeSlot[]): string[] => {
  const dates = new Set<string>();
  timeSlots.forEach(slot => {
    dates.add(slot.date);
  });
  return Array.from(dates).sort();
};

export const isTimeSlotInRange = (
  slot: TimeSlot,
  startDate: Date,
  endDate: Date
): boolean => {
  const slotDate = parse(slot.date, DATE_FORMAT, new Date());
  return isWithinInterval(slotDate, { start: startDate, end: endDate });
};

export const formatTimeSlotLabel = (slot: TimeSlot): string => {
  return `${slot.startTime} - ${slot.endTime}`;
};

export const formatDateLabel = (dateString: string): string => {
  const date = parse(dateString, DATE_FORMAT, new Date());
  return format(date, 'MMM dd');
};

export const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return endTotalMinutes - startTotalMinutes;
};

export const mergeContinuousSlots = (slotIds: string[], allSlots: TimeSlot[]): TimeSlot[] => {
  const selectedSlots = slotIds
    .map(id => allSlots.find(slot => slot.id === id))
    .filter(Boolean) as TimeSlot[];
  
  return sortTimeSlots(selectedSlots);
};

export const validateTimeRange = (startTime: string, endTime: string): boolean => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return endTotalMinutes > startTotalMinutes;
};

export const getOptimalMeetingDuration = (availableSlots: TimeSlot[]): number => {
  if (availableSlots.length === 0) return 0;
  
  let maxContinuous = 0;
  let currentContinuous = 0;
  
  const sortedSlots = sortTimeSlots(availableSlots);
  
  for (let i = 0; i < sortedSlots.length; i++) {
    if (i === 0) {
      currentContinuous = TIME_SLOT_DURATION;
    } else {
      const prevSlot = sortedSlots[i - 1];
      const currentSlot = sortedSlots[i];
      
      const prevEnd = parseTime(prevSlot.endTime, parse(prevSlot.date, DATE_FORMAT, new Date()));
      const currentStart = parseTime(currentSlot.startTime, parse(currentSlot.date, DATE_FORMAT, new Date()));
      
      if (prevEnd.getTime() === currentStart.getTime() && prevSlot.date === currentSlot.date) {
        currentContinuous += TIME_SLOT_DURATION;
      } else {
        maxContinuous = Math.max(maxContinuous, currentContinuous);
        currentContinuous = TIME_SLOT_DURATION;
      }
    }
  }
  
  return Math.max(maxContinuous, currentContinuous);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};