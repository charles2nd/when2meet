import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet, 
  Dimensions, 
  LayoutChangeEvent,
  Platform 
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  runOnJS 
} from 'react-native-reanimated';
import TimeSlotCell from './TimeSlotCell';
import WebGestureHandler from './WebGestureHandler';
import { 
  TimeSlot, 
  AvailabilityResponse, 
  CellPosition, 
  GridLayout, 
  SelectionState 
} from '../../utils/types';
import { COLORS, SPACING } from '../../utils/constants';
import { 
  getTimeSlotsByDate, 
  getUniqueTimeLabels, 
  getUniqueDateLabels,
  formatDateLabel 
} from '../../utils/helpers';

interface AvailabilityGridProps {
  timeSlots: TimeSlot[];
  userSelection: string[];
  responses: AvailabilityResponse[];
  onSelectionChange: (selectedSlots: string[]) => void;
  readonly?: boolean;
  showParticipantCount?: boolean;
  cellSize?: { width: number; height: number };
}

const { width: screenWidth } = Dimensions.get('window');
const HEADER_HEIGHT = 50;
const TIME_LABEL_WIDTH = 80;
const DEFAULT_CELL_SIZE = { width: 60, height: 40 };

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
  timeSlots,
  userSelection,
  responses,
  onSelectionChange,
  readonly = false,
  showParticipantCount = true,
  cellSize = DEFAULT_CELL_SIZE
}) => {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    isSelecting: false,
    selectedCells: [...userSelection]
  });
  
  const [gridLayout, setGridLayout] = useState<GridLayout>({
    cellWidth: cellSize.width,
    cellHeight: cellSize.height,
    headerHeight: HEADER_HEIGHT,
    scrollOffset: 0,
    maxColumns: 0,
    maxRows: 0
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const isSelecting = useSharedValue(false);
  const startPosition = useSharedValue<CellPosition>({ row: 0, column: 0 });
  const currentPosition = useSharedValue<CellPosition>({ row: 0, column: 0 });

  const timeSlotsByDate = getTimeSlotsByDate(timeSlots);
  const timeLabels = getUniqueTimeLabels(timeSlots);
  const dateLabels = getUniqueDateLabels(timeSlots);
  const totalParticipants = responses.length;

  // Handlers for gesture events
  const handleSelectionStart = useCallback((position: CellPosition) => {
    console.log('Selection started at:', position);
  }, []);

  const handleSelectionUpdate = useCallback((path: CellPosition[]) => {
    console.log('Selection updated:', path.length, 'cells');
  }, []);

  const handleSelectionEnd = useCallback((path: CellPosition[]) => {
    console.log('Selection ended with', path.length, 'cells');
  }, []);

  const handleSingleTap = useCallback((position: CellPosition) => {
    console.log('Single tap at:', position);
  }, []);

  const coordinateToCell = useCallback((x: number, y: number): CellPosition => {
    const adjustedX = x - TIME_LABEL_WIDTH;
    const adjustedY = y - HEADER_HEIGHT + gridLayout.scrollOffset;
    
    const column = Math.floor(adjustedX / gridLayout.cellWidth);
    const row = Math.floor(adjustedY / gridLayout.cellHeight);
    
    return {
      column: Math.max(0, Math.min(column, dateLabels.length - 1)),
      row: Math.max(0, Math.min(row, timeLabels.length - 1))
    };
  }, [gridLayout, dateLabels.length, timeLabels.length]);

  const getTimeSlotId = useCallback((position: CellPosition): string | null => {
    const date = dateLabels[position.column];
    const time = timeLabels[position.row];
    
    if (!date || !time) return null;
    
    const slots = timeSlotsByDate[date] || [];
    const slot = slots.find(s => s.startTime === time);
    
    return slot?.id || null;
  }, [dateLabels, timeLabels, timeSlotsByDate]);

  const getSelectionPath = useCallback((start: CellPosition, end: CellPosition): string[] => {
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.column, end.column);
    const maxCol = Math.max(start.column, end.column);
    
    const selectedIds: string[] = [];
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const slotId = getTimeSlotId({ row, column: col });
        if (slotId) {
          selectedIds.push(slotId);
        }
      }
    }
    
    return selectedIds;
  }, [getTimeSlotId]);

  const updateSelection = useCallback((start: CellPosition, current: CellPosition) => {
    if (readonly) return;
    
    const newSelection = getSelectionPath(start, current);
    setSelectionState(prev => ({
      ...prev,
      selectedCells: newSelection
    }));
  }, [readonly, getSelectionPath]);

  const commitSelection = useCallback(() => {
    if (readonly) return;
    
    onSelectionChange(selectionState.selectedCells);
    setSelectionState(prev => ({
      ...prev,
      isSelecting: false
    }));
  }, [readonly, selectionState.selectedCells, onSelectionChange]);

  const gesture = Gesture.Pan()
    .onStart((event) => {
      if (readonly) return;
      
      const cellPosition = coordinateToCell(event.x, event.y);
      
      runOnJS(setSelectionState)({
        isSelecting: true,
        startPosition: cellPosition,
        currentPosition: cellPosition,
        selectedCells: [...userSelection]
      });
      
      startPosition.value = cellPosition;
      currentPosition.value = cellPosition;
      isSelecting.value = true;
    })
    .onUpdate((event) => {
      if (readonly || !isSelecting.value) return;
      
      const cellPosition = coordinateToCell(event.x, event.y);
      currentPosition.value = cellPosition;
      
      runOnJS(updateSelection)(startPosition.value, cellPosition);
    })
    .onEnd(() => {
      if (readonly) return;
      
      isSelecting.value = false;
      runOnJS(commitSelection)();
    });

  const getParticipantCount = useCallback((slotId: string): number => {
    return responses.filter(response => 
      response.availableSlots.includes(slotId)
    ).length;
  }, [responses]);

  const toggleSingleSelection = useCallback((slotId: string) => {
    if (readonly) return;
    
    const newSelection = userSelection.includes(slotId)
      ? userSelection.filter(id => id !== slotId)
      : [...userSelection, slotId];
    
    onSelectionChange(newSelection);
  }, [readonly, userSelection, onSelectionChange]);

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setGridLayout(prev => ({
      ...prev,
      scrollOffset: offsetY
    }));
  }, []);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setGridLayout(prev => ({
      ...prev,
      maxColumns: Math.floor((width - TIME_LABEL_WIDTH) / cellSize.width),
      maxRows: Math.floor((height - HEADER_HEIGHT) / cellSize.height)
    }));
  }, [cellSize]);

  const renderTimeLabels = () => (
    <View style={styles.timeLabelsContainer}>
      <View style={[styles.cornerCell, { height: HEADER_HEIGHT }]} />
      {timeLabels.map((time, index) => (
        <View key={time} style={[styles.timeLabel, { height: cellSize.height }]}>
          <Text style={styles.timeLabelText}>{time}</Text>
        </View>
      ))}
    </View>
  );

  const renderDateHeaders = () => (
    <View style={styles.dateHeadersContainer}>
      {dateLabels.map((date, index) => (
        <View key={date} style={[styles.dateHeader, { width: cellSize.width }]}>
          <Text style={styles.dateHeaderText} numberOfLines={1}>
            {formatDateLabel(date)}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderGrid = () => (
    <View style={styles.gridContainer}>
      {timeLabels.map((time, timeIndex) => (
        <View key={time} style={styles.gridRow}>
          {dateLabels.map((date, dateIndex) => {
            const slots = timeSlotsByDate[date] || [];
            const slot = slots.find(s => s.startTime === time);
            
            if (!slot) {
              return (
                <View 
                  key={`empty-${date}-${time}`} 
                  style={[styles.emptyCell, { 
                    width: cellSize.width, 
                    height: cellSize.height 
                  }]} 
                />
              );
            }
            
            const isSelected = selectionState.isSelecting 
              ? selectionState.selectedCells.includes(slot.id)
              : userSelection.includes(slot.id);
            
            const participantCount = getParticipantCount(slot.id);
            
            return (
              <TimeSlotCell
                key={slot.id}
                timeSlot={slot}
                isSelected={isSelected}
                participantCount={participantCount}
                totalParticipants={totalParticipants}
                onPress={() => toggleSingleSelection(slot.id)}
                disabled={readonly}
                cellSize={cellSize}
              />
            );
          })}
        </View>
      ))}
    </View>
  );

  const renderGridContent = () => {
    if (Platform.OS === 'web') {
      return (
        <WebGestureHandler
          gridLayout={gridLayout}
          onSelectionStart={handleSelectionStart}
          onSelectionUpdate={handleSelectionUpdate}
          onSelectionEnd={handleSelectionEnd}
          onSingleTap={handleSingleTap}
          disabled={readonly}
        >
          <ScrollView
            ref={scrollViewRef}
            horizontal
            vertical
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            testID="availability-grid"
          >
            {renderGrid()}
          </ScrollView>
        </WebGestureHandler>
      );
    }

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={styles.gridWrapper}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            vertical
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            testID="availability-grid"
          >
            {renderGrid()}
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.headerRow}>
        {renderTimeLabels()}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.headerScrollView}
        >
          {renderDateHeaders()}
        </ScrollView>
      </View>
      
      <View style={styles.gridSection}>
        <View style={styles.timeLabelsContainer}>
          <View style={[styles.cornerCell, { height: HEADER_HEIGHT }]} />
          {timeLabels.map((time, index) => (
            <View key={time} style={[styles.timeLabel, { height: cellSize.height }]}>
              <Text style={styles.timeLabelText}>{time}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.gridWrapper}>
          {renderGridContent()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray[300],
  },
  headerScrollView: {
    flex: 1,
  },
  gridSection: {
    flex: 1,
    flexDirection: 'row',
  },
  timeLabelsContainer: {
    width: TIME_LABEL_WIDTH,
    backgroundColor: COLORS.gray[100],
    borderRightWidth: 1,
    borderRightColor: COLORS.gray[300],
  },
  cornerCell: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[200],
  },
  timeLabel: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray[300],
    paddingHorizontal: SPACING.xs,
  },
  timeLabelText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray[700],
    textAlign: 'center',
  },
  dateHeadersContainer: {
    flexDirection: 'row',
    height: HEADER_HEIGHT,
  },
  dateHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: COLORS.gray[300],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.xs,
  },
  dateHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray[700],
    textAlign: 'center',
  },
  gridWrapper: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'column',
  },
  gridRow: {
    flexDirection: 'row',
  },
  emptyCell: {
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    margin: 0.5,
  },
});

export default AvailabilityGrid;