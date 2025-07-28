const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add polyfills for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    process: require.resolve('process/browser'),
    fs: false,
    path: false,
    vm: false,
    assert: require.resolve('assert'),
  };
  
  // Add webpack plugins to provide global variables
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );
  
  // Fix for MIME module - based on Stack Overflow solution
  config.module.rules.push({
    test: /node_modules[/\\](mime[/\\]Mime\.js|mime[/\\]index\.js|mime-db[/\\]index\.js)/,
    use: 'null-loader',
  });
  
  // Add custom MIME handling and module resolution
  config.resolve.alias = {
    ...config.resolve.alias,
    // Handle expo-font export path issue
    'expo-font/build/Font': 'expo-font',
    'expo-font$': 'expo-font',
    'expo-font': require.resolve('expo-font'),
    // Handle uuid crypto dependency
    'uuid/lib/rng': 'uuid/lib/rng-browser',
    'uuid/lib/sha1': 'uuid/lib/sha1-browser',
    // Override mime to use browser-compatible version
    'mime$': path.resolve(__dirname, 'mime-browser.js'),
    'mime/lite': path.resolve(__dirname, 'mime-browser.js'),
  };
  
  // Handle missing Node.js globals
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.platform': JSON.stringify(''),
      'process.version': JSON.stringify(''),
    })
  );
  
  // Additional rule for handling ES modules
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto',
  });
  
  // Ignore specific warnings
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /registerWebModule/,
    /NativeModule/,
    /expo-modules-core/,
    /expo-font/,
  ];
  
  return config;
};