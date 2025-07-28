import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '../utils/types';
import { CalendarService } from '../services/calendar';

interface UseCalendarProps {
  teamId: string;
}

interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  createEvent: (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => Promise<string>;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  linkAvailabilityEvent: (eventId: string, availabilityEventId: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export const useCalendar = ({ teamId }: UseCalendarProps): UseCalendarReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const teamEvents = await CalendarService.getTeamEvents(teamId);
      setEvents(teamEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      console.error('Error loading calendar events:', err);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const createEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    try {
      const eventId = await CalendarService.createEvent(eventData);
      await loadEvents();
      return eventId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    }
  }, [loadEvents]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      await CalendarService.updateEvent(eventId, updates);
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    }
  }, [loadEvents]);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await CalendarService.deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    }
  }, []);

  const linkAvailabilityEvent = useCallback(async (eventId: string, availabilityEventId: string) => {
    try {
      await CalendarService.linkAvailabilityEvent(eventId, availabilityEventId);
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link availability event');
      throw err;
    }
  }, [loadEvents]);

  useEffect(() => {
    if (teamId) {
      loadEvents();
    }
  }, [teamId, loadEvents]);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    linkAvailabilityEvent,
    refreshEvents: loadEvents
  };
};