const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix React Native Platform module resolution
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native/Libraries/Utilities/Platform': path.resolve(
    __dirname,
    'node_modules/react-native/Libraries/Utilities/Platform.js'
  ),
};

module.exports = config;