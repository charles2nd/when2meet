import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMockData } from '../../contexts/MockDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import InitialSetup from '../../components/InitialSetup';
import { COLORS, SPACING } from '../../utils/constants';

const MeetScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const { 
    availabilityEvents, 
    calendarEvents, 
    currentTeam,
    currentUser,
    getEventResponses,
    getOptimalTimeSlots,
    isLoaded
  } = useMockData();
  
  const handleCreateAvailability = () => {
    navigation.navigate('availability/create');
  };

  const handleViewEvent = (eventId: string) => {
    navigation.navigate('availability/[eventId]', { eventId });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEventStats = (eventId: string) => {
    const responses = getEventResponses(eventId);
    const optimal = getOptimalTimeSlots(eventId);
    const totalMembers = currentTeam?.members.length || 0;
    const responseRate = totalMembers > 0 ? Math.round((responses.length / totalMembers) * 100) : 0;
    
    return {
      responses: responses.length,
      totalMembers,
      responseRate,
      bestSlots: optimal.slice(0, 3)
    };
  };

  const teamEvents = availabilityEvents.filter(event => event.teamId === currentTeam?.id);
  const upcomingCalendarEvents = calendarEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate >= today;
  }).slice(0, 3);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('meet.loading')}</Text>
      </View>
    );
  }

  // Show initial setup if no user or team exists
  if (!currentUser || !currentTeam) {
    return <InitialSetup onComplete={() => {}} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('meet.title')}</Text>
        <Text style={styles.subtitle}>{t('meet.subtitle', { team: currentTeam?.name || '' })}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.headerInfoText}>{t('meet.headerInfo')}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>{t('meet.quickActions')}</Text>
        </View>
        <TouchableOpacity style={styles.createActionCard} onPress={handleCreateAvailability}>
          <View style={styles.createActionIcon}>
            <Ionicons name="add" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.createActionTitle}>{t('meet.createAction.title')}</Text>
            <Text style={styles.actionDescription}>
              {t('meet.createAction.description')}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Active Availability Events */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{t('meet.activeEvents.title')}</Text>
            <Text style={styles.sectionHelper}>{t('meet.activeEvents.helper')}</Text>
          </View>
          
          {teamEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="time-outline" size={48} color={COLORS.gray[400]} />
              <Text style={styles.emptyTitle}>{t('meet.activeEvents.empty.title')}</Text>
              <Text style={styles.emptyDescription}>
                {t('meet.activeEvents.empty.description')}
              </Text>
            </View>
          ) : (
            teamEvents.map(event => {
              const stats = getEventStats(event.id);
              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => handleViewEvent(event.id)}
                >
                  <View style={styles.eventHeader}>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDate}>
                        {formatDate(event.startDate)} - {formatDate(event.endDate)}
                      </Text>
                      <Text style={styles.eventTime}>
                        {event.startTime} - {event.endTime}
                      </Text>
                    </View>
                    <View style={styles.eventStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.responseRate}%</Text>
                        <Text style={styles.statLabel}>{t('meet.event.responseLabel')}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
                  
                  <View style={styles.eventFooter}>
                    <View style={styles.eventStatus}>
                      <Ionicons name="people" size={16} color={COLORS.gray[500]} />
                      <Text style={styles.eventStatusText}>
                        {t('meet.event.respondedStatus', { responses: stats.responses, total: stats.totalMembers })}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Upcoming Calendar Events */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{t('meet.upcomingEvents.title')}</Text>
            <Text style={styles.sectionHelper}>{t('meet.upcomingEvents.helper')}</Text>
          </View>
          
          {upcomingCalendarEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.gray[400]} />
              <Text style={styles.emptyTitle}>{t('meet.upcomingEvents.empty.title')}</Text>
              <Text style={styles.emptyDescription}>
                {t('meet.upcomingEvents.empty.description')}
              </Text>
            </View>
          ) : (
            upcomingCalendarEvents.map(event => (
              <View key={event.id} style={styles.calendarCard}>
                <View style={styles.calendarHeader}>
                  <View style={[
                    styles.eventTypeIndicator,
                    { backgroundColor: getEventTypeColor(event.type) }
                  ]} />
                  <View style={styles.calendarContent}>
                    <Text style={styles.calendarTitle}>{event.title}</Text>
                    <Text style={styles.calendarMeta}>
                      {event.type} • {formatDate(event.date)} • {event.startTime} - {event.endTime}
                    </Text>
                    <Text style={styles.calendarParticipants}>
                      {t('meet.calendar.participants', { count: event.participants.length })}
                    </Text>
                    {event.linkedAvailabilityEventId && (
                      <TouchableOpacity 
                        style={styles.linkedEventButton}
                        onPress={() => handleViewEvent(event.linkedAvailabilityEventId!)}
                      >
                        <Ionicons name="link" size={12} color={COLORS.primary} />
                        <Text style={styles.linkedEventText}>{t('meet.calendar.viewAvailability')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const getEventTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'Tournament': '#ef4444',
    'Practice': '#3b82f6',
    'Scrim': '#f59e0b',
    'Game': '#8b5cf6',
    'Day Off': '#10b981',
  };
  return colors[type] || '#6b7280';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  headerInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  headerInfoText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  createActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  createActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  createActionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionContent: {
    flex: 1,
  },
  actionDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitleContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionHelper: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventInfo: {
    flex: 1,
    marginRight: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  eventStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  eventDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 18,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventStatusText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  calendarContent: {
    flex: 1,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  calendarMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  calendarParticipants: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  linkedEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  linkedEventText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default MeetScreen;