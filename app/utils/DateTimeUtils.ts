/**
 * DateTime Utilities for When2Meet
 * 
 * Provides consistent date/time handling across timezones
 * CRITICAL: Ensures calendar data persists accurately during group switches
 */

export class DateTimeUtils {
  /**
   * Convert date to UTC date string (YYYY-MM-DD)
   * CRITICAL: Ensures consistent date handling across timezones
   */
  static toUTCDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Create date from UTC date string
   * CRITICAL: Prevents timezone-related date mismatches
   */
  static fromUTCDateString(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00.000Z');
  }

  /**
   * Get current date as UTC string
   * CRITICAL: Consistent "today" across all timezones
   */
  static getCurrentUTCDateString(): string {
    return this.toUTCDateString(new Date());
  }

  /**
   * Format date for display (locale-aware)
   */
  static formatDateForDisplay(dateStr: string, locale: string = 'en-US'): string {
    const date = this.fromUTCDateString(dateStr);
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',  
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get hour in local timezone from UTC hour
   * CRITICAL: Converts UTC calendar slots to user's local time
   */
  static utcHourToLocal(utcHour: number, timezoneOffset?: number): number {
    const offset = timezoneOffset ?? new Date().getTimezoneOffset();
    const localHour = utcHour - Math.floor(offset / 60);
    return ((localHour % 24) + 24) % 24; // Handle negative values
  }

  /**
   * Get UTC hour from local hour
   * CRITICAL: Stores local time selections as UTC for consistency
   */
  static localHourToUTC(localHour: number, timezoneOffset?: number): number {
    const offset = timezoneOffset ?? new Date().getTimezoneOffset();
    const utcHour = localHour + Math.floor(offset / 60);
    return ((utcHour % 24) + 24) % 24; // Handle overflow
  }

  /**
   * Format hour for display (12/24 hour format)
   */
  static formatHourForDisplay(hour: number, format24: boolean = false): string {
    if (format24) {
      return `${hour.toString().padStart(2, '0')}:00`;
    } else {
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'AM' : 'PM';
      return `${displayHour}:00 ${period}`;
    }
  }

  /**
   * Get timezone offset in minutes
   */
  static getTimezoneOffset(): number {
    return new Date().getTimezoneOffset();
  }

  /**
   * Get timezone name
   */
  static getTimezoneName(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.warn('[DATETIME] Unable to get timezone name:', error);
      return 'UTC';
    }
  }

  /**
   * Create consistent timestamp for Firebase
   * CRITICAL: Ensures all availability updates have consistent timestamps
   */
  static createTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Parse timestamp and convert to local date
   */
  static parseTimestamp(timestamp: string): Date {
    return new Date(timestamp);
  }

  /**
   * Check if two dates are the same day (UTC comparison)
   * CRITICAL: Accurate day comparison across timezones
   */
  static isSameUTCDay(date1: Date | string, date2: Date | string): boolean {
    const dateStr1 = typeof date1 === 'string' ? date1 : this.toUTCDateString(date1);
    const dateStr2 = typeof date2 === 'string' ? date2 : this.toUTCDateString(date2);
    return dateStr1 === dateStr2;
  }

  /**
   * Get next day date string
   */
  static getNextDay(dateStr: string): string {
    const date = this.fromUTCDateString(dateStr);
    date.setUTCDate(date.getUTCDate() + 1);
    return this.toUTCDateString(date);
  }

  /**
   * Get previous day date string
   */
  static getPreviousDay(dateStr: string): string {
    const date = this.fromUTCDateString(dateStr);
    date.setUTCDate(date.getUTCDate() - 1);
    return this.toUTCDateString(date);
  }

  /**
   * Get day of week (0 = Sunday)
   */
  static getDayOfWeek(dateStr: string): number {
    const date = this.fromUTCDateString(dateStr);
    return date.getUTCDay();
  }

  /**
   * Validate date string format
   */
  static isValidDateString(dateStr: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(dateStr) && !isNaN(Date.parse(dateStr + 'T00:00:00.000Z'));
  }

  /**
   * Validate hour (0-23)
   */
  static isValidHour(hour: number): boolean {
    return Number.isInteger(hour) && hour >= 0 && hour <= 23;
  }
}

/**
 * Time range utilities for availability management
 */
export class TimeRangeUtils {
  /**
   * Create time slots for a given range
   * CRITICAL: Consistent slot generation for availability data
   */
  static createTimeSlots(dateStr: string, startHour: number, endHour: number): { date: string; hour: number; available: boolean }[] {
    const slots = [];
    
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push({
        date: dateStr,
        hour: hour,
        available: true
      });
    }
    
    return slots;
  }

  /**
   * Get time range from availability slots
   */
  static getTimeRange(slots: { date: string; hour: number; available: boolean }[], dateStr: string): { startHour: number; endHour: number } | null {
    const daySlots = slots
      .filter(slot => slot.date === dateStr && slot.available)
      .sort((a, b) => a.hour - b.hour);
    
    if (daySlots.length === 0) {
      return null;
    }
    
    return {
      startHour: daySlots[0].hour,
      endHour: daySlots[daySlots.length - 1].hour
    };
  }

  /**
   * Format time range for display
   */
  static formatTimeRange(startHour: number, endHour: number, format24: boolean = false): string {
    const startTime = DateTimeUtils.formatHourForDisplay(startHour, format24);
    const endTime = DateTimeUtils.formatHourForDisplay(endHour, format24);
    return `${startTime} - ${endTime}`;
  }
}

/**
 * Availability data utilities
 */
export class AvailabilityUtils {
  /**
   * Merge availability data from multiple sources
   * CRITICAL: Resolves conflicts when switching between groups
   */
  static mergeAvailabilities(local: any, remote: any): any {
    if (!local && !remote) return null;
    if (!local) return remote;
    if (!remote) return local;
    
    // Use the most recently updated data
    const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
    const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
    
    return remoteTime > localTime ? remote : local;
  }

  /**
   * Validate availability data structure
   */
  static validateAvailability(availability: any): boolean {
    if (!availability || typeof availability !== 'object') {
      return false;
    }
    
    const required = ['userId', 'groupId', 'slots'];
    for (const field of required) {
      if (!(field in availability)) {
        return false;
      }
    }
    
    if (!Array.isArray(availability.slots)) {
      return false;
    }
    
    return availability.slots.every((slot: any) => 
      slot && 
      typeof slot.date === 'string' && 
      DateTimeUtils.isValidDateString(slot.date) &&
      typeof slot.hour === 'number' && 
      DateTimeUtils.isValidHour(slot.hour) &&
      typeof slot.available === 'boolean'
    );
  }
}