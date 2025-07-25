import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AvailabilityEvent,
  AvailabilityResponse,
  OptimalTimeSlot,
  ParticipationSummary
} from '../../utils/types';
import { COLORS, SPACING, AVAILABILITY_COLORS } from '../../utils/constants';
import { 
  calculateOptimalTimeSlots,
  calculateParticipationSummary,
  generateShareableEventSummary 
} from '../../utils/availabilityHelpers';
import { formatDateLabel, formatTimeSlotLabel } from '../../utils/helpers';

interface SummaryViewProps {
  event: AvailabilityEvent;
  responses: AvailabilityResponse[];
  onTimeSlotPress?: (timeSlot: OptimalTimeSlot) => void;
  onSharePress?: (summary: string) => void;
  showDetailedStats?: boolean;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  event,
  responses,
  onTimeSlotPress,
  onSharePress,
  showDetailedStats = false
}) => {
  const optimalSlots = useMemo(() => 
    calculateOptimalTimeSlots(event.timeSlots, responses), 
    [event.timeSlots, responses]
  );

  const participationSummary = useMemo(() => 
    calculateParticipationSummary(event, responses), 
    [event, responses]
  );

  const topSlots = useMemo(() => optimalSlots.slice(0, 5), [optimalSlots]);
  const conflictSlots = useMemo(() => optimalSlots.slice(-3), [optimalSlots]);

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return AVAILABILITY_COLORS.optimal;
    if (score >= 0.6) return AVAILABILITY_COLORS.available;
    if (score >= 0.4) return AVAILABILITY_COLORS.partial;
    return AVAILABILITY_COLORS.conflict;
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  const handleShare = () => {
    const summary = generateShareableEventSummary(event, responses);
    onSharePress?.(summary);
  };

  const renderParticipationStats = () => (
    <View style={styles.statsCard}>
      <Text style={styles.cardTitle}>Participation Overview</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{participationSummary.respondedCount}</Text>
          <Text style={styles.statLabel}>Responses</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{participationSummary.totalParticipants}</Text>
          <Text style={styles.statLabel}>Invited</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getScoreColor(participationSummary.responseRate) }]}>
            {Math.round(participationSummary.responseRate * 100)}%
          </Text>
          <Text style={styles.statLabel}>Response Rate</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${participationSummary.responseRate * 100}%`,
                backgroundColor: getScoreColor(participationSummary.responseRate)
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );

  const renderOptimalTimes = () => (
    <View style={styles.statsCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Best Meeting Times</Text>
        <Ionicons name="trophy" size={20} color={COLORS.warning} />
      </View>
      
      {topSlots.length === 0 ? (
        <Text style={styles.emptyText}>No responses yet</Text>
      ) : (
        topSlots.map((slot, index) => (
          <TouchableOpacity
            key={slot.timeSlot.id}
            style={styles.timeSlotItem}
            onPress={() => onTimeSlotPress?.(slot)}
          >
            <View style={styles.timeSlotRank}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            
            <View style={styles.timeSlotInfo}>
              <Text style={styles.timeSlotTime}>
                {formatDateLabel(slot.timeSlot.date)} • {formatTimeSlotLabel(slot.timeSlot)}
              </Text>
              <Text style={styles.timeSlotDetails}>
                {slot.availableCount} of {responses.length} available
              </Text>
            </View>
            
            <View style={styles.timeSlotScore}>
              <View style={[
                styles.scoreIndicator,
                { backgroundColor: getScoreColor(slot.score) }
              ]}>
                <Text style={styles.scoreText}>
                  {Math.round(slot.score * 100)}%
                </Text>
              </View>
              <Text style={[
                styles.scoreLabel,
                { color: getScoreColor(slot.score) }
              ]}>
                {getScoreLabel(slot.score)}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderConflictAnalysis = () => (
    <View style={styles.statsCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Potential Conflicts</Text>
        <Ionicons name="warning" size={20} color={COLORS.danger} />
      </View>
      
      {conflictSlots.length === 0 ? (
        <Text style={styles.emptyText}>No conflicts detected</Text>
      ) : (
        conflictSlots.map((slot) => (
          <View key={slot.timeSlot.id} style={styles.conflictItem}>
            <Text style={styles.conflictTime}>
              {formatDateLabel(slot.timeSlot.date)} • {formatTimeSlotLabel(slot.timeSlot)}
            </Text>
            <Text style={styles.conflictDetails}>
              {slot.conflictingUsers.length} participants unavailable
            </Text>
            <View style={styles.conflictBar}>
              <View 
                style={[
                  styles.conflictFill,
                  { width: `${(1 - slot.score) * 100}%` }
                ]} 
              />
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderAvailabilityHeatmap = () => {
    const heatmapData = optimalSlots.slice(0, 10);
    
    return (
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Availability Heatmap</Text>
        
        <View style={styles.heatmapContainer}>
          {heatmapData.map((slot) => (
            <View key={slot.timeSlot.id} style={styles.heatmapItem}>
              <View 
                style={[
                  styles.heatmapCell,
                  { backgroundColor: getScoreColor(slot.score) }
                ]}
              />
              <Text style={styles.heatmapLabel} numberOfLines={2}>
                {slot.timeSlot.startTime}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.heatmapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: AVAILABILITY_COLORS.optimal }]} />
            <Text style={styles.legendText}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: AVAILABILITY_COLORS.available }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: AVAILABILITY_COLORS.conflict }]} />
            <Text style={styles.legendText}>Low</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionContainer}>
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-outline" size={20} color="#FFFFFF" />
        <Text style={styles.shareButtonText}>Share Summary</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderParticipationStats()}
      {renderOptimalTimes()}
      
      {showDetailedStats && (
        <>
          {renderConflictAnalysis()}
          {renderAvailabilityHeatmap()}
        </>
      )}
      
      {renderActionButtons()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.md,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  timeSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  timeSlotRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeSlotInfo: {
    flex: 1,
  },
  timeSlotTime: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  timeSlotDetails: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  timeSlotScore: {
    alignItems: 'center',
  },
  scoreIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginBottom: SPACING.xs,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  conflictItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  conflictTime: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  conflictDetails: {
    fontSize: 12,
    color: COLORS.danger,
    marginBottom: SPACING.xs,
  },
  conflictBar: {
    height: 4,
    backgroundColor: COLORS.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  conflictFill: {
    height: '100%',
    backgroundColor: COLORS.danger,
  },
  heatmapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  heatmapItem: {
    width: '18%',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  heatmapCell: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  heatmapLabel: {
    fontSize: 10,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  heatmapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  actionContainer: {
    padding: SPACING.md,
  },
  shareButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    paddingVertical: SPACING.lg,
    fontStyle: 'italic',
  },
});

export default SummaryView;