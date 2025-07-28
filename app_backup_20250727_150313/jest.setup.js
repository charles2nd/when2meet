// Mock React Native modules
jest.mock('react-native', () => {
  return {
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    ScrollView: 'ScrollView',
    TextInput: 'TextInput',
    Image: 'Image',
    StyleSheet: {
      create: (styles) => styles,
      flatten: (style) => style,
    },
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
    },
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
  CommonActions: {
    reset: jest.fn(),
  },
}));

// Global test setup
global.__DEV__ = true;