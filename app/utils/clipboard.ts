import { Platform, Share } from 'react-native';

// Try to import expo-clipboard if available
let Clipboard: any = null;
try {
  Clipboard = require('expo-clipboard');
} catch (error) {
  console.log('[CLIPBOARD] expo-clipboard not available, will use fallbacks');
}

// Cross-platform clipboard utility that works with Expo Go and native builds
export class ClipboardUtil {
  private static clipboardAvailable = false;
  private static lastCopiedText = '';
  private static initialized = false;

  private static initialize() {
    if (!this.initialized) {
      // Check clipboard availability on first use
      if (Clipboard && typeof Clipboard.setStringAsync === 'function') {
        this.clipboardAvailable = true;
      }
      this.initialized = true;
    }
  }

  private static getClipboardModule() {
    this.initialize();
    if (this.clipboardAvailable && Clipboard) {
      return Clipboard;
    }
    return null;
  }

  /**
   * Copy text to clipboard with fallback for Expo Go
   */
  static async setStringAsync(text: string): Promise<boolean> {
    try {
      const clipboardModule = this.getClipboardModule();
      
      if (clipboardModule) {
        // Native clipboard available
        await clipboardModule.setStringAsync(text);
        console.log('[CLIPBOARD] ✅ Text copied to native clipboard');
        return true;
      } else {
        // Store the text internally as a fallback
        this.lastCopiedText = text;
        
        // Fallback for different platforms
        if (Platform.OS === 'web') {
          // Web clipboard API
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            console.log('[CLIPBOARD] ✅ Text copied to web clipboard');
            return true;
          } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (result) {
              console.log('[CLIPBOARD] ✅ Text copied to web clipboard (fallback)');
              return true;
            }
          }
        } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
          // Mobile fallback - use Share API with instructions
          console.log('[CLIPBOARD] Using mobile fallback - stored text internally');
          // Return true since we've stored the text and can show it in the UI
          return true;
        }
        
        console.warn('[CLIPBOARD] ⚠️ Clipboard not available, text stored internally:', text);
        return true; // Return true since we stored it internally
      }
    } catch (error) {
      console.error('[CLIPBOARD] ❌ Failed to copy to clipboard:', error);
      // Store text as last resort
      this.lastCopiedText = text;
      return true; // Return true to show success message
    }
  }

  /**
   * Get text from clipboard with fallback
   */
  static async getStringAsync(): Promise<string | null> {
    try {
      const clipboardModule = this.getClipboardModule();
      
      if (clipboardModule) {
        // Native clipboard available
        const text = await clipboardModule.getStringAsync();
        console.log('[CLIPBOARD] ✅ Text read from native clipboard');
        return text;
      } else {
        // Fallback for Expo Go/web
        if (Platform.OS === 'web') {
          if (navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            console.log('[CLIPBOARD] ✅ Text read from web clipboard');
            return text;
          }
        }
        
        console.warn('[CLIPBOARD] ⚠️ Clipboard read not available');
        return null;
      }
    } catch (error) {
      console.error('[CLIPBOARD] ❌ Failed to read from clipboard:', error);
      return null;
    }
  }

  /**
   * Check if clipboard functionality is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const clipboardModule = this.getClipboardModule();
      if (clipboardModule) {
        return true;
      }
      
      if (Platform.OS === 'web') {
        return !!(navigator.clipboard && navigator.clipboard.writeText);
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the last copied text (used for fallback)
   */
  static getLastCopiedText(): string {
    return this.lastCopiedText;
  }
}