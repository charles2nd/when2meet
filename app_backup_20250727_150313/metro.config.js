const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for web-specific file extensions
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for TypeScript
config.resolver.sourceExts.push('ts', 'tsx');

// Add resolver for crypto polyfills to fix web build issues
config.resolver.alias = {
  crypto: require.resolve('expo-crypto'),
};

module.exports = config;