import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAvailability } from '../../../hooks/useAvailability';
import { useAuth } from '../../../hooks/useAuth';
import { useTeam } from '../../../hooks/useTeam';
import AvailabilityGrid from '../../../components/availability/AvailabilityGrid';
import ParticipantList from '../../../components/availability/ParticipantList';
import SummaryView from '../../../components/availability/SummaryView';
import GestureHandler from '../../../components/availability/GestureHandler';
import { COLORS, SPACING } from '../../../utils/constants';
import { CellPosition, GridLayout, OptimalTimeSlot } from '../../../utils/types';
import { formatDate } from '../../../utils/helpers';

type ViewMode = 'grid' | 'participants' | 'summary';

const AvailabilityEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { eventId } = route.params || {};
  const { user } = useAuth();
  
  const {
    event,
    responses,
    userResponse,
    optimalSlots,
    loading,
    error,
    isConnected,
    updateUserAvailability
  } = useAvailability({
    eventId: eventId || '',
    userId: user?.id
  });

  const { team, members } = useTeam({ 
    teamId: event?.teamId || '' 
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [gridLayout, setGridLayout] = useState<GridLayout>({
    cellWidth: 60,
    cellHeight: 40,
    headerHeight: 50,
    scrollOffset: 0,
    maxColumns: 0,
    maxRows: 0
  });

  const userSelection = userResponse?.availableSlots || [];

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleSelectionStart = (position: CellPosition) => {
    console.log('Selection started at:', position);
  };

  const handleSelectionUpdate = (path: CellPosition[]) => {
    console.log('Selection updated:', path.length, 'cells');
  };

  const handleSelectionEnd = (path: CellPosition[]) => {
    console.log('Selection ended with', path.length, 'cells');
  };

  const handleSingleTap = (position: CellPosition) => {
    console.log('Single tap at:', position);
  };

  const handleSelectionChange = async (selectedSlots: string[]) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to update availability');
      return;
    }

    try {
      await updateUserAvailability(selectedSlots);
    } catch (error) {
      console.error('Failed to update availability:', error);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const handleShare = async (summary?: string) => {
    if (!event) return;

    const shareContent = summary || `Check out this availability event: ${event.title}\n\nRespond at: https://when2meet.app/event/${eventId}`;
    
    try {
      await Share.share({
        message: shareContent,
        title: event.title
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleTimeSlotPress = (timeSlot: OptimalTimeSlot) => {
    Alert.alert(
      'Time Slot Details',
      `${formatDate(new Date(timeSlot.timeSlot.date))} • ${timeSlot.timeSlot.startTime}-${timeSlot.timeSlot.endTime}\n\n${timeSlot.availableCount} out of ${responses.length} participants available`,
      [{ text: 'OK' }]
    );
  };

  const handleParticipantPress = (userId: string) => {
    const participant = responses.find(r => r.userId === userId);
    if (participant) {
      Alert.alert(
        participant.userName,
        `Available for ${participant.availableSlots.length} time slots\nLast updated: ${formatDate(participant.lastUpdated)}`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.gray[900]} />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {event?.title || 'Loading...'}
        </Text>
        {event && (
          <Text style={styles.eventDates}>
            {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </Text>
        )}
      </View>

      <TouchableOpacity onPress={() => handleShare()}>
        <Ionicons name="share-outline" size={24} color={COLORS.gray[900]} />
      </TouchableOpacity>
    </View>
  );

  const renderConnectionStatus = () => {
    if (!isConnected) {
      return (
        <View style={styles.connectionBanner}>
          <Ionicons name="wifi-outline" size={16} color={COLORS.warning} />
          <Text style={styles.connectionText}>Connection lost. Retrying...</Text>
        </View>
      );
    }
    return null;
  };

  const renderViewSelector = () => (
    <View style={styles.viewSelector}>
      <TouchableOpacity
        style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
        onPress={() => setViewMode('grid')}
      >
        <Ionicons 
          name="grid-outline" 
          size={20} 
          color={viewMode === 'grid' ? '#FFFFFF' : COLORS.gray[600]} 
        />
        <Text style={[
          styles.viewButtonText,
          viewMode === 'grid' && styles.viewButtonTextActive
        ]}>
          Grid
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.viewButton, viewMode === 'participants' && styles.viewButtonActive]}
        onPress={() => setViewMode('participants')}
      >
        <Ionicons 
          name="people-outline" 
          size={20} 
          color={viewMode === 'participants' ? '#FFFFFF' : COLORS.gray[600]} 
        />
        <Text style={[
          styles.viewButtonText,
          viewMode === 'participants' && styles.viewButtonTextActive
        ]}>
          People
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.viewButton, viewMode === 'summary' && styles.viewButtonActive]}
        onPress={() => setViewMode('summary')}
      >
        <Ionicons 
          name="analytics-outline" 
          size={20} 
          color={viewMode === 'summary' ? '#FFFFFF' : COLORS.gray[600]} 
        />
        <Text style={[
          styles.viewButtonText,
          viewMode === 'summary' && styles.viewButtonTextActive
        ]}>
          Summary
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading availability data...</Text>
        </View>
      );
    }

    if (!event) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorTitle}>Event Not Found</Text>
          <Text style={styles.errorText}>
            This availability event doesn't exist or you don't have permission to view it.
          </Text>
        </View>
      );
    }

    switch (viewMode) {
      case 'grid':
        return (
          <GestureHandler
            gridLayout={gridLayout}
            onSelectionStart={handleSelectionStart}
            onSelectionUpdate={handleSelectionUpdate}
            onSelectionEnd={handleSelectionEnd}
            onSingleTap={handleSingleTap}
          >
            <AvailabilityGrid
              timeSlots={event.timeSlots}
              userSelection={userSelection}
              responses={responses}
              onSelectionChange={handleSelectionChange}
              readonly={!user}
            />
          </GestureHandler>
        );

      case 'participants':
        return (
          <ParticipantList
            responses={responses}
            teamMembers={members}
            onParticipantPress={handleParticipantPress}
            searchable={true}
          />
        );

      case 'summary':
        return (
          <SummaryView
            event={event}
            responses={responses}
            onTimeSlotPress={handleTimeSlotPress}
            onSharePress={handleShare}
            showDetailedStats={true}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderConnectionStatus()}
      {renderViewSelector()}
      
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  eventDates: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  connectionText: {
    fontSize: 14,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 8,
    padding: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: COLORS.primary,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[600],
    marginLeft: SPACING.xs,
  },
  viewButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray[600],
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.danger,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});

export default AvailabilityEventScreen;