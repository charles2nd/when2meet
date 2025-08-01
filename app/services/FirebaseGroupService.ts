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
  
  // Real-time subscription tracking for cleanup
  private static activeSubscriptions: Map<string, () => void> = new Map();

  /**
   * Check if group name is unique in Firebase
   */
  // REMOVED: Group names can now be duplicated - only codes must be unique
  // Groups are identified by their unique 6-character codes, not names

  /**
   * Find a group by its unique code
   */
  static async findGroupByCode(code: string): Promise<Group | null> {
    console.log('[FIREBASE_GROUP] Finding group by code:', code);
    
    try {
      const cleanCode = code.trim().toUpperCase();
      const groupsQuery = query(
        collection(db, this.GROUPS_COLLECTION),
        where('code', '==', cleanCode)
      );
      const snapshot = await getDocs(groupsQuery);
      
      if (snapshot.empty) {
        console.log('[FIREBASE_GROUP] No group found with code:', cleanCode);
        return null;
      }
      
      const groupData = snapshot.docs[0].data();
      const group = Group.fromJSON(groupData as IGroup);
      console.log('[FIREBASE_GROUP] Found group:', group.name, 'Code:', group.code);
      
      return group;
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error finding group by code:', error);
      // Fallback to local storage
      return await LocalStorage.findGroupByCode(code);
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
      // Names can be duplicated - only codes must be unique

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
        // Removed nameSearchable - names can be duplicated, codes are unique identifiers
        memberDetails: [{
          id: groupData.adminUser.id,
          name: groupData.adminUser.name,
          ...(groupData.adminUser.email && { email: groupData.adminUser.email }),
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
        ...(groupData.adminUser.email && { email: groupData.adminUser.email }),
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
        ...(user.email && { email: user.email }),
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
        ...(user.email && { email: user.email }),
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
      // First, ensure user document exists in Firebase
      await this.ensureUserExists(userId);
      
      // Query groups where user is a member
      const groupsQuery = query(
        collection(db, this.GROUPS_COLLECTION),
        where('members', 'array-contains', userId)
      );
      
      const snapshot = await getDocs(groupsQuery);
      const groups = snapshot.docs.map(doc => {
        const data = doc.data();
        return Group.fromJSON({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      
      console.log('[FIREBASE_GROUP] ✅ Found', groups.length, 'groups for user in Firebase');
      
      // Update user document with current groups list for consistency
      if (groups.length > 0) {
        const userRef = doc(db, this.USERS_COLLECTION, userId);
        await updateDoc(userRef, {
          groups: groups.map(g => g.id),
          updatedAt: serverTimestamp()
        });
        console.log('[FIREBASE_GROUP] Updated user document with current groups');
      }
      
      // Cache locally (skip validation since data comes from Firebase)
      for (const group of groups) {
        await LocalStorage.saveGroup(group, true);
      }
      
      return groups;
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error getting user groups from Firebase:', error);
      // Fallback to local storage only as last resort
      console.log('[FIREBASE_GROUP] Using local storage fallback...');
      return await LocalStorage.getUserGroups(userId);
    }
  }

  /**
   * Ensure user document exists in Firebase with current auth data
   */
  static async ensureUserExists(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log('[FIREBASE_GROUP] Creating user document for:', userId);
        // Create basic user document - will be updated with real data later
        await setDoc(userRef, {
          id: userId,
          groups: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error ensuring user exists:', error);
      // Non-critical error - continue without user document
    }
  }
  
  /**
   * Update user data in Firebase with current auth information
   */
  static async updateUserData(user: IUser): Promise<void> {
    console.log('[FIREBASE_GROUP] Updating user data in Firebase:', user.id);
    
    try {
      const userRef = doc(db, this.USERS_COLLECTION, user.id);
      const userData: any = {
        id: user.id,
        name: user.name,
        language: user.language,
        updatedAt: serverTimestamp()
      };
      
      // Only add email if it exists
      if (user.email) {
        userData.email = user.email;
      }
      
      // Add phone number if it exists
      if (user.phoneNumber) {
        userData.phoneNumber = user.phoneNumber;
      }
      
      // Add auth method if it exists
      if (user.authMethod) {
        userData.authMethod = user.authMethod;
      }
      
      await setDoc(userRef, userData, { merge: true }); // merge: true preserves existing fields like groups
      
      console.log('[FIREBASE_GROUP] ✅ User data updated in Firebase');
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error updating user data:', error);
      // Non-critical error - continue without Firebase user update
    }
  }
  
  /**
   * Add user to an existing group
   */
  static async addUserToGroup(groupId: string, user: IUser): Promise<void> {
    console.log('[FIREBASE_GROUP] Adding user to group:', user.id, 'to', groupId);
    
    try {
      const batch = writeBatch(db);
      
      // 1. Update group document - add user to members array
      const groupRef = doc(db, this.GROUPS_COLLECTION, groupId);
      batch.update(groupRef, {
        members: arrayUnion(user.id),
        memberDetails: arrayUnion({
          id: user.id,
          name: user.name,
          ...(user.email && { email: user.email }),
          role: 'member',
          joinedAt: new Date().toISOString()
        }),
        updatedAt: serverTimestamp()
      });
      
      // 2. Update user document - add group to user's groups array
      const userRef = doc(db, this.USERS_COLLECTION, user.id);
      batch.set(userRef, {
        id: user.id,
        name: user.name,
        ...(user.email && { email: user.email }),
        groups: arrayUnion(groupId),
        currentGroupId: groupId,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // 3. Add join message to group chat
      const messagesRef = collection(db, this.GROUPS_COLLECTION, groupId, this.MESSAGES_SUBCOLLECTION);
      const messageRef = doc(messagesRef);
      batch.set(messageRef, {
        userId: 'system',
        userName: 'System',
        content: `${user.name} joined the group`,
        type: 'join',
        timestamp: serverTimestamp(),
        readBy: []
      });
      
      await batch.commit();
      console.log('[FIREBASE_GROUP] ✅ User successfully added to group in Firebase');
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error adding user to group:', error);
      throw error;
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
    console.log('[FIREBASE_GROUP] 💾 Saving availability for user:', availability.userId, 'in group:', availability.groupId);
    
    try {
      const availabilityId = `${availability.groupId}_${availability.userId}`;
      const availabilityRef = doc(db, this.AVAILABILITY_COLLECTION, availabilityId);
      
      // Add UTC timestamp for accurate cross-timezone coordination
      const utcTimestamp = new Date().toISOString();
      const availabilityData = {
        ...availability.toJSON(),
        updatedAt: serverTimestamp(),
        utcUpdatedAt: utcTimestamp,
        // Ensure group and user IDs are preserved
        groupId: availability.groupId,
        userId: availability.userId
      };
      
      // Atomic save to Firebase
      await setDoc(availabilityRef, availabilityData);
      
      // Always save locally as backup (with same timestamp)
      const localAvailability = availability.clone();
      localAvailability.updatedAt = utcTimestamp;
      await LocalStorage.saveAvailability(localAvailability);
      
      // Log activity as subcollection
      const activitiesRef = collection(db, this.GROUPS_COLLECTION, availability.groupId, this.ACTIVITIES_SUBCOLLECTION);
      await addDoc(activitiesRef, {
        userId: availability.userId,
        userName: 'User',
        action: 'updated_availability',
        timestamp: serverTimestamp(),
        utcTimestamp: utcTimestamp
      });
      
      console.log('[FIREBASE_GROUP] ✅ Availability saved successfully (Firebase + Local)');
    } catch (error) {
      console.error('[FIREBASE_GROUP] ❌ Error saving availability to Firebase:', error);
      
      // CRITICAL: Always save locally even if Firebase fails
      try {
        await LocalStorage.saveAvailability(availability);
        console.log('[FIREBASE_GROUP] 💾 Availability saved to local storage as fallback');
      } catch (localError) {
        console.error('[FIREBASE_GROUP] ❌ CRITICAL: Both Firebase and local save failed:', localError);
      }
      
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
   * Subscribe to real-time group availability updates
   * CRITICAL: Maintains Firebase connection during group switches
   */
  static subscribeToGroupAvailabilities(
    groupId: string,
    onUpdate: (availabilities: Availability[]) => void,
    onError?: (error: Error) => void
  ): (() => void) {
    console.log('[FIREBASE_GROUP] 🔄 Setting up real-time availability sync for group:', groupId);
    
    const availabilityQuery = query(
      collection(db, this.AVAILABILITY_COLLECTION),
      where('groupId', '==', groupId)
    );
    
    const unsubscribe = onSnapshot(
      availabilityQuery,
      async (snapshot) => {
        try {
          console.log('[FIREBASE_GROUP] 📡 Real-time availability update:', snapshot.docs.length, 'availabilities');
          
          const availabilities = snapshot.docs.map(doc => {
            const data = doc.data();
            return Availability.fromJSON(data as IAvailability);
          });
          
          // Cache locally for offline access
          for (const availability of availabilities) {
            await LocalStorage.saveAvailability(availability);
          }
          
          onUpdate(availabilities);
        } catch (error) {
          console.error('[FIREBASE_GROUP] Real-time availability update error:', error);
          if (onError) {
            onError(error as Error);
          }
        }
      },
      (error) => {
        console.error('[FIREBASE_GROUP] Real-time availability subscription error:', error);
        if (onError) {
          onError(error);
        }
        // Fallback to local storage
        LocalStorage.getGroupAvailabilities(groupId).then(onUpdate).catch(console.error);
      }
    );
    
    // Track subscription for cleanup
    const subscriptionKey = `availability_${groupId}`;
    this.activeSubscriptions.set(subscriptionKey, unsubscribe);
    
    return () => {
      unsubscribe();
      this.activeSubscriptions.delete(subscriptionKey);
    };
  }

  /**
   * Subscribe to specific user's availability across all groups
   * CRITICAL: Preserves user's calendar data during group switches
   */
  static subscribeToUserAvailabilities(
    userId: string,
    onUpdate: (availabilities: Availability[]) => void,
    onError?: (error: Error) => void
  ): (() => void) {
    console.log('[FIREBASE_GROUP] 🔄 Setting up user availability sync for:', userId);
    
    const userAvailabilityQuery = query(
      collection(db, this.AVAILABILITY_COLLECTION),
      where('userId', '==', userId)
    );
    
    const unsubscribe = onSnapshot(
      userAvailabilityQuery,
      async (snapshot) => {
        try {
          console.log('[FIREBASE_GROUP] 📡 User availability update:', snapshot.docs.length, 'records');
          
          const availabilities = snapshot.docs.map(doc => {
            const data = doc.data();
            return Availability.fromJSON(data as IAvailability);
          });
          
          // Cache all user's availabilities locally
          for (const availability of availabilities) {
            await LocalStorage.saveAvailability(availability);
          }
          
          onUpdate(availabilities);
        } catch (error) {
          console.error('[FIREBASE_GROUP] User availability update error:', error);
          if (onError) {
            onError(error as Error);
          }
        }
      },
      (error) => {
        console.error('[FIREBASE_GROUP] User availability subscription error:', error);
        if (onError) {
          onError(error);
        }
      }
    );
    
    // Track subscription for cleanup
    const subscriptionKey = `user_availability_${userId}`;
    this.activeSubscriptions.set(subscriptionKey, unsubscribe);
    
    return () => {
      unsubscribe();
      this.activeSubscriptions.delete(subscriptionKey);
    };
  }

  /**
   * Get user's availability for specific group with fallback
   * CRITICAL: Ensures data persistence across group operations
   */
  static async getUserAvailabilityForGroup(
    userId: string,
    groupId: string
  ): Promise<Availability | null> {
    console.log('[FIREBASE_GROUP] Getting user availability:', { userId, groupId });
    
    try {
      const availabilityId = `${groupId}_${userId}`;
      const availabilityRef = doc(db, this.AVAILABILITY_COLLECTION, availabilityId);
      const snapshot = await getDoc(availabilityRef);
      
      if (snapshot.exists()) {
        const availability = Availability.fromJSON(snapshot.data() as IAvailability);
        // Cache locally
        await LocalStorage.saveAvailability(availability);
        console.log('[FIREBASE_GROUP] ✅ Found user availability in Firebase');
        return availability;
      } else {
        console.log('[FIREBASE_GROUP] ⚠️ No Firebase availability, checking local storage');
        // Fallback to local storage
        return await LocalStorage.getAvailability(userId, groupId);
      }
    } catch (error) {
      console.error('[FIREBASE_GROUP] Error getting user availability:', error);
      // Always fallback to local storage
      return await LocalStorage.getAvailability(userId, groupId);
    }
  }

  /**
   * Cleanup subscription when switching groups
   * CRITICAL: Prevents memory leaks and ensures clean group switches
   */
  static cleanupSubscription(subscriptionKey: string): void {
    const unsubscribe = this.activeSubscriptions.get(subscriptionKey);
    if (unsubscribe) {
      console.log('[FIREBASE_GROUP] 🧹 Cleaning up subscription:', subscriptionKey);
      unsubscribe();
      this.activeSubscriptions.delete(subscriptionKey);
    }
  }

  /**
   * Cleanup all active subscriptions
   * CRITICAL: Call when user logs out or app backgrounded
   */
  static cleanupAllSubscriptions(): void {
    console.log('[FIREBASE_GROUP] 🧹 Cleaning up all subscriptions:', this.activeSubscriptions.size);
    this.activeSubscriptions.forEach((unsubscribe, key) => {
      console.log('[FIREBASE_GROUP] 🧹 Cleaning up:', key);
      unsubscribe();
    });
    this.activeSubscriptions.clear();
  }

  /**
   * Enhanced availability sync with retry logic
   * CRITICAL: Ensures data persistence during network issues
   */
  static async syncAvailabilityWithRetry(
    availability: Availability,
    maxRetries: number = 3
  ): Promise<void> {
    let attempt = 0;
    let lastError: Error | null = null;
    
    while (attempt < maxRetries) {
      try {
        console.log(`[FIREBASE_GROUP] 🔄 Sync attempt ${attempt + 1}/${maxRetries}`);
        await this.saveAvailability(availability);
        console.log('[FIREBASE_GROUP] ✅ Sync successful');
        return;
      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`[FIREBASE_GROUP] ⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error('[FIREBASE_GROUP] ❌ All sync attempts failed:', lastError);
    throw lastError;
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