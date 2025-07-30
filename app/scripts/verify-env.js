#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Checks that all required Firebase environment variables are properly set
 */

console.log('🔍 Environment Variables Verification');
console.log('=====================================');

const requiredVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'EXPO_PUBLIC_FIREBASE_DATABASE_URL',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
];

let allSet = true;
let hasPlaceholders = false;

console.log('\n📋 Required Environment Variables:\n');

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isSet = !!value;
  const isPlaceholder = value && (
    value.includes('your-') || 
    value.includes('123456789') ||
    value.includes('abcdef123456789')
  );
  
  let status = '❌ MISSING';
  if (isSet && !isPlaceholder) {
    status = '✅ SET';
  } else if (isSet && isPlaceholder) {
    status = '⚠️  PLACEHOLDER';
    hasPlaceholders = true;
  }
  
  console.log(`${status} ${varName}`);
  if (isSet && !isPlaceholder) {
    console.log(`     → ${value.substring(0, 20)}...`);
  } else if (isSet && isPlaceholder) {
    console.log(`     → ${value} (needs real value)`);
  }
  
  if (!isSet) allSet = false;
});

console.log('\n🏁 Summary:');
console.log('===========');

if (allSet && !hasPlaceholders) {
  console.log('✅ All environment variables are properly configured!');
  console.log('✅ No placeholder values detected');
  console.log('✅ Firebase should connect successfully');
} else if (allSet && hasPlaceholders) {
  console.log('⚠️  All variables are set but some have placeholder values');
  console.log('⚠️  Replace placeholder values with real Firebase config');
  console.log('📝 Get real values from: https://console.firebase.google.com/project/when2meet-87a7a/settings/general/');
} else {
  console.log('❌ Some environment variables are missing');
  console.log('📝 Create .env file with required variables');
  console.log('📝 Use .env.example as a template');
}

console.log('\n🔒 Security Status:');
console.log('==================');

// Check if .env exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const gitignorePath = path.join(__dirname, '..', '.gitignore');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
} else {
  console.log('❌ .env file missing');
}

if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env')) {
    console.log('✅ .env is protected in .gitignore');
  } else {
    console.log('❌ .env is NOT protected in .gitignore - SECURITY RISK!');
  }
} else {
  console.log('⚠️  .gitignore file not found');
}

console.log('\n🎯 Next Steps:');
console.log('==============');
if (hasPlaceholders) {
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/when2meet-87a7a');
  console.log('2. Navigate to Project Settings → General');
  console.log('3. Copy your Firebase config values');
  console.log('4. Replace placeholder values in .env file');
  console.log('5. Restart your development server');
}
console.log('6. Test Firebase connection using the app\'s "Test Firebase Connection" button');

process.exit(hasPlaceholders || !allSet ? 1 : 0);