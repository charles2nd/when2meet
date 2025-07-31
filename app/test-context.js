// Simple test to check if DateDetailScreen can be imported without context errors
const React = require('react');

try {
  console.log('Testing DateDetailScreen import...');
  
  // This would normally fail if there are React context reading errors during import
  const DateDetailScreen = require('./screens/DateDetailScreen.tsx');
  
  console.log('✅ DateDetailScreen imported successfully');
  console.log('✅ No React context reading errors during import');
  
} catch (error) {
  console.error('❌ Error importing DateDetailScreen:', error.message);
  
  if (error.message.includes('Context can only be read while React is rendering')) {
    console.error('❌ React context reading error still exists');
  }
}

console.log('Test completed');