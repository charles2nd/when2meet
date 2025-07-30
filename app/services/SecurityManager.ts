/**
 * Security Manager for When2Meet App
 * Implements React Native security best practices
 * Reference: https://reactnative.dev/docs/security
 */

export interface SecurityConfig {
  enableInputValidation: boolean;
  enableRateLimiting: boolean;
  maxRequestsPerMinute: number;
  enableAuditLogging: boolean;
}

export class SecurityManager {
  private static config: SecurityConfig = {
    enableInputValidation: true,
    enableRateLimiting: true,
    maxRequestsPerMinute: 60,
    enableAuditLogging: true
  };

  private static requestLog: Map<string, number[]> = new Map();

  // Input validation and sanitization
  static validateAndSanitizeInput(
    input: string, 
    type: 'email' | 'name' | 'groupName' | 'groupCode' | 'general',
    maxLength: number = 255
  ): { isValid: boolean; sanitized?: string; error?: string } {
    try {
      if (!input || typeof input !== 'string') {
        return { isValid: false, error: 'Input must be a non-empty string' };
      }

      const trimmed = input.trim();
      if (trimmed.length === 0) {
        return { isValid: false, error: 'Input cannot be empty' };
      }

      if (trimmed.length > maxLength) {
        return { isValid: false, error: `Input too long: maximum ${maxLength} characters allowed` };
      }

      // XSS prevention - detect potentially dangerous patterns
      const dangerousPatterns = [
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
        /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
        /<embed[\s\S]*?>/gi,
        /<link[\s\S]*?>/gi,
        /<meta[\s\S]*?>/gi
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(trimmed)) {
          return { isValid: false, error: 'Input contains potentially dangerous content' };
        }
      }

      // Type-specific validation
      switch (type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(trimmed)) {
            return { isValid: false, error: 'Invalid email format' };
          }
          return { isValid: true, sanitized: trimmed.toLowerCase() };

        case 'name':
          // Names should only contain letters, spaces, hyphens, and apostrophes
          const nameRegex = /^[a-zA-Z\s\-']+$/;
          if (!nameRegex.test(trimmed)) {
            return { isValid: false, error: 'Name contains invalid characters' };
          }
          return { isValid: true, sanitized: trimmed };

        case 'groupName':
          // Group names can contain letters, numbers, spaces, and common punctuation
          const groupNameRegex = /^[a-zA-Z0-9\s\-_.,!?()]+$/;
          if (!groupNameRegex.test(trimmed)) {
            return { isValid: false, error: 'Group name contains invalid characters' };
          }
          return { isValid: true, sanitized: trimmed };

        case 'groupCode':
          // Group codes should be alphanumeric only
          const codeRegex = /^[A-Z0-9]+$/;
          if (!codeRegex.test(trimmed)) {
            return { isValid: false, error: 'Group code must contain only letters and numbers' };
          }
          if (trimmed.length !== 6) {
            return { isValid: false, error: 'Group code must be exactly 6 characters' };
          }
          return { isValid: true, sanitized: trimmed.toUpperCase() };

        default:
          return { isValid: true, sanitized: trimmed };
      }
    } catch (error) {
      console.error('[SECURITY] Validation error:', error);
      return { isValid: false, error: 'Validation failed due to unexpected error' };
    }
  }

  // Rate limiting to prevent abuse
  static checkRateLimit(identifier: string): { allowed: boolean; message?: string } {
    if (!this.config.enableRateLimiting) {
      return { allowed: true };
    }

    const now = Date.now();
    const oneMinuteAgo = now - 60000; // 1 minute in milliseconds

    // Get existing requests for this identifier
    const requests = this.requestLog.get(identifier) || [];
    
    // Filter out requests older than 1 minute
    const recentRequests = requests.filter(timestamp => timestamp > oneMinuteAgo);
    
    // Check if limit exceeded
    if (recentRequests.length >= this.config.maxRequestsPerMinute) {
      return { 
        allowed: false, 
        message: `Rate limit exceeded: maximum ${this.config.maxRequestsPerMinute} requests per minute` 
      };
    }

    // Add current request timestamp
    recentRequests.push(now);
    this.requestLog.set(identifier, recentRequests);

    return { allowed: true };
  }

  // Audit logging for security events
  static logSecurityEvent(
    event: 'login_attempt' | 'group_create' | 'group_join' | 'validation_failed' | 'rate_limit_exceeded',
    userId?: string,
    details?: any
  ): void {
    if (!this.config.enableAuditLogging) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId: userId || 'anonymous',
      details: details || {},
      userAgent: 'React Native App', // In a real app, you might get this from device info
    };

    // In production, this should be sent to a secure logging service
    console.log('[SECURITY_AUDIT]', JSON.stringify(logEntry));
  }

  // Generate secure random tokens
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Validate group operation permissions
  static validateGroupPermission(
    userId: string, 
    groupAdminId: string, 
    operation: 'modify' | 'delete' | 'view'
  ): { allowed: boolean; message?: string } {
    if (!userId || !groupAdminId) {
      return { allowed: false, message: 'Invalid user or group admin ID' };
    }

    switch (operation) {
      case 'modify':
      case 'delete':
        if (userId !== groupAdminId) {
          return { allowed: false, message: 'Only group admin can perform this operation' };
        }
        break;
      case 'view':
        // Generally, any authenticated user can view groups they're part of
        break;
    }

    return { allowed: true };
  }

  // Clean up old rate limiting data
  static cleanupRateLimitData(): void {
    const oneHourAgo = Date.now() - 3600000; // 1 hour in milliseconds
    
    for (const [identifier, requests] of this.requestLog.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > oneHourAgo);
      
      if (recentRequests.length === 0) {
        this.requestLog.delete(identifier);
      } else {
        this.requestLog.set(identifier, recentRequests);
      }
    }
  }

  // Configuration methods
  static updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[SECURITY] Configuration updated:', this.config);
  }

  static getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

// Clean up rate limiting data every 10 minutes
setInterval(() => {
  SecurityManager.cleanupRateLimitData();
}, 600000);