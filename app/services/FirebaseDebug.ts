/**
 * Firebase Debug Utilities
 * Helper functions to debug Firebase data
 */

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export class FirebaseDebug {
  /**
   * List all groups in Firebase
   */
  static async listAllGroups(): Promise<void> {
    console.log('[FIREBASE_DEBUG] ========================================');
    console.log('[FIREBASE_DEBUG] LISTING ALL GROUPS IN FIREBASE');
    console.log('[FIREBASE_DEBUG] ========================================');
    
    try {
      const groupsQuery = query(
        collection(db, 'groups'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(groupsQuery);
      
      console.log('[FIREBASE_DEBUG] Total groups found:', snapshot.size);
      
      if (snapshot.empty) {
        console.log('[FIREBASE_DEBUG] ❌ No groups found in Firebase');
        return;
      }
      
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`[FIREBASE_DEBUG] Group ${index + 1}:`, {
          id: doc.id,
          name: data.name,
          code: data.code, // Primary identifier - must be unique
          members: data.members,
          memberCount: data.members ? data.members.length : 0,
          adminId: data.adminId,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || 'No timestamp',
        });
      });
      
    } catch (error) {
      console.error('[FIREBASE_DEBUG] Error listing groups:', error);
    }
    
    console.log('[FIREBASE_DEBUG] ========================================');
  }

  /**
   * Clear all groups from Firebase (for testing only)
   */
  static async clearAllGroups(): Promise<void> {
    console.log('[FIREBASE_DEBUG] ⚠️  CLEARING ALL GROUPS FROM FIREBASE');
    
    try {
      const snapshot = await getDocs(collection(db, 'groups'));
      
      if (snapshot.empty) {
        console.log('[FIREBASE_DEBUG] No groups to clear');
        return;
      }
      
      console.log('[FIREBASE_DEBUG] Deleting', snapshot.size, 'groups...');
      
      // Note: In production, you'd want to use batch operations
      // This is just for debugging
      for (const doc of snapshot.docs) {
        await doc.ref.delete();
        console.log('[FIREBASE_DEBUG] Deleted group:', doc.data().name);
      }
      
      console.log('[FIREBASE_DEBUG] ✅ All groups cleared');
    } catch (error) {
      console.error('[FIREBASE_DEBUG] Error clearing groups:', error);
    }
  }
}