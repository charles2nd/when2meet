import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  runTransaction,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import {
  AvailabilityEvent,
  AvailabilityResponse,
  AvailabilityAnalytics,
  OptimalTimeSlot,
  TimeSlot
} from '../utils/types';

const COLLECTIONS = {
  AVAILABILITY_EVENTS: 'availability-events',
  AVAILABILITY_RESPONSES: 'availability-responses',
  AVAILABILITY_ANALYTICS: 'availability-analytics'
} as const;

export class AvailabilityService {
  static async createAvailabilityEvent(eventData: Omit<AvailabilityEvent, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.AVAILABILITY_EVENTS), {
      ...eventData,
      createdAt: serverTimestamp(),
      shareableLink: this.generateShareableLink()
    });
    return docRef.id;
  }

  static async getAvailabilityEvent(eventId: string): Promise<AvailabilityEvent | null> {
    const docRef = doc(db, COLLECTIONS.AVAILABILITY_EVENTS, eventId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AvailabilityEvent;
    }
    return null;
  }

  static async getTeamAvailabilityEvents(teamId: string): Promise<AvailabilityEvent[]> {
    const q = query(
      collection(db, COLLECTIONS.AVAILABILITY_EVENTS),
      where('teamId', '==', teamId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AvailabilityEvent[];
  }

  static async updateAvailabilityEvent(eventId: string, updates: Partial<AvailabilityEvent>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.AVAILABILITY_EVENTS, eventId);
    await updateDoc(docRef, updates);
  }

  static async deleteAvailabilityEvent(eventId: string): Promise<void> {
    const batch = writeBatch(db);
    
    const eventRef = doc(db, COLLECTIONS.AVAILABILITY_EVENTS, eventId);
    batch.delete(eventRef);
    
    const responsesRef = collection(db, COLLECTIONS.AVAILABILITY_RESPONSES, eventId, 'responses');
    const responsesSnapshot = await getDocs(responsesRef);
    responsesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  static async submitAvailabilityResponse(
    eventId: string, 
    userId: string, 
    response: Omit<AvailabilityResponse, 'lastUpdated'>
  ): Promise<void> {
    return runTransaction(db, async (transaction) => {
      const responseRef = doc(db, COLLECTIONS.AVAILABILITY_RESPONSES, eventId, 'responses', userId);
      
      transaction.set(responseRef, {
        ...response,
        lastUpdated: serverTimestamp()
      });

      await this.recalculateAnalytics(eventId, transaction);
    });
  }

  static async getAvailabilityResponses(eventId: string): Promise<AvailabilityResponse[]> {
    const responsesRef = collection(db, COLLECTIONS.AVAILABILITY_RESPONSES, eventId, 'responses');
    const querySnapshot = await getDocs(responsesRef);
    
    return querySnapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data()
    })) as AvailabilityResponse[];
  }

  static onAvailabilityUpdate(eventId: string, callback: (responses: AvailabilityResponse[]) => void) {
    const responsesRef = collection(db, COLLECTIONS.AVAILABILITY_RESPONSES, eventId, 'responses');
    
    return onSnapshot(responsesRef, (snapshot) => {
      const responses = snapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      })) as AvailabilityResponse[];
      
      callback(responses);
    });
  }

  static async getAvailabilityAnalytics(eventId: string): Promise<AvailabilityAnalytics | null> {
    const docRef = doc(db, COLLECTIONS.AVAILABILITY_ANALYTICS, eventId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { eventId, ...docSnap.data() } as AvailabilityAnalytics;
    }
    return null;
  }

  private static async recalculateAnalytics(eventId: string, transaction?: any): Promise<void> {
    const responses = await this.getAvailabilityResponses(eventId);
    const event = await this.getAvailabilityEvent(eventId);
    
    if (!event) return;

    const analytics = this.calculateOptimalSlots(event.timeSlots, responses);
    const analyticsRef = doc(db, COLLECTIONS.AVAILABILITY_ANALYTICS, eventId);
    
    const analyticsData = {
      optimalSlots: analytics,
      participationSummary: {
        totalParticipants: event.participants.length,
        respondedCount: responses.length,
        responseRate: responses.length / event.participants.length,
        mostPopularSlots: analytics.slice(0, 5).map(slot => slot.timeSlot),
        leastPopularSlots: analytics.slice(-5).map(slot => slot.timeSlot)
      },
      lastCalculated: serverTimestamp()
    };

    if (transaction) {
      transaction.set(analyticsRef, analyticsData);
    } else {
      await updateDoc(analyticsRef, analyticsData);
    }
  }

  private static calculateOptimalSlots(timeSlots: TimeSlot[], responses: AvailabilityResponse[]): OptimalTimeSlot[] {
    return timeSlots.map(slot => {
      const availableUsers = responses
        .filter(response => response.availableSlots.includes(slot.id))
        .map(response => response.userId);
      
      const conflictingUsers = responses
        .filter(response => !response.availableSlots.includes(slot.id))
        .map(response => response.userId);
      
      const score = responses.length > 0 ? availableUsers.length / responses.length : 0;
      
      return {
        timeSlot: slot,
        availableCount: availableUsers.length,
        availableUsers,
        conflictingUsers,
        score
      };
    }).sort((a, b) => b.score - a.score);
  }

  private static generateShareableLink(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  static async cloneAvailabilityEvent(eventId: string, updates: Partial<AvailabilityEvent>): Promise<string> {
    const originalEvent = await this.getAvailabilityEvent(eventId);
    if (!originalEvent) {
      throw new Error('Event not found');
    }

    const { id, createdAt, responses, shareableLink, ...eventData } = originalEvent;
    return this.createAvailabilityEvent({
      ...eventData,
      ...updates,
      responses: []
    });
  }

  static async archiveAvailabilityEvent(eventId: string): Promise<void> {
    await this.updateAvailabilityEvent(eventId, { status: 'archived' });
  }

  static async closeAvailabilityEvent(eventId: string): Promise<void> {
    await this.updateAvailabilityEvent(eventId, { status: 'closed' });
  }
}