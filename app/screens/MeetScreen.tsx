import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMockData } from "../contexts/MockDataContext";

const MeetScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { calendarEvents, availabilityEvents, currentTeam } = useMockData();

  const handleCreateAvailability = () => {
    navigation.navigate("CreateAvailability", {
      teamId: currentTeam?.id || "team1",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meet</Text>
        <Text style={styles.subtitle}>
          Schedule and coordinate with {currentTeam?.name}
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleCreateAvailability}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.iconText}>+</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Create Availability Event</Text>
            <Text style={styles.actionDescription}>
              Find the best time for your team to meet
            </Text>
          </View>
        </TouchableOpacity>

        {/* Availability Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Availability Events</Text>
          {availabilityEvents.length === 0 ? (
            <Text style={styles.emptyText}>
              No active availability events. Create one!
            </Text>
          ) : (
            availabilityEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() =>
                  navigation.navigate("AvailabilityEvent", {
                    eventId: event.id,
                  })
                }
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>
                    {event.startDate} - {event.endDate}
                  </Text>
                </View>
                <Text style={styles.eventShare}>Share: {event.shareLink}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Calendar Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Calendar Events</Text>
          {calendarEvents.map((event) => (
            <View key={event.id} style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <View
                  style={[
                    styles.eventTypeIndicator,
                    { backgroundColor: getEventTypeColor(event.type) },
                  ]}
                />
                <View style={styles.calendarContent}>
                  <Text style={styles.calendarTitle}>{event.title}</Text>
                  <Text style={styles.calendarMeta}>
                    {event.type} • {event.date} • {event.startTime} -{" "}
                    {event.endTime}
                  </Text>
                  <Text style={styles.calendarParticipants}>
                    {event.participants.length} participants
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const getEventTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    Tournament: "#ef4444",
    Practice: "#3b82f6",
    Scrim: "#f59e0b",
    Game: "#8b5cf6",
    "Day Off": "#10b981",
  };
  return colors[type] || "#6b7280";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  content: {
    padding: 16,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 20,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  eventShare: {
    fontSize: 12,
    color: "#8b5cf6",
    fontWeight: "500",
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  calendarMeta: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  calendarParticipants: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
});

export default MeetScreen;
