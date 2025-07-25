import React, { useCallback, useRef, ReactNode, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { CellPosition, GridLayout } from '../../utils/types';
import { coordinateToCell } from '../../utils/gestureUtils';

interface WebGestureHandlerProps {
  children: ReactNode;
  gridLayout: GridLayout;
  onSelectionStart: (position: CellPosition) => void;
  onSelectionUpdate: (path: CellPosition[]) => void;
  onSelectionEnd: (path: CellPosition[]) => void;
  onSingleTap: (position: CellPosition) => void;
  disabled?: boolean;
}

const WebGestureHandler: React.FC<WebGestureHandlerProps> = ({
  children,
  gridLayout,
  onSelectionStart,
  onSelectionUpdate,
  onSelectionEnd,
  onSingleTap,
  disabled = false
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPosition, setStartPosition] = useState<CellPosition | null>(null);
  const selectionPath = useRef<CellPosition[]>([]);

  const handleMouseDown = useCallback((event: any) => {
    if (disabled) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const position = coordinateToCell(x, y, gridLayout);
    
    setIsSelecting(true);
    setStartPosition(position);
    selectionPath.current = [position];
    
    onSelectionStart(position);
    
    // Prevent text selection during drag
    event.preventDefault();
  }, [disabled, gridLayout, onSelectionStart]);

  const handleMouseMove = useCallback((event: any) => {
    if (disabled || !isSelecting || !startPosition) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const currentPosition = coordinateToCell(x, y, gridLayout);
    
    // Calculate selection path from start to current position
    const minRow = Math.min(startPosition.row, currentPosition.row);
    const maxRow = Math.max(startPosition.row, currentPosition.row);
    const minCol = Math.min(startPosition.column, currentPosition.column);
    const maxCol = Math.max(startPosition.column, currentPosition.column);
    
    const newPath: CellPosition[] = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        newPath.push({ row, column: col });
      }
    }
    
    selectionPath.current = newPath;
    onSelectionUpdate(newPath);
  }, [disabled, isSelecting, startPosition, gridLayout, onSelectionUpdate]);

  const handleMouseUp = useCallback((event: any) => {
    if (disabled) return;
    
    if (isSelecting) {
      onSelectionEnd(selectionPath.current);
      setIsSelecting(false);
      setStartPosition(null);
      selectionPath.current = [];
    } else {
      // Single click
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const position = coordinateToCell(x, y, gridLayout);
      onSingleTap(position);
    }
  }, [disabled, isSelecting, onSelectionEnd, onSingleTap, gridLayout]);

  const handleMouseLeave = useCallback(() => {
    if (isSelecting) {
      onSelectionEnd(selectionPath.current);
      setIsSelecting(false);
      setStartPosition(null);
      selectionPath.current = [];
    }
  }, [isSelecting, onSelectionEnd]);

  if (Platform.OS !== 'web') {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <View
      style={[styles.container, { cursor: disabled ? 'default' : 'pointer' }]}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      // @ts-ignore - Web-specific props
      onSelectStart={(e: any) => e.preventDefault()} // Prevent text selection
      onDragStart={(e: any) => e.preventDefault()} // Prevent drag behavior
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WebGestureHandler;