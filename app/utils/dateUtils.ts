import { translations, Language } from '../services/translations';

export class DateUtils {
  /**
   * Format a date string according to the selected language
   * @param dateStr - ISO date string (YYYY-MM-DD)
   * @param language - Selected language ('en' or 'fr')
   * @param options - Formatting options
   * @returns Formatted date string
   */
  static formatDate(
    dateStr: string, 
    language: Language = 'en', 
    options: {
      weekday?: boolean;
      year?: boolean;
      month?: 'long' | 'short';
      day?: boolean;
    } = { weekday: true, year: true, month: 'long', day: true }
  ): string {
    try {
      const date = new Date(dateStr);
      const t = translations[language];
      
      let formatted = '';
      
      // Add weekday if requested
      if (options.weekday) {
        const weekdays = [
          t.calendar.sunday,
          t.calendar.monday,
          t.calendar.tuesday,
          t.calendar.wednesday,
          t.calendar.thursday,
          t.calendar.friday,
          t.calendar.saturday
        ];
        formatted += weekdays[date.getDay()];
      }
      
      // Add day number
      if (options.day) {
        if (formatted) formatted += ', ';
        formatted += date.getDate().toString();
      }
      
      // Add month
      if (options.month) {
        const months = [
          t.calendar.january,
          t.calendar.february,
          t.calendar.march,
          t.calendar.april,
          t.calendar.may,
          t.calendar.june,
          t.calendar.july,
          t.calendar.august,
          t.calendar.september,
          t.calendar.october,
          t.calendar.november,
          t.calendar.december
        ];
        
        if (formatted) formatted += ' ';
        
        if (options.month === 'long') {
          formatted += months[date.getMonth()];
        } else {
          // Short month format (first 3 letters)
          formatted += months[date.getMonth()].substring(0, 3);
        }
      }
      
      // Add year if requested
      if (options.year) {
        if (formatted) formatted += ' ';
        formatted += date.getFullYear().toString();
      }
      
      return formatted;
    } catch (error) {
      console.error('[DateUtils] Error formatting date:', error);
      // Fallback to system locale formatting
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
    }
  }

  /**
   * Get relative date string (Today, Yesterday, Tomorrow)
   * @param dateStr - ISO date string (YYYY-MM-DD)
   * @param language - Selected language
   * @returns Relative date string or formatted date if not relative
   */
  static getRelativeDate(dateStr: string, language: Language = 'en'): string {
    try {
      const inputDate = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Reset hours for accurate comparison
      const resetTime = (date: Date) => {
        date.setHours(0, 0, 0, 0);
        return date;
      };

      const inputDateReset = resetTime(new Date(inputDate));
      const todayReset = resetTime(new Date(today));
      const yesterdayReset = resetTime(new Date(yesterday));
      const tomorrowReset = resetTime(new Date(tomorrow));

      const t = translations[language];

      if (inputDateReset.getTime() === todayReset.getTime()) {
        return t.calendar.today;
      } else if (inputDateReset.getTime() === yesterdayReset.getTime()) {
        return t.calendar.yesterday;
      } else if (inputDateReset.getTime() === tomorrowReset.getTime()) {
        return t.calendar.tomorrow;
      } else {
        // Return formatted date for other dates
        return this.formatDate(dateStr, language);
      }
    } catch (error) {
      console.error('[DateUtils] Error getting relative date:', error);
      return dateStr;
    }
  }

  /**
   * Format time with proper locale
   * @param hour - Hour (0-23)
   * @param language - Selected language
   * @returns Formatted time string
   */
  static formatTime(hour: number, language: Language = 'en'): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  /**
   * Format time range
   * @param startHour - Start hour (0-23)
   * @param endHour - End hour (1-24)
   * @param language - Selected language
   * @returns Formatted time range string
   */
  static formatTimeRange(startHour: number, endHour: number, language: Language = 'en'): string {
    const start = this.formatTime(startHour, language);
    const end = this.formatTime(endHour, language);
    return `${start} - ${end}`;
  }

  /**
   * Get current month name
   * @param language - Selected language
   * @returns Current month name
   */
  static getCurrentMonth(language: Language = 'en'): string {
    const now = new Date();
    const t = translations[language];
    const months = [
      t.calendar.january,
      t.calendar.february,
      t.calendar.march,
      t.calendar.april,
      t.calendar.may,
      t.calendar.june,
      t.calendar.july,
      t.calendar.august,
      t.calendar.september,
      t.calendar.october,
      t.calendar.november,
      t.calendar.december
    ];
    return months[now.getMonth()];
  }
}