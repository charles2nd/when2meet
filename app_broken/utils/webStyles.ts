import { Platform, ViewStyle, TextStyle } from 'react-native';

export const getWebStyle = (styleType: 'scrollView' | 'container' | 'touchableOpacity' | 'textInput'): ViewStyle | TextStyle => {
  if (Platform.OS !== 'web') {
    return {};
  }

  switch (styleType) {
    case 'scrollView':
      return {
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      } as any;
    case 'container':
      return {
        maxWidth: 1200,
        marginHorizontal: 'auto',
      } as ViewStyle;
    case 'touchableOpacity':
      return {
        cursor: 'pointer',
      } as any;
    case 'textInput':
      return {
        outline: 'none',
      } as any;
    default:
      return {};
  }
};