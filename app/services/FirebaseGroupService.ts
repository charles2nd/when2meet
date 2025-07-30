/**
 * Firebase Group Service
 * Complete Firebase persistence for groups, members, chats, and all related data
 * Based on Firebase best practices for React Native 2024
 */

import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  writeBatch,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { Group, IGroup } from '../models/Group';
import { User, IUser } from '../models/User';
import { Availability, IAvailability } from '../models/SimpleAvailability';
import { LocalStorage } from './LocalStorage';

// Message interface for group chat
export interface IMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system' | 'join' | 'leave';
  readBy?: string[]; // User IDs who have read this message
}

// Group activity log
export interface IGroupActivity {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  action: 'created' | 'joined' | 'left' | 'updated_availability' | 'sent_message' | 'admin_change';
  timestamp: string;
  details?: any;
}

export class FirebaseGroupService {
  // Collection names - Following Firestore best practices
  private static readonly GROUPS_COLLECTION = 'groups';
  private static readonly USERS_COLLECTION = 'users';
  private static readonly AVAILABILITY_COLLECTION = 'availability';
  
  // Subcollections (nested under groups)
  private static readonly MESSAGES_SUBCOLLECTION = 'messages';
  private static readonly ACTIVITIES_SUBCOLLECTION = 'activities';

  /**
   * Check if group name is unique in Firebase
   */
  static async isGroupNameUnique(name: string): Promise<boolean> {
    console.log('[FIREBASE_GROUP] Checking name uniqueness in Firebase:', name);
    
    try {
      const cleanName = name.trim().toLowerCase();
      const groupsQuery = query(
        collection(db, this.GROUPS_COLLECTION),
        where('nameSearchable', '==', cleanName)
      );
      const snapshot = await getDocs(groupsQuery);
      
      const isUnique = snapshot.empty;
      console.log('[FIREBASE_GROUP] Name unique check result:', isUnique, 'for name:', name);
      
      if (!isUnique) {
        console.log('[FIREBASE_GROUP] Found existing groups with same name:', snapshot.docs.map(doc => doc.data().name));
      }
      
      return isUnique;
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error checking name uniqueness:', error);
      // On error, fallback to local check
      return await LocalStorage.isGroupNameUnique(name);
    }
  }

  /**
   * Create a new group with complete Firebase persistence
   */
  static async createGroup(groupData: {
    name: string;
    adminUser: IUser;
  }): Promise<Group> {
    console.log('[FIREBASE_GROUP] Creating new group:', groupData.name);
    
    try {
      // Check for unique name in Firebase first
      const isNameUnique = await this.isGroupNameUnique(groupData.name.trim());
      if (!isNameUnique) {
        throw new Error(`Group name "${groupData.name.trim()}" already exists in database`);
      }

      // Generate unique code
      const uniqueCode = await LocalStorage.generateUniqueGroupCode();
      
      // Create group object
      const group = new Group({
        name: groupData.name.trim(),
        code: uniqueCode,
        adminId: groupData.adminUser.id
      });
      group.addMember(groupData.adminUser.id);

      // Validate group
      const validation = group.validate();
      if (!validation.isValid) {
        throw new Error(`Invalid group data: ${validation.errors.join(', ')}`);
      }

      // Create a batch write for atomic operation
      const batch = writeBatch(db);

      // 1. Save group to Firebase
      const groupRef = doc(db, this.GROUPS_COLLECTION, group.id);
      batch.set(groupRef, {
        ...group.toJSON(),
        nameSearchable: group.name.toLowerCase(), // For case-insensitive search
        memberDetails: [{
          id: groupData.adminUser.id,
          name: groupData.adminUser.name,
          email: groupData.adminUser.email,
          role: 'admin',
          joinedAt: new Date().toISOString()
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Create or update user document with group membership
      const userRef = doc(db, this.USERS_COLLECTION, groupData.adminUser.id);
      batch.set(userRef, {
        id: groupData.adminUser.id,
        name: groupData.adminUser.name,
        email: groupData.adminUser.email,
        groups: arrayUnion(group.id),
        currentGroupId: group.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true }); // merge: true will create or update

      // 3. Create initial system message as subcollection
      const messagesRef = collection(db, this.GROUPS_COLLECTION, group.id, this.MESSAGES_SUBCOLLECTION);
      const messageRef = doc(messagesRef);
      batch.set(messageRef, {
        userId: 'system',
        userName: 'System',
        content: `Group "${group.name}" created by ${groupData.adminUser.name}`,
        type: 'system',
        timestamp: serverTimestamp(),
        readBy: []
      });

      // 4. Log activity as subcollection
      const activitiesRef = collection(db, this.GROUPS_COLLECTION, group.id, this.ACTIVITIES_SUBCOLLECTION);
      const activityRef = doc(activitiesRef);
      batch.set(activityRef, {
        userId: groupData.adminUser.id,
        userName: groupData.adminUser.name,
        action: 'created',
        timestamp: serverTimestamp(),
        details: {
          groupName: group.name,
          groupCode: group.code
        }
      });

      // Commit the batch
      await batch.commit();
      console.log('[FIREBASE_GROUP] Group created successfully in Firebase:', group.id);

      // Also save to local storage for offline access (skip validation since Firebase already validated)
      await LocalStorage.saveGroup(group, true);
      
      return group;
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error creating group:', error);
      throw error;
    }
  }

  /**
   * Join an existing group
   */
  static async joinGroup(code: string, user: IUser): Promise<Group> {
    console.log('[FIREBASE_GROUP] User joining group with code:', code);
    
    try {
      const cleanCode = code.trim().toUpperCase();
      
      // Query Firebase for the group
      const groupsQuery = query(
        collection(db, this.GROUPS_COLLECTION),
        where('code', '==', cleanCode)
      );
      const snapshot = await getDocs(groupsQuery);
      
      if (snapshot.empty) {
        throw new Error('Invalid group code');
      }

      const groupDoc = snapshot.docs[0];
      const groupData = groupDoc.data();
      const group = Group.fromJSON({ ...groupData, id: groupDoc.id });

      // Check if user is already a member
      if (group.members.includes(user.id)) {
        console.log('[FIREBASE_GROUP] User is already a member');
        return group;
      }

      // Create batch for atomic updates
      const batch = writeBatch(db);

      // 1. Update group members
      const memberDetails = groupData.memberDetails || [];
      memberDetails.push({
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'member',
        joinedAt: new Date().toISOString()
      });

      batch.update(groupDoc.ref, {
        members: arrayUnion(user.id),
        memberDetails: memberDetails,
        updatedAt: serverTimestamp()
      });

      // 2. Create or update user document
      const userRef = doc(db, this.USERS_COLLECTION, user.id);
      batch.set(userRef, {
        id: user.id,
        name: user.name,
        email: user.email,
        groups: arrayUnion(group.id),
        currentGroupId: group.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true }); // merge: true will create or update

      // 3. Create join message as subcollection
      const messagesRef = collection(db, this.GROUPS_COLLECTION, group.id, this.MESSAGES_SUBCOLLECTION);
      const messageRef = doc(messagesRef);
      batch.set(messageRef, {
        userId: 'system',
        userName: 'System',
        content: `${user.name} joined the group`,
        type: 'join',
        timestamp: serverTimestamp(),
        readBy: []
      });

      // 4. Log activity as subcollection
      const activitiesRef = collection(db, this.GROUPS_COLLECTION, group.id, this.ACTIVITIES_SUBCOLLECTION);
      const activityRef = doc(activitiesRef);
      batch.set(activityRef, {
        userId: user.id,
        userName: user.name,
        action: 'joined',
        timestamp: serverTimestamp()
      });

      // Commit batch
      await batch.commit();
      console.log('[FIREBASE_GROUP] User joined group successfully');

      // Update local group object
      group.addMember(user.id);
      
      // Save to local storage (skip validation since Firebase already validated)
      await LocalStorage.saveGroup(group, true);
      
      return group;
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error joining group:', error);
      throw error;
    }
  }

  /**
   * Leave a group
   */
  static async leaveGroup(groupId: string, userId: string): Promise<void> {
    console.log('[FIREBASE_GROUP] User leaving group:', groupId);
    
    try {
      const batch = writeBatch(db);

      // 1. Update group document
      const groupRef = doc(db, this.GROUPS_COLLECTION, groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();
      const memberDetails = groupData.memberDetails || [];
      const updatedMemberDetails = memberDetails.filter((m: any) => m.id !== userId);
      const leavingUser = memberDetails.find((m: any) => m.id === userId);

      batch.update(groupRef, {
        members: arrayRemove(userId),
        memberDetails: updatedMemberDetails,
        updatedAt: serverTimestamp()
      });

      // 2. Update user document (use set with merge for safety)
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      batch.set(userRef, {
        groups: arrayRemove(groupId),
        currentGroupId: null,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 3. Create leave message as subcollection
      const messagesRef = collection(db, this.GROUPS_COLLECTION, groupId, this.MESSAGES_SUBCOLLECTION);
      const messageRef = doc(messagesRef);
      batch.set(messageRef, {
        userId: 'system',
        userName: 'System',
        content: `${leavingUser?.name || 'A member'} left the group`,
        type: 'leave',
        timestamp: serverTimestamp(),
        readBy: []
      });

      // 4. Log activity as subcollection
      const activitiesRef = collection(db, this.GROUPS_COLLECTION, groupId, this.ACTIVITIES_SUBCOLLECTION);
      const activityRef = doc(activitiesRef);
      batch.set(activityRef, {
        userId: userId,
        userName: leavingUser?.name || 'Unknown',
        action: 'left',
        timestamp: serverTimestamp()
      });

      // Commit batch
      await batch.commit();
      console.log('[FIREBASE_GROUP] User left group successfully');
      
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error leaving group:', error);
      throw error;
    }
  }

  /**
   * Get all groups for a user
   */
  static async getUserGroups(userId: string): Promise<Group[]> {
    console.log('[FIREBASE_GROUP] Getting groups for user:', userId);
    
    try {
      const groupsQuery = query(
        collection(db, this.GROUPS_COLLECTION),
        where('members', 'array-contains', userId)
      );
      
      const snapshot = await getDocs(groupsQuery);
      const groups = snapshot.docs.map(doc => {
        const data = doc.data();
        return Group.fromJSON({ ...data, id: doc.id });
      });
      
      console.log('[FIREBASE_GROUP] Found', groups.length, 'groups for user');
      
      // Cache locally (skip validation since data comes from Firebase)
      for (const group of groups) {
        await LocalStorage.saveGroup(group, true);
      }
      
      return groups;
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error getting user groups:', error);
      // Fallback to local storage
      return await LocalStorage.getUserGroups(userId);
    }
  }

  /**
   * Send a message to group chat
   */
  static async sendMessage(
    groupId: string, 
    userId: string, 
    userName: string, 
    content: string
  ): Promise<void> {
    console.log('[FIREBASE_GROUP] Sending message to group:', groupId);
    
    try {
      // Use subcollection for messages
      const messagesRef = collection(db, this.GROUPS_COLLECTION, groupId, this.MESSAGES_SUBCOLLECTION);
      await addDoc(messagesRef, {
        userId,
        userName,
        content,
        type: 'text',
        timestamp: serverTimestamp(),
        readBy: [userId] // Mark as read by sender
      });
      
      console.log('[FIREBASE_GROUP] Message sent successfully');
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a group with pagination
   */
  static async getGroupMessages(
    groupId: string, 
    limitCount: number = 50,
    lastMessage?: DocumentData
  ): Promise<IMessage[]> {
    console.log('[FIREBASE_GROUP] Getting messages for group:', groupId);
    
    try {
      // Use subcollection for messages
      const messagesRef = collection(db, this.GROUPS_COLLECTION, groupId, this.MESSAGES_SUBCOLLECTION);
      let messagesQuery = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      if (lastMessage) {
        messagesQuery = query(messagesQuery, startAfter(lastMessage));
      }
      
      const snapshot = await getDocs(messagesQuery);
      const messages: IMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: groupId, // Set from parameter since it's in subcollection
          userId: data.userId,
          userName: data.userName,
          content: data.content,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
          type: data.type || 'text',
          readBy: data.readBy || []
        };
      });
      
      // Return in chronological order
      return messages.reverse();
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error getting messages:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time group updates
   */
  static subscribeToGroup(
    groupId: string, 
    callback: (group: Group | null) => void
  ): () => void {
    console.log('[FIREBASE_GROUP] Subscribing to group updates:', groupId);
    
    const unsubscribe = onSnapshot(
      doc(db, this.GROUPS_COLLECTION, groupId),
      { includeMetadataChanges: true },
      (doc) => {
        if (doc.exists()) {
          const group = Group.fromJSON({ ...doc.data(), id: doc.id });
          
          // Update local cache (skip validation since data comes from Firebase)
          LocalStorage.saveGroup(group, true);
          callback(group);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('[FIREBASE_GROUP] Subscription error:', error);
        // Fallback to cached data
        LocalStorage.getGroup(groupId).then(callback);
      }
    );
    
    return unsubscribe;
  }

  /**
   * Subscribe to real-time messages
   */
  static subscribeToMessages(
    groupId: string,
    callback: (messages: IMessage[]) => void
  ): () => void {
    console.log('[FIREBASE_GROUP] Subscribing to messages:', groupId);
    
    // Use subcollection for messages
    const messagesRef = collection(db, this.GROUPS_COLLECTION, groupId, this.MESSAGES_SUBCOLLECTION);
    const messagesQuery = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages: IMessage[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            groupId: groupId, // Set from parameter since it's in subcollection
            userId: data.userId,
            userName: data.userName,
            content: data.content,
            timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
            type: data.type || 'text',
            readBy: data.readBy || []
          };
        });
        
        // Return in chronological order
        callback(messages.reverse());
      },
      (error) => {
        console.error('[FIREBASE_GROUP] Messages subscription error:', error);
        callback([]);
      }
    );
    
    return unsubscribe;
  }

  /**
   * Save user availability to Firebase
   */
  static async saveAvailability(availability: Availability): Promise<void> {
    console.log('[FIREBASE_GROUP] Saving availability for user:', availability.userId);
    
    try {
      const availabilityId = `${availability.groupId}_${availability.userId}`;
      const availabilityRef = doc(db, this.AVAILABILITY_COLLECTION, availabilityId);
      
      await setDoc(availabilityRef, {
        ...availability.toJSON(),
        updatedAt: serverTimestamp()
      });
      
      // Log activity as subcollection
      const activitiesRef = collection(db, this.GROUPS_COLLECTION, availability.groupId, this.ACTIVITIES_SUBCOLLECTION);
      await addDoc(activitiesRef, {
        userId: availability.userId,
        userName: 'User',
        action: 'updated_availability',
        timestamp: serverTimestamp()
      });
      
      console.log('[FIREBASE_GROUP] Availability saved successfully');
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error saving availability:', error);
      throw error;
    }
  }

  /**
   * Get group availabilities
   */
  static async getGroupAvailabilities(groupId: string): Promise<Availability[]> {
    console.log('[FIREBASE_GROUP] Getting availabilities for group:', groupId);
    
    try {
      const availabilityQuery = query(
        collection(db, this.AVAILABILITY_COLLECTION),
        where('groupId', '==', groupId)
      );
      
      const snapshot = await getDocs(availabilityQuery);
      const availabilities = snapshot.docs.map(doc => {
        const data = doc.data();
        return Availability.fromJSON(data as IAvailability);
      });
      
      console.log('[FIREBASE_GROUP] Found', availabilities.length, 'availabilities');
      
      // Cache locally
      for (const availability of availabilities) {
        await LocalStorage.saveAvailability(availability);
      }
      
      return availabilities;
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error getting availabilities:', error);
      // Fallback to local storage
      return await LocalStorage.getGroupAvailabilities(groupId);
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(groupId: string, messageIds: string[], userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      for (const messageId of messageIds) {
        // Use subcollection for messages
        const messageRef = doc(db, this.GROUPS_COLLECTION, groupId, this.MESSAGES_SUBCOLLECTION, messageId);
        batch.update(messageRef, {
          readBy: arrayUnion(userId)
        });
      }
      
      await batch.commit();
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error marking messages as read:', error);
    }
  }

  /**
   * Get group activity log
   */
  static async getGroupActivities(
    groupId: string,
    limitCount: number = 20
  ): Promise<IGroupActivity[]> {
    try {
      // Use subcollection for activities
      const activitiesRef = collection(db, this.GROUPS_COLLECTION, groupId, this.ACTIVITIES_SUBCOLLECTION);
      const activitiesQuery = query(
        activitiesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(activitiesQuery);
      const activities: IGroupActivity[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: groupId, // Set from parameter since it's in subcollection
          userId: data.userId,
          userName: data.userName,
          action: data.action,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
          details: data.details
        };
      });
      
      return activities;
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error getting activities:', error);
      return [];
    }
  }
}