import { Platform, Share } from 'react-native';

// Try to import both expo-clipboard and react-native Clipboard
let ExpoClipboard: any = null;
let RNClipboard: any = null;

try {
  ExpoClipboard = require('expo-clipboard');
  console.log('[CLIPBOARD] ✅ expo-clipboard loaded');
} catch (error) {
  console.log('[CLIPBOARD] expo-clipboard not available');
}

try {
  RNClipboard = require('@react-native-clipboard/clipboard');
  console.log('[CLIPBOARD] ✅ @react-native-clipboard/clipboard loaded');
} catch (error) {
  try {
    // Fallback to built-in Clipboard from react-native
    const { Clipboard } = require('react-native');
    RNClipboard = Clipboard;
    console.log('[CLIPBOARD] ✅ react-native Clipboard loaded');
  } catch (error2) {
    console.log('[CLIPBOARD] No react-native Clipboard available');
  }
}

// Cross-platform clipboard utility that works with Expo Go and native builds
export class ClipboardUtil {
  private static clipboardAvailable = false;
  private static lastCopiedText = '';
  private static initialized = false;

  private static initialize() {
    if (!this.initialized) {
      // Check clipboard availability on first use
      if (ExpoClipboard && typeof ExpoClipboard.setStringAsync === 'function') {
        this.clipboardAvailable = true;
        console.log('[CLIPBOARD] Using expo-clipboard');
      } else if (RNClipboard && typeof RNClipboard.setString === 'function') {
        this.clipboardAvailable = true;
        console.log('[CLIPBOARD] Using react-native Clipboard');
      } else {
        console.log('[CLIPBOARD] No clipboard API available, using fallbacks');
      }
      this.initialized = true;
    }
  }

  private static getClipboardModule() {
    this.initialize();
    if (ExpoClipboard && typeof ExpoClipboard.setStringAsync === 'function') {
      return ExpoClipboard;
    } else if (RNClipboard) {
      return RNClipboard;
    }
    return null;
  }

  /**
   * Copy text to clipboard with multiple fallback strategies
   */
  static async setStringAsync(text: string): Promise<boolean> {
    console.log('[CLIPBOARD] Attempting to copy text:', text.substring(0, 20) + '...');
    
    try {
      const clipboardModule = this.getClipboardModule();
      
      if (clipboardModule) {
        // Try expo-clipboard first (async)
        if (ExpoClipboard && typeof ExpoClipboard.setStringAsync === 'function') {
          await ExpoClipboard.setStringAsync(text);
          console.log('[CLIPBOARD] ✅ Text copied via expo-clipboard');
          this.lastCopiedText = text; // Store for verification
          return true;
        }
        
        // Try react-native Clipboard (sync)
        if (RNClipboard && typeof RNClipboard.setString === 'function') {
          RNClipboard.setString(text);
          console.log('[CLIPBOARD] ✅ Text copied via react-native Clipboard');
          this.lastCopiedText = text; // Store for verification
          return true;
        }
      }
      
      // Platform-specific fallbacks
      if (Platform.OS === 'web') {
        // Modern web clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          console.log('[CLIPBOARD] ✅ Text copied via web clipboard API');
          this.lastCopiedText = text;
          return true;
        }
        
        // Legacy web clipboard fallback
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          const result = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (result) {
            console.log('[CLIPBOARD] ✅ Text copied via legacy web API');
            this.lastCopiedText = text;
            return true;
          }
        } catch (legacyError) {
          console.log('[CLIPBOARD] Legacy web copy failed:', legacyError);
        }
      }
      
      // Store text internally as final fallback
      this.lastCopiedText = text;
      console.warn('[CLIPBOARD] ⚠️ No clipboard API available, text stored internally');
      return false; // Return false to indicate clipboard didn't work
      
    } catch (error) {
      console.error('[CLIPBOARD] ❌ Failed to copy to clipboard:', error);
      // Store text as last resort
      this.lastCopiedText = text;
      return false; // Return false to indicate failure
    }
  }

  /**
   * Get text from clipboard with multiple fallback strategies
   */
  static async getStringAsync(): Promise<string | null> {
    console.log('[CLIPBOARD] Attempting to read from clipboard...');
    
    try {
      const clipboardModule = this.getClipboardModule();
      
      if (clipboardModule) {
        // Try expo-clipboard first (async)
        if (ExpoClipboard && typeof ExpoClipboard.getStringAsync === 'function') {
          const text = await ExpoClipboard.getStringAsync();
          console.log('[CLIPBOARD] ✅ Text read via expo-clipboard:', text?.substring(0, 20) + '...');
          return text;
        }
        
        // Try react-native Clipboard (async)
        if (RNClipboard && typeof RNClipboard.getString === 'function') {
          const text = await RNClipboard.getString();
          console.log('[CLIPBOARD] ✅ Text read via react-native Clipboard:', text?.substring(0, 20) + '...');
          return text;
        }
      }
      
      // Platform-specific fallbacks
      if (Platform.OS === 'web') {
        // Modern web clipboard API
        if (navigator.clipboard && navigator.clipboard.readText) {
          try {
            const text = await navigator.clipboard.readText();
            console.log('[CLIPBOARD] ✅ Text read via web clipboard API:', text?.substring(0, 20) + '...');
            return text;
          } catch (webError) {
            console.log('[CLIPBOARD] Web clipboard read permission denied or failed:', webError);
            // Try to request permission
            if (navigator.permissions) {
              try {
                const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
                if (permission.state === 'granted') {
                  const text = await navigator.clipboard.readText();
                  console.log('[CLIPBOARD] ✅ Text read after permission grant');
                  return text;
                }
              } catch (permissionError) {
                console.log('[CLIPBOARD] Permission check failed:', permissionError);
              }
            }
          }
        }
      }
      
      console.warn('[CLIPBOARD] ⚠️ Clipboard read not available or permission denied');
      return null;
      
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
        console.log('[CLIPBOARD] Native clipboard available');
        return true;
      }
      
      if (Platform.OS === 'web') {
        const webAvailable = !!(navigator.clipboard && navigator.clipboard.writeText);
        console.log('[CLIPBOARD] Web clipboard available:', webAvailable);
        return webAvailable;
      }
      
      console.log('[CLIPBOARD] No clipboard available');
      return false;
    } catch (error) {
      console.log('[CLIPBOARD] Error checking availability:', error);
      return false;
    }
  }

  /**
   * Test clipboard functionality by copying and reading back
   */
  static async testClipboard(): Promise<{ copy: boolean; paste: boolean }> {
    const testText = 'TEST123';
    
    // Test copy
    const copyResult = await this.setStringAsync(testText);
    
    // Wait a moment for clipboard to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Test paste
    const pasteResult = await this.getStringAsync();
    const pasteSuccess = pasteResult === testText;
    
    console.log('[CLIPBOARD] Test results - Copy:', copyResult, 'Paste:', pasteSuccess);
    
    return {
      copy: copyResult,
      paste: pasteSuccess
    };
  }

  /**
   * Get the last copied text (used for fallback)
   */
  static getLastCopiedText(): string {
    return this.lastCopiedText;
  }
}