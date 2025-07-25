import { CellPosition, GridLayout, GestureData } from './types';
import { GESTURE_THRESHOLD } from './constants';

export function coordinateToCell(
  x: number, 
  y: number, 
  gridLayout: GridLayout
): CellPosition {
  const adjustedY = y - gridLayout.headerHeight + gridLayout.scrollOffset;
  
  const column = Math.floor(x / gridLayout.cellWidth);
  const row = Math.floor(adjustedY / gridLayout.cellHeight);
  
  return {
    column: Math.max(0, Math.min(column, gridLayout.maxColumns - 1)),
    row: Math.max(0, Math.min(row, gridLayout.maxRows - 1))
  };
}

export function getSelectionPath(
  start: CellPosition, 
  end: CellPosition
): CellPosition[] {
  const path: CellPosition[] = [];
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.column, end.column);
  const maxCol = Math.max(start.column, end.column);
  
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      path.push({ row, column: col });
    }
  }
  return path;
}

export function isWithinBounds(
  position: CellPosition, 
  gridLayout: GridLayout
): boolean {
  return (
    position.column >= 0 && 
    position.column < gridLayout.maxColumns &&
    position.row >= 0 && 
    position.row < gridLayout.maxRows
  );
}

export function calculateDistance(
  point1: { x: number; y: number }, 
  point2: { x: number; y: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function shouldStartSelection(
  gestureData: GestureData,
  startPoint: { x: number; y: number }
): boolean {
  const distance = calculateDistance(
    { x: gestureData.x, y: gestureData.y },
    startPoint
  );
  return distance > GESTURE_THRESHOLD;
}

export function getSelectionDirection(
  start: CellPosition,
  current: CellPosition
): 'horizontal' | 'vertical' | 'diagonal' {
  const deltaRow = Math.abs(current.row - start.row);
  const deltaCol = Math.abs(current.column - start.column);
  
  if (deltaRow === 0 && deltaCol > 0) return 'horizontal';
  if (deltaCol === 0 && deltaRow > 0) return 'vertical';
  return 'diagonal';
}

export function optimizeSelectionPath(
  path: CellPosition[],
  direction: 'horizontal' | 'vertical' | 'diagonal'
): CellPosition[] {
  if (direction === 'horizontal') {
    return path.sort((a, b) => a.column - b.column);
  } else if (direction === 'vertical') {
    return path.sort((a, b) => a.row - b.row);
  }
  return path.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.column - b.column;
  });
}

export function getCellCenter(
  position: CellPosition,
  gridLayout: GridLayout
): { x: number; y: number } {
  return {
    x: position.column * gridLayout.cellWidth + gridLayout.cellWidth / 2,
    y: position.row * gridLayout.cellHeight + gridLayout.cellHeight / 2 + gridLayout.headerHeight
  };
}

export function snapToGrid(
  x: number,
  y: number,
  gridLayout: GridLayout
): { x: number; y: number } {
  const cellPosition = coordinateToCell(x, y, gridLayout);
  return getCellCenter(cellPosition, gridLayout);
}

export function getVisibleCells(
  gridLayout: GridLayout,
  scrollOffset: { x: number; y: number },
  viewportSize: { width: number; height: number }
): { startRow: number; endRow: number; startCol: number; endCol: number } {
  const startRow = Math.floor(scrollOffset.y / gridLayout.cellHeight);
  const endRow = Math.min(
    gridLayout.maxRows - 1,
    Math.ceil((scrollOffset.y + viewportSize.height) / gridLayout.cellHeight)
  );
  
  const startCol = Math.floor(scrollOffset.x / gridLayout.cellWidth);
  const endCol = Math.min(
    gridLayout.maxColumns - 1,
    Math.ceil((scrollOffset.x + viewportSize.width) / gridLayout.cellWidth)
  );
  
  return { startRow, endRow, startCol, endCol };
}

export function debounceGesture<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttleGesture<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function createGridCoordinateMapper(gridLayout: GridLayout) {
  return {
    toCell: (x: number, y: number) => coordinateToCell(x, y, gridLayout),
    toCoordinate: (position: CellPosition) => getCellCenter(position, gridLayout),
    getPath: (start: CellPosition, end: CellPosition) => getSelectionPath(start, end),
    isValid: (position: CellPosition) => isWithinBounds(position, gridLayout)
  };
}

export interface SelectionTracker {
  startPosition: CellPosition | null;
  currentPath: CellPosition[];
  isActive: boolean;
  direction: 'horizontal' | 'vertical' | 'diagonal' | null;
}

export function createSelectionTracker(): SelectionTracker {
  return {
    startPosition: null,
    currentPath: [],
    isActive: false,
    direction: null
  };
}

export function updateSelectionTracker(
  tracker: SelectionTracker,
  currentPosition: CellPosition,
  isStarting: boolean = false
): SelectionTracker {
  if (isStarting) {
    return {
      startPosition: currentPosition,
      currentPath: [currentPosition],
      isActive: true,
      direction: null
    };
  }
  
  if (!tracker.startPosition || !tracker.isActive) {
    return tracker;
  }
  
  const direction = getSelectionDirection(tracker.startPosition, currentPosition);
  const path = getSelectionPath(tracker.startPosition, currentPosition);
  const optimizedPath = optimizeSelectionPath(path, direction);
  
  return {
    ...tracker,
    currentPath: optimizedPath,
    direction
  };
}

export function finishSelection(tracker: SelectionTracker): CellPosition[] {
  const finalPath = tracker.currentPath;
  
  return finalPath;
}

export function clearSelection(tracker: SelectionTracker): SelectionTracker {
  return createSelectionTracker();
}