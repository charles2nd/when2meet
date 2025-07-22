import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, GAME_LABELS } from '../../utils/constants';
import { Team, ChatMessage } from '../../utils/types';
import { mockTeams, mockMessages } from '../../utils/mockData';
import { formatRelativeTime, getInitials, truncateText } from '../../utils/helpers';

export default function GroupsScreen() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Get recent messages for each team
  const getRecentMessage = (teamId: string) => {
    const teamMessages = mockMessages.filter((msg) => msg.teamId === teamId);
    return teamMessages.length > 0 ? teamMessages[teamMessages.length - 1] : null;
  };

  const renderTeamCard = ({ item }: { item: Team }) => {
    const recentMessage = getRecentMessage(item.id);
    const onlineMembers = Math.floor(Math.random() * item.members.length) + 1;

    return (
      <TouchableOpacity style={styles.teamCard} onPress={() => setSelectedTeam(item)}>
        <View style={styles.teamHeader}>
          <View style={styles.teamLogoContainer}>
            {item.logo ? (
              <Image source={{ uri: item.logo }} style={styles.teamLogo} />
            ) : (
              <View style={[styles.teamLogo, styles.teamLogoPlaceholder]}>
                <Text style={styles.teamLogoText}>{getInitials(item.name)}</Text>
              </View>
            )}
          </View>
          <View style={styles.teamInfo}>
            <View style={styles.teamTitleRow}>
              <Text style={styles.teamName}>{item.name}</Text>
              <View style={styles.gameTag}>
                <Text style={styles.gameTagText}>{GAME_LABELS[item.game]}</Text>
              </View>
            </View>
            <Text style={styles.teamDescription}>{truncateText(item.description, 50)}</Text>
            <View style={styles.teamStats}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={14} color={COLORS.gray[400]} />
                <Text style={styles.statText}>{item.members.length} members</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.onlineDot} />
                <Text style={styles.statText}>{onlineMembers} online</Text>
              </View>
              {item.stats && (
                <View style={styles.statItem}>
                  <Ionicons name="trophy" size={14} color={COLORS.warning} />
                  <Text style={styles.statText}>{item.stats.winRate.toFixed(0)}% WR</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {recentMessage && (
          <View style={styles.recentMessageContainer}>
            <Text style={styles.recentMessageSender}>{recentMessage.senderName}:</Text>
            <Text style={styles.recentMessageText}>{truncateText(recentMessage.content, 40)}</Text>
            <Text style={styles.recentMessageTime}>
              {formatRelativeTime(recentMessage.createdAt)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTeamDetail = () => {
    if (!selectedTeam) return null;

    const teamMessages = mockMessages.filter((msg) => msg.teamId === selectedTeam.id);

    const renderMessage = ({ item }: { item: ChatMessage }) => (
      <View style={styles.messageContainer}>
        <View style={styles.messageHeader}>
          {item.senderAvatar ? (
            <Image source={{ uri: item.senderAvatar }} style={styles.messageAvatar} />
          ) : (
            <View style={[styles.messageAvatar, styles.messageAvatarPlaceholder]}>
              <Text style={styles.messageAvatarText}>{getInitials(item.senderName)}</Text>
            </View>
          )}
          <View style={styles.messageInfo}>
            <View style={styles.messageInfoHeader}>
              <Text style={styles.messageSender}>{item.senderName}</Text>
              <Text style={styles.messageTime}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
            <Text style={styles.messageContent}>{item.content}</Text>
          </View>
        </View>
      </View>
    );

    return (
      <View style={styles.teamDetailContainer}>
        {/* Team Detail Header */}
        <View style={styles.teamDetailHeader}>
          <TouchableOpacity onPress={() => setSelectedTeam(null)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.light} />
          </TouchableOpacity>
          <View style={styles.teamDetailInfo}>
            {selectedTeam.logo ? (
              <Image source={{ uri: selectedTeam.logo }} style={styles.teamDetailLogo} />
            ) : (
              <View style={[styles.teamDetailLogo, styles.teamLogoPlaceholder]}>
                <Text style={styles.teamLogoText}>{getInitials(selectedTeam.name)}</Text>
              </View>
            )}
            <Text style={styles.teamDetailName}>{selectedTeam.name}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="settings" size={24} color={COLORS.light} />
          </TouchableOpacity>
        </View>

        {/* Members List */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Members ({selectedTeam.members.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedTeam.members.map((member) => (
              <View key={member.userId} style={styles.memberItem}>
                {member.avatar ? (
                  <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                ) : (
                  <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder]}>
                    <Text style={styles.memberAvatarText}>{getInitials(member.displayName)}</Text>
                  </View>
                )}
                <Text style={styles.memberName}>{member.displayName}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Chat Messages */}
        <View style={styles.chatSection}>
          <Text style={styles.sectionTitle}>Team Chat</Text>
          <FlatList
            data={teamMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
          />

          <View style={styles.messageInput}>
            <TouchableOpacity style={styles.messageInputField}>
              <Text style={styles.messageInputPlaceholder}>Type a message...</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton}>
              <Ionicons name="send" size={20} color={COLORS.light} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (selectedTeam) {
    return <SafeAreaView style={styles.container}>{renderTeamDetail()}</SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Teams</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={COLORS.light} />
          </TouchableOpacity>
        </View>

        {/* Teams List */}
        <FlatList
          data={mockTeams}
          renderItem={renderTeamCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Create Team</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="search" size={24} color={COLORS.secondary} />
            <Text style={styles.quickActionText}>Find Teams</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.light,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamCard: {
    backgroundColor: COLORS.gray[900],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[800],
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  teamLogoContainer: {
    marginRight: SPACING.md,
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
  },
  teamLogoPlaceholder: {
    backgroundColor: COLORS.gray[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.light,
  },
  teamInfo: {
    flex: 1,
  },
  teamTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.light,
    marginRight: SPACING.sm,
  },
  gameTag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  gameTagText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.primary,
  },
  teamDescription: {
    fontSize: 14,
    color: COLORS.gray[300],
    marginBottom: SPACING.sm,
  },
  teamStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statText: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginLeft: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  recentMessageContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[800],
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentMessageSender: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray[300],
    marginRight: 4,
  },
  recentMessageText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray[400],
  },
  recentMessageTime: {
    fontSize: 10,
    color: COLORS.gray[500],
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  quickActionText: {
    fontSize: 14,
    color: COLORS.light,
    marginTop: SPACING.sm,
  },
  // Team Detail Styles
  teamDetailContainer: {
    flex: 1,
  },
  teamDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.darker,
  },
  teamDetailInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  teamDetailLogo: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  teamDetailName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.light,
  },
  membersSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray[900],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light,
    marginBottom: SPACING.md,
  },
  memberItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 60,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberAvatarPlaceholder: {
    backgroundColor: COLORS.gray[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.light,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.light,
    marginTop: 4,
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 10,
    color: COLORS.gray[400],
    textAlign: 'center',
  },
  chatSection: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  messagesList: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  messageContainer: {
    marginBottom: SPACING.md,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.sm,
  },
  messageAvatarPlaceholder: {
    backgroundColor: COLORS.gray[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.light,
  },
  messageInfo: {
    flex: 1,
  },
  messageInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.light,
    marginRight: SPACING.sm,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  messageContent: {
    fontSize: 14,
    color: COLORS.gray[200],
    lineHeight: 20,
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  messageInputField: {
    flex: 1,
    backgroundColor: COLORS.gray[800],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
  },
  messageInputPlaceholder: {
    color: COLORS.gray[400],
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
