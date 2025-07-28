import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvailabilityResponse, TeamMember } from '../../utils/types';
import { COLORS, SPACING } from '../../utils/constants';
import { formatTime } from '../../utils/helpers';

interface ParticipantListProps {
  responses: AvailabilityResponse[];
  teamMembers: TeamMember[];
  onParticipantPress?: (userId: string) => void;
  showAvailabilityCount?: boolean;
  showLastUpdated?: boolean;
  filterByRole?: string;
  searchable?: boolean;
}

interface ParticipantItemData extends AvailabilityResponse {
  role?: string;
  isOnline?: boolean;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  responses,
  teamMembers,
  onParticipantPress,
  showAvailabilityCount = true,
  showLastUpdated = true,
  filterByRole,
  searchable = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(filterByRole || null);

  const participantData = useMemo(() => {
    const data: ParticipantItemData[] = responses.map(response => {
      const member = teamMembers.find(m => m.userId === response.userId);
      return {
        ...response,
        role: member?.role,
        isOnline: true // TODO: Connect to real online status
      };
    });

    let filtered = data;

    if (searchQuery.trim()) {
      filtered = filtered.filter(participant =>
        participant.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRole) {
      filtered = filtered.filter(participant => participant.role === selectedRole);
    }

    return filtered.sort((a, b) => {
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1;
      }
      return b.availableSlots.length - a.availableSlots.length;
    });
  }, [responses, teamMembers, searchQuery, selectedRole]);

  const roleFilters = useMemo(() => {
    const roles = new Set(teamMembers.map(member => member.role));
    return Array.from(roles);
  }, [teamMembers]);

  const getAvailabilityColor = (slotsCount: number, maxSlots: number) => {
    if (maxSlots === 0) return COLORS.gray[400];
    
    const ratio = slotsCount / maxSlots;
    if (ratio >= 0.8) return COLORS.success;
    if (ratio >= 0.5) return COLORS.warning;
    if (ratio >= 0.2) return COLORS.accent;
    return COLORS.danger;
  };

  const maxAvailableSlots = useMemo(() => {
    return Math.max(...responses.map(r => r.availableSlots.length), 1);
  }, [responses]);

  const renderParticipantItem = ({ item }: { item: ParticipantItemData }) => (
    <TouchableOpacity
      style={styles.participantItem}
      onPress={() => onParticipantPress?.(item.userId)}
      activeOpacity={0.7}
    >
      <View style={styles.participantHeader}>
        <View style={styles.participantInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.participantName} numberOfLines={1}>
              {item.userName}
            </Text>
            <View style={[
              styles.onlineIndicator,
              { backgroundColor: item.isOnline ? COLORS.success : COLORS.gray[400] }
            ]} />
          </View>
          
          {item.role && (
            <Text style={styles.participantRole}>{item.role}</Text>
          )}
        </View>

        {showAvailabilityCount && (
          <View style={styles.availabilityBadge}>
            <View style={[
              styles.availabilityIndicator,
              { backgroundColor: getAvailabilityColor(item.availableSlots.length, maxAvailableSlots) }
            ]}>
              <Text style={styles.availabilityCount}>
                {item.availableSlots.length}
              </Text>
            </View>
          </View>
        )}
      </View>

      {showLastUpdated && (
        <Text style={styles.lastUpdated}>
          Updated {formatTime(item.lastUpdated)}
        </Text>
      )}

      {item.isAnonymous && (
        <View style={styles.anonymousBadge}>
          <Text style={styles.anonymousText}>Anonymous</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRoleFilter = () => (
    <View style={styles.roleFilterContainer}>
      <TouchableOpacity
        style={[
          styles.roleFilterItem,
          !selectedRole && styles.roleFilterItemActive
        ]}
        onPress={() => setSelectedRole(null)}
      >
        <Text style={[
          styles.roleFilterText,
          !selectedRole && styles.roleFilterTextActive
        ]}>
          All
        </Text>
      </TouchableOpacity>
      
      {roleFilters.map(role => (
        <TouchableOpacity
          key={role}
          style={[
            styles.roleFilterItem,
            selectedRole === role && styles.roleFilterItemActive
          ]}
          onPress={() => setSelectedRole(role)}
        >
          <Text style={[
            styles.roleFilterText,
            selectedRole === role && styles.roleFilterTextActive
          ]}>
            {role}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color={COLORS.gray[500]} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search participants..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={COLORS.gray[500]}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Ionicons name="close-circle" size={20} color={COLORS.gray[500]} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>
        Participants ({participantData.length})
      </Text>
      
      {searchable && renderSearchBar()}
      {roleFilters.length > 1 && renderRoleFilter()}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={48} color={COLORS.gray[400]} />
      <Text style={styles.emptyStateTitle}>No participants yet</Text>
      <Text style={styles.emptyStateText}>
        Share the event link to get responses
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={participantData}
        renderItem={renderParticipantItem}
        keyExtractor={item => item.userId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          participantData.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  headerContainer: {
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.xs,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  roleFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  roleFilterItem: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.gray[200],
    borderRadius: 16,
  },
  roleFilterItemActive: {
    backgroundColor: COLORS.primary,
  },
  roleFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[700],
  },
  roleFilterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: SPACING.md,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  participantItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  participantInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginRight: SPACING.xs,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  participantRole: {
    fontSize: 14,
    color: COLORS.gray[600],
    textTransform: 'capitalize',
  },
  availabilityBadge: {
    alignItems: 'center',
  },
  availabilityIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lastUpdated: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  anonymousBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: SPACING.xs,
  },
  anonymousText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[600],
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    maxWidth: 200,
    lineHeight: 20,
  },
});

export default ParticipantList;