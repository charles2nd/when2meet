export const __DEV__ = process.env.NODE_ENV === 'development';

export const Config = {
  isDevelopment: __DEV__,
  enableLogging: __DEV__,
  apiUrl: __DEV__ ? 'https://api-dev.when2meet.com' : 'https://api.when2meet.com',
  enableDebugMode: __DEV__,
};