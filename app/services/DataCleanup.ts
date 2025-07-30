/**
 * Data Cleanup Utilities
 * Helper functions to clean up orphaned or conflicting data
 */

import { LocalStorage } from './LocalStorage';
import { FirebaseDebug } from './FirebaseDebug';

export class DataCleanup {
  /**
   * Clear all local group data
   */
  static async clearLocalGroups(): Promise<void> {
    console.log('[DATA_CLEANUP] Clearing all local group data...');
    
    try {
      // This would require implementing methods in LocalStorage
      await LocalStorage.clearAllGroups();
      console.log('[DATA_CLEANUP] ✅ Local group data cleared');
    } catch (error) {
      console.error('[DATA_CLEANUP] Error clearing local groups:', error);
    }
  }

  /**
   * Reset everything and start fresh
   */
  static async resetAllData(): Promise<void> {
    console.log('[DATA_CLEANUP] ⚠️  RESETTING ALL DATA');
    
    try {
      // Clear local data
      await this.clearLocalGroups();
      
      // List current Firebase data
      await FirebaseDebug.listAllGroups();
      
      console.log('[DATA_CLEANUP] ✅ Reset complete');
    } catch (error) {
      console.error('[DATA_CLEANUP] Error during reset:', error);
    }
  }

  /**
   * Debug current state
   */
  static async debugCurrentState(): Promise<void> {
    console.log('[DATA_CLEANUP] ========================================');
    console.log('[DATA_CLEANUP] CURRENT DATA STATE DEBUG');
    console.log('[DATA_CLEANUP] ========================================');
    
    // List Firebase groups
    await FirebaseDebug.listAllGroups();
    
    // List local groups (would need LocalStorage method)
    try {
      console.log('[DATA_CLEANUP] Local storage group count: [Need to implement LocalStorage.getGroupCount()]');
    } catch (error) {
      console.error('[DATA_CLEANUP] Error checking local groups:', error);
    }
  }
}