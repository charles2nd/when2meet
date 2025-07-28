import React, { useCallback, useRef, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Gesture, 
  GestureDetector,
  GestureHandlerRootView 
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  CellPosition, 
  GridLayout, 
  SelectionState,
  GestureData 
} from '../../utils/types';
import {
  coordinateToCell,
  getSelectionPath,
  shouldStartSelection,
  createSelectionTracker,
  updateSelectionTracker,
  finishSelection,
  clearSelection,
  throttleGesture
} from '../../utils/gestureUtils';
import { HAPTIC_FEEDBACK_ENABLED, GESTURE_THRESHOLD } from '../../utils/constants';

interface GestureHandlerProps {
  children: ReactNode;
  gridLayout: GridLayout;
  onSelectionStart: (position: CellPosition) => void;
  onSelectionUpdate: (path: CellPosition[]) => void;
  onSelectionEnd: (path: CellPosition[]) => void;
  onSingleTap: (position: CellPosition) => void;
  disabled?: boolean;
  enableHaptics?: boolean;
}

const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  gridLayout,
  onSelectionStart,
  onSelectionUpdate,
  onSelectionEnd,
  onSingleTap,
  disabled = false,
  enableHaptics = HAPTIC_FEEDBACK_ENABLED
}) => {
  const selectionTracker = useRef(createSelectionTracker());
  const startPoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedBeyondThreshold = useRef(false);
  
  const isSelecting = useSharedValue(false);
  const selectionOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(1);

  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptics || Platform.OS === 'web') return;
    
    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      // Haptic feedback not available on this platform
      console.log('Haptic feedback not available');
    }
  }, [enableHaptics]);

  const animateSelectionFeedback = useCallback(() => {
    selectionOpacity.value = withTiming(0.3, { duration: 100 });
    feedbackScale.value = withSpring(1.1, { damping: 15 });
  }, []);

  const clearSelectionFeedback = useCallback(() => {
    selectionOpacity.value = withTiming(0, { duration: 200 });
    feedbackScale.value = withSpring(1, { damping: 15 });
  }, []);

  const throttledSelectionUpdate = useCallback(
    throttleGesture((path: CellPosition[]) => {
      onSelectionUpdate(path);
    }, 50),
    [onSelectionUpdate]
  );

  const handleSelectionStart = useCallback((position: CellPosition) => {
    if (disabled) return;
    
    selectionTracker.current = updateSelectionTracker(
      selectionTracker.current, 
      position, 
      true
    );
    
    onSelectionStart(position);
    triggerHapticFeedback('light');
    animateSelectionFeedback();
  }, [disabled, onSelectionStart, triggerHapticFeedback, animateSelectionFeedback]);

  const handleSelectionUpdate = useCallback((currentPosition: CellPosition) => {
    if (disabled || !selectionTracker.current.isActive) return;
    
    selectionTracker.current = updateSelectionTracker(
      selectionTracker.current,
      currentPosition
    );
    
    throttledSelectionUpdate(selectionTracker.current.currentPath);
  }, [disabled, throttledSelectionUpdate]);

  const handleSelectionEnd = useCallback(() => {
    if (disabled || !selectionTracker.current.isActive) return;
    
    const finalPath = finishSelection(selectionTracker.current);
    selectionTracker.current = clearSelection(selectionTracker.current);
    
    onSelectionEnd(finalPath);
    triggerHapticFeedback('medium');
    clearSelectionFeedback();
  }, [disabled, onSelectionEnd, triggerHapticFeedback, clearSelectionFeedback]);

  const handleSingleTap = useCallback((position: CellPosition) => {
    if (disabled) return;
    
    onSingleTap(position);
    triggerHapticFeedback('light');
    
    feedbackScale.value = withSpring(0.95, { damping: 20 }, () => {
      feedbackScale.value = withSpring(1, { damping: 15 });
    });
  }, [disabled, onSingleTap, triggerHapticFeedback]);

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      if (disabled) return;
      
      startPoint.current = { x: event.x, y: event.y };
      hasMovedBeyondThreshold.current = false;
      isSelecting.value = false;
    })
    .onUpdate((event) => {
      if (disabled) return;
      
      const currentPoint = { x: event.x, y: event.y };
      const gestureData: GestureData = {
        x: event.x,
        y: event.y,
        translationX: event.translationX,
        translationY: event.translationY
      };
      
      if (!hasMovedBeyondThreshold.current) {
        if (shouldStartSelection(gestureData, startPoint.current)) {
          hasMovedBeyondThreshold.current = true;
          isSelecting.value = true;
          
          const startPosition = coordinateToCell(
            startPoint.current.x, 
            startPoint.current.y, 
            gridLayout
          );
          
          runOnJS(handleSelectionStart)(startPosition);
        }
        return;
      }
      
      if (isSelecting.value) {
        const currentPosition = coordinateToCell(event.x, event.y, gridLayout);
        runOnJS(handleSelectionUpdate)(currentPosition);
      }
    })
    .onEnd((event) => {
      if (disabled) return;
      
      if (!hasMovedBeyondThreshold.current) {
        const tapPosition = coordinateToCell(
          startPoint.current.x, 
          startPoint.current.y, 
          gridLayout
        );
        runOnJS(handleSingleTap)(tapPosition);
      } else if (isSelecting.value) {
        runOnJS(handleSelectionEnd)();
      }
      
      isSelecting.value = false;
      hasMovedBeyondThreshold.current = false;
    })
    .onFinalize(() => {
      if (isSelecting.value) {
        runOnJS(handleSelectionEnd)();
      }
      isSelecting.value = false;
      hasMovedBeyondThreshold.current = false;
    });

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      if (disabled) return;
      
      const position = coordinateToCell(event.x, event.y, gridLayout);
      runOnJS(handleSingleTap)(position);
    });

  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: selectionOpacity.value,
    transform: [{ scale: feedbackScale.value }]
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: isSelecting.value ? 0.1 : 0,
    backgroundColor: '#007AFF'
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.gestureContainer, animatedStyle]}>
          {children}
          
          <Animated.View 
            style={[styles.selectionOverlay, overlayStyle]} 
            pointerEvents="none"
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
    position: 'relative',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});

export default GestureHandler;