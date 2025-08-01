const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase v9.7.x and above requires additional configuration
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

// Production optimizations
if (process.env.NODE_ENV === 'production') {
  // Enable minification in production
  config.transformer.minifierConfig = {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  };
  
  // Disable dev-only features
  config.resolver.platforms = ['native', 'android', 'ios'];
}

module.exports = config;