const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

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
  };
  
  // Add webpack plugins to provide global variables
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );
  
  // Fix for expo-modules-core warnings and uuid issues
  config.resolve.alias = {
    ...config.resolve.alias,
    // Handle expo-font export path issue
    'expo-font/build/Font': 'expo-font',
    'expo-font$': 'expo-font',
    // Handle uuid crypto dependency
    'uuid/lib/rng': 'uuid/lib/rng-browser',
    'uuid/lib/sha1': 'uuid/lib/sha1-browser',
  };
  
  // Handle MIME buffer error
  config.module.rules.push({
    test: /node_modules[/\\]mime[/\\].*\.js$/,
    loader: 'string-replace-loader',
    options: {
      search: 'var db = require(\'mime-db\')',
      replace: 'var db = require(\'mime-db/db.json\')',
    },
  });
  
  // Additional rule for MIME module
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
  ];
  
  return config;
};