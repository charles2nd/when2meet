import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { TimeSlot } from '../../utils/types';
import { COLORS, SPACING, AVAILABILITY_COLORS } from '../../utils/constants';

interface TimeSlotCellProps {
  timeSlot: TimeSlot;
  isSelected: boolean;
  participantCount: number;
  totalParticipants: number;
  onPress: () => void;
  disabled?: boolean;
  showTime?: boolean;
  cellSize?: { width: number; height: number };
}

const TimeSlotCell: React.FC<TimeSlotCellProps> = ({
  timeSlot,
  isSelected,
  participantCount,
  totalParticipants,
  onPress,
  disabled = false,
  showTime = false,
  cellSize = { width: 60, height: 40 }
}) => {
  const getBackgroundColor = () => {
    if (disabled) {
      return COLORS.gray[200];
    }
    
    if (isSelected) {
      return COLORS.primary;
    }
    
    if (totalParticipants === 0) {
      return AVAILABILITY_COLORS.unavailable;
    }
    
    const ratio = participantCount / totalParticipants;
    
    if (ratio >= 0.8) {
      return AVAILABILITY_COLORS.optimal;
    } else if (ratio >= 0.5) {
      return AVAILABILITY_COLORS.available;
    } else if (ratio >= 0.2) {
      return AVAILABILITY_COLORS.partial;
    } else {
      return AVAILABILITY_COLORS.conflict;
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return COLORS.gray[500];
    }
    
    if (isSelected) {
      return '#FFFFFF';
    }
    
    const backgroundColor = getBackgroundColor();
    const isLight = backgroundColor === AVAILABILITY_COLORS.unavailable || 
                   backgroundColor === AVAILABILITY_COLORS.partial;
    
    return isLight ? COLORS.gray[800] : '#FFFFFF';
  };

  const getBorderColor = () => {
    if (isSelected) {
      return COLORS.primary;
    }
    return COLORS.gray[300];
  };

  const styles = StyleSheet.create({
    container: {
      width: cellSize.width,
      height: cellSize.height,
      backgroundColor: getBackgroundColor(),
      borderWidth: 1,
      borderColor: getBorderColor(),
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0.5,
      ...(Platform.OS === 'web' && {
        cursor: disabled ? 'default' : 'pointer',
        userSelect: 'none',
        transition: 'all 0.15s ease',
      }),
    },
    timeText: {
      fontSize: 10,
      fontWeight: '500',
      color: getTextColor(),
      textAlign: 'center',
    },
    countText: {
      fontSize: 8,
      color: getTextColor(),
      opacity: 0.8,
    },
    selectedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: COLORS.primary,
      opacity: 0.3,
    },
    disabledOverlay: {
      Position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: COLORS.gray[500],
      opacity: 0.5,
    }
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={`time-slot-${timeSlot.id}`}
    >
      {showTime && (
        <Text style={styles.timeText} numberOfLines={1}>
          {timeSlot.startTime}
        </Text>
      )}
      
      {participantCount > 0 && totalParticipants > 0 && (
        <Text style={styles.countText}>
          {participantCount}
        </Text>
      )}
      
      {isSelected && <View style={styles.selectedOverlay} />}
      {disabled && <View style={styles.disabledOverlay} />}
    </TouchableOpacity>
  );
};

export default memo(TimeSlotCell, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.participantCount === nextProps.participantCount &&
    prevProps.totalParticipants === nextProps.totalParticipants &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.timeSlot.id === nextProps.timeSlot.id
  );
});