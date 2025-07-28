import { database } from './firebase';
import { ref as dbRef, set, get, push, remove, update, onValue, off } from 'firebase/database';
import { Group, IGroup } from '../models/Group';
import { User, IUser } from '../models/User';
import { Availability, IAvailability } from '../models/SimpleAvailability';

export class FirebaseGroupService {
  // Group operations
  static async saveGroup(group: Group): Promise<void> {
    console.log('[FIREBASE] Saving group to database:', group.id);
    try {
      const groupRef = dbRef(database, `groups/${group.id}`);
      await set(groupRef, group.toJSON());
      console.log('[FIREBASE] Group saved successfully');
    } catch (error) {
      console.error('[FIREBASE] Error saving group:', error);
      throw error;
    }
  }

  static async getGroup(groupId: string): Promise<Group | null> {
    console.log('[FIREBASE] Getting group from database:', groupId);
    try {
      const groupRef = dbRef(database, `groups/${groupId}`);
      const snapshot = await get(groupRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val() as IGroup;
        console.log('[FIREBASE] Group found:', data);
        return Group.fromJSON(data);
      } else {
        console.log('[FIREBASE] Group not found');
        return null;
      }
    } catch (error) {
      console.error('[FIREBASE] Error getting group:', error);
      throw error;
    }
  }

  static async deleteGroup(groupId: string): Promise<void> {
    console.log('[FIREBASE] Deleting group from database:', groupId);
    try {
      // Delete group data
      const groupRef = dbRef(database, `groups/${groupId}`);
      await remove(groupRef);
      
      // Delete all availability data for this group
      const availabilityRef = dbRef(database, `availability/${groupId}`);
      await remove(availabilityRef);
      
      // Delete group messages
      const messagesRef = dbRef(database, `messages/${groupId}`);
      await remove(messagesRef);
      
      console.log('[FIREBASE] Group deleted successfully');
    } catch (error) {
      console.error('[FIREBASE] Error deleting group:', error);
      throw error;
    }
  }

  static async findGroupByCode(code: string): Promise<Group | null> {
    console.log('[FIREBASE] Finding group by code:', code);
    try {
      const groupsRef = dbRef(database, 'groups');
      const snapshot = await get(groupsRef);
      
      if (snapshot.exists()) {
        const groups = snapshot.val();
        for (const groupId in groups) {
          const groupData = groups[groupId] as IGroup;
          if (groupData.code === code.toUpperCase()) {
            console.log('[FIREBASE] Group found by code:', groupData);
            return Group.fromJSON(groupData);
          }
        }
      }
      
      console.log('[FIREBASE] Group not found by code');
      return null;
    } catch (error) {
      console.error('[FIREBASE] Error finding group by code:', error);
      throw error;
    }
  }

  // User operations
  static async saveUser(user: User): Promise<void> {
    console.log('[FIREBASE] Saving user to database:', user.id);
    try {
      const userRef = dbRef(database, `users/${user.id}`);
      await set(userRef, user.toJSON());
      console.log('[FIREBASE] User saved successfully');
    } catch (error) {
      console.error('[FIREBASE] Error saving user:', error);
      throw error;
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    console.log('[FIREBASE] Getting user from database:', userId);
    try {
      const userRef = dbRef(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val() as IUser;
        console.log('[FIREBASE] User found:', data);
        return User.fromJSON(data);
      } else {
        console.log('[FIREBASE] User not found');
        return null;
      }
    } catch (error) {
      console.error('[FIREBASE] Error getting user:', error);
      throw error;
    }
  }

  static async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
    console.log('[FIREBASE] Removing user from group:', userId, groupId);
    try {
      // Update group to remove user from members list
      const groupRef = dbRef(database, `groups/${groupId}`);
      const groupSnapshot = await get(groupRef);
      
      if (groupSnapshot.exists()) {
        const groupData = groupSnapshot.val() as IGroup;
        const updatedMembers = groupData.members.filter(id => id !== userId);
        
        await update(groupRef, { members: updatedMembers });
        console.log('[FIREBASE] User removed from group members');
      }
      
      // Update user to remove groupId
      const userRef = dbRef(database, `users/${userId}`);
      await update(userRef, { groupId: null });
      
      // Remove user's availability for this group
      const availabilityRef = dbRef(database, `availability/${groupId}/${userId}`);
      await remove(availabilityRef);
      
      console.log('[FIREBASE] User successfully removed from group');
    } catch (error) {
      console.error('[FIREBASE] Error removing user from group:', error);
      throw error;
    }
  }

  // Availability operations
  static async saveAvailability(availability: Availability): Promise<void> {
    console.log('[FIREBASE] Saving availability to database:', availability.userId, availability.groupId);
    try {
      const availabilityRef = dbRef(database, `availability/${availability.groupId}/${availability.userId}`);
      await set(availabilityRef, availability.toJSON());
      console.log('[FIREBASE] Availability saved successfully');
    } catch (error) {
      console.error('[FIREBASE] Error saving availability:', error);
      throw error;
    }
  }

  static async getGroupAvailabilities(groupId: string): Promise<Availability[]> {
    console.log('[FIREBASE] Getting group availabilities:', groupId);
    try {
      const availabilityRef = dbRef(database, `availability/${groupId}`);
      const snapshot = await get(availabilityRef);
      
      const availabilities: Availability[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const userId in data) {
          const availabilityData = data[userId] as IAvailability;
          availabilities.push(Availability.fromJSON(availabilityData));
        }
      }
      
      console.log('[FIREBASE] Found', availabilities.length, 'availabilities');
      return availabilities;
    } catch (error) {
      console.error('[FIREBASE] Error getting group availabilities:', error);
      throw error;
    }
  }

  static async removeAvailability(userId: string, groupId: string): Promise<void> {
    console.log('[FIREBASE] Removing availability:', userId, groupId);
    try {
      const availabilityRef = dbRef(database, `availability/${groupId}/${userId}`);
      await remove(availabilityRef);
      console.log('[FIREBASE] Availability removed successfully');
    } catch (error) {
      console.error('[FIREBASE] Error removing availability:', error);
      throw error;
    }
  }

  // Message operations
  static async saveMessage(groupId: string, message: any): Promise<void> {
    console.log('[FIREBASE] Saving message to group:', groupId);
    try {
      const messagesRef = dbRef(database, `messages/${groupId}`);
      await push(messagesRef, message);
      console.log('[FIREBASE] Message saved successfully');
    } catch (error) {
      console.error('[FIREBASE] Error saving message:', error);
      throw error;
    }
  }

  static async getMessages(groupId: string): Promise<any[]> {
    console.log('[FIREBASE] Getting messages for group:', groupId);
    try {
      const messagesRef = dbRef(database, `messages/${groupId}`);
      const snapshot = await get(messagesRef);
      
      const messages: any[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const messageId in data) {
          messages.push({ id: messageId, ...data[messageId] });
        }
      }
      
      console.log('[FIREBASE] Found', messages.length, 'messages');
      return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('[FIREBASE] Error getting messages:', error);
      throw error;
    }
  }

  // Admin operations
  static async transferAdmin(groupId: string, newAdminId: string): Promise<void> {
    console.log('[FIREBASE] Transferring admin rights:', groupId, newAdminId);
    try {
      const groupRef = dbRef(database, `groups/${groupId}`);
      await update(groupRef, { adminId: newAdminId });
      console.log('[FIREBASE] Admin rights transferred successfully');
    } catch (error) {
      console.error('[FIREBASE] Error transferring admin rights:', error);
      throw error;
    }
  }

  static async updateGroupInfo(groupId: string, updates: Partial<IGroup>): Promise<void> {
    console.log('[FIREBASE] Updating group info:', groupId, updates);
    try {
      const groupRef = dbRef(database, `groups/${groupId}`);
      await update(groupRef, updates);
      console.log('[FIREBASE] Group info updated successfully');
    } catch (error) {
      console.error('[FIREBASE] Error updating group info:', error);
      throw error;
    }
  }

  // Clear all data (for logout)
  static async clearUserData(userId: string): Promise<void> {
    console.log('[FIREBASE] Clearing user data:', userId);
    try {
      const userRef = dbRef(database, `users/${userId}`);
      await remove(userRef);
      console.log('[FIREBASE] User data cleared successfully');
    } catch (error) {
      console.error('[FIREBASE] Error clearing user data:', error);
      throw error;
    }
  }
}