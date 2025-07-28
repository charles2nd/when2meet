import { __DEV__ } from '../constants/config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;

  private formatMessage(level: string, tag: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level} ${tag}: ${message}`;
  }

  debug(tag: string, message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.formatMessage('DEBUG', tag, message), ...args);
    }
  }

  info(tag: string, message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', tag, message), ...args);
    }
  }

  warn(tag: string, message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', tag, message), ...args);
    }
  }

  error(tag: string, message: string, error?: Error | any): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', tag, message), error);
    }
  }

  // Authentication specific logs
  auth = {
    signInAttempt: (email: string) => this.debug('AUTH', `Sign in attempt for: ${email}`),
    signInSuccess: (user: any) => this.info('AUTH', 'Sign in successful', { uid: user.uid, role: user.role }),
    signInFailure: (reason: string) => this.warn('AUTH', `Sign in failed: ${reason}`),
    signOut: () => this.info('AUTH', 'User signed out'),
    loadFromStorage: (hasUser: boolean) => this.debug('AUTH', `Loaded user from storage: ${hasUser}`),
  };

  // Navigation specific logs
  navigation = {
    route: (to: string, from?: string) => this.debug('NAV', `Navigating from ${from || 'unknown'} to ${to}`),
    error: (error: string) => this.error('NAV', 'Navigation error', error),
  };

  // Storage specific logs
  storage = {
    save: (key: string) => this.debug('STORAGE', `Saved data for key: ${key}`),
    load: (key: string, success: boolean) => this.debug('STORAGE', `Load ${key}: ${success ? 'success' : 'failed'}`),
    error: (operation: string, error: any) => this.error('STORAGE', `Storage ${operation} failed`, error),
  };
}

export const logger = new Logger();