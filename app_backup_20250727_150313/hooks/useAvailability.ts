import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AvailabilityEvent,
  AvailabilityResponse,
  AvailabilityAnalytics,
  TimeSlot,
  OptimalTimeSlot
} from '../utils/types';
import { AvailabilityService } from '../services/availability';
import { debounce } from '../utils/helpers';

interface UseAvailabilityProps {
  eventId: string;
  userId?: string;
}

interface UseAvailabilityReturn {
  event: AvailabilityEvent | null;
  responses: AvailabilityResponse[];
  analytics: AvailabilityAnalytics | null;
  userResponse: AvailabilityResponse | null;
  optimalSlots: OptimalTimeSlot[];
  
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  
  updateUserAvailability: (selectedSlots: string[]) => Promise<void>;
  refreshData: () => Promise<void>;
  submitResponse: (response: Omit<AvailabilityResponse, 'lastUpdated'>) => Promise<void>;
}

export const useAvailability = ({
  eventId,
  userId
}: UseAvailabilityProps): UseAvailabilityReturn => {
  const [event, setEvent] = useState<AvailabilityEvent | null>(null);
  const [responses, setResponses] = useState<AvailabilityResponse[]>([]);
  const [analytics, setAnalytics] = useState<AvailabilityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const loadEvent = useCallback(async () => {
    try {
      setError(null);
      const eventData = await AvailabilityService.getAvailabilityEvent(eventId);
      if (eventData) {
        setEvent(eventData);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
      console.error('Error loading availability event:', err);
    }
  }, [eventId]);

  const loadAnalytics = useCallback(async () => {
    try {
      const analyticsData = await AvailabilityService.getAvailabilityAnalytics(eventId);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  }, [eventId]);

  const setupRealtimeUpdates = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    try {
      setIsConnected(true);
      unsubscribeRef.current = AvailabilityService.onAvailabilityUpdate(
        eventId,
        (updatedResponses) => {
          const now = Date.now();
          if (now - lastUpdateRef.current < 100) {
            return;
          }
          lastUpdateRef.current = now;
          
          setResponses(updatedResponses);
          setIsConnected(true);
          
          loadAnalytics();
        }
      );
    } catch (err) {
      console.error('Error setting up real-time updates:', err);
      setIsConnected(false);
      setError('Connection lost. Retrying...');
      
      setTimeout(() => {
        setupRealtimeUpdates();
      }, 3000);
    }
  }, [eventId, loadAnalytics]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadEvent(),
        loadAnalytics()
      ]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [loadEvent, loadAnalytics]);

  const debouncedSubmitResponse = useCallback(
    debounce(async (response: Omit<AvailabilityResponse, 'lastUpdated'>) => {
      try {
        if (!userId) {
          throw new Error('User ID is required to submit response');
        }
        
        await AvailabilityService.submitAvailabilityResponse(eventId, userId, response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit response');
        console.error('Error submitting availability response:', err);
      }
    }, 500),
    [eventId, userId]
  );

  const updateUserAvailability = useCallback(async (selectedSlots: string[]) => {
    if (!userId || !event) return;

    const response: Omit<AvailabilityResponse, 'lastUpdated'> = {
      userId,
      userName: 'Current User',
      availableSlots: selectedSlots,
      isAnonymous: false
    };

    setResponses(prev => {
      const updated = prev.filter(r => r.userId !== userId);
      return [...updated, { ...response, lastUpdated: new Date() }];
    });

    try {
      await debouncedSubmitResponse(response);
    } catch (err) {
      console.error('Optimistic update failed:', err);
    }
  }, [userId, event, debouncedSubmitResponse]);

  const submitResponse = useCallback(async (response: Omit<AvailabilityResponse, 'lastUpdated'>) => {
    if (!userId) {
      throw new Error('User ID is required to submit response');
    }
    
    await AvailabilityService.submitAvailabilityResponse(eventId, userId, response);
  }, [eventId, userId]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;
      
      setLoading(true);
      try {
        await loadEvent();
        setupRealtimeUpdates();
        await loadAnalytics();
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [eventId, loadEvent, setupRealtimeUpdates, loadAnalytics]);

  const userResponse = userId 
    ? responses.find(response => response.userId === userId) || null
    : null;

  const optimalSlots = analytics?.optimalSlots || [];

  return {
    event,
    responses,
    analytics,
    userResponse,
    optimalSlots,
    loading,
    error,
    isConnected,
    updateUserAvailability,
    refreshData,
    submitResponse
  };
};

export const useAvailabilityEvents = (teamId: string) => {
  const [events, setEvents] = useState<AvailabilityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const teamEvents = await AvailabilityService.getTeamAvailabilityEvents(teamId);
      setEvents(teamEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      console.error('Error loading team availability events:', err);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const createEvent = useCallback(async (eventData: Omit<AvailabilityEvent, 'id' | 'createdAt'>) => {
    try {
      const eventId = await AvailabilityService.createAvailabilityEvent(eventData);
      await loadEvents();
      return eventId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    }
  }, [loadEvents]);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await AvailabilityService.deleteAvailabilityEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    }
  }, []);

  const archiveEvent = useCallback(async (eventId: string) => {
    try {
      await AvailabilityService.archiveAvailabilityEvent(eventId);
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive event');
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
    deleteEvent,
    archiveEvent,
    refreshEvents: loadEvents
  };
};