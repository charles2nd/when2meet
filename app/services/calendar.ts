import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { CalendarEvent } from '../utils/types';

const COLLECTION_NAME = 'calendar-events';

export class CalendarService {
  static async createEvent(eventData: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...eventData,
      createdAt: new Date(),
      startTime: Timestamp.fromDate(eventData.startTime),
      endTime: Timestamp.fromDate(eventData.endTime)
    });
    return docRef.id;
  }

  static async getTeamEvents(teamId: string): Promise<CalendarEvent[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('teamId', '==', teamId),
      orderBy('startTime', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startTime: data.startTime.toDate(),
        endTime: data.endTime.toDate(),
        createdAt: data.createdAt.toDate()
      };
    }) as CalendarEvent[];
  }

  static async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, eventId);
    const updateData = { ...updates };
    
    if (updates.startTime) {
      updateData.startTime = Timestamp.fromDate(updates.startTime);
    }
    if (updates.endTime) {
      updateData.endTime = Timestamp.fromDate(updates.endTime);
    }
    
    await updateDoc(docRef, updateData);
  }

  static async deleteEvent(eventId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, eventId);
    await deleteDoc(docRef);
  }

  static async linkAvailabilityEvent(eventId: string, availabilityEventId: string): Promise<void> {
    await this.updateEvent(eventId, { availabilityEventId });
  }
}