import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Availability } from '../models/SimpleAvailability';
import { ChatService, ChatMessage } from '../services/ChatService';
import { LocalStorage } from '../services/LocalStorage';
import { DateUtils } from '../utils/dateUtils';

const DateDetailScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const { user, currentGroup, groupAvailabilities, myAvailability, saveAvailability, loadGroupAvailabilities, t, language } = useApp();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<string>('');
  
  // Initialize currentDate with params in useEffect to avoid useInsertionEffect warning
  useEffect(() => {
    const dateParam = params.date as string;
    if (dateParam) {
      setCurrentDate(dateParam);
    } else {
      setCurrentDate(new Date().toISOString().split('T')[0]);
    }
  }, [params.date]);
  const [availableMembers, setAvailableMembers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [showTimeRangePicker, setShowTimeRangePicker] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(9);
  const [endTime, setEndTime] = useState<number>(17);
  const [userAvailability, setUserAvailability] = useState<Availability | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [userDefaultTimeRange, setUserDefaultTimeRange] = useState<{ startTime: number; endTime: number } | null>(null);
  const [lastSetTimeRange, setLastSetTimeRange] = useState<{ startTime: number; endTime: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // Enhanced time range presets with translations
  const getTimePresets = () => [
    { id: 'morning', name: t.calendar.morning, description: t.calendar.morningDesc, startTime: 6, endTime: 12, icon: 'sunny', color: Colors.accent },
    { id: 'afternoon', name: t.calendar.afternoon, description: t.calendar.afternoonDesc, startTime: 12, endTime: 18, icon: 'partly-sunny', color: Colors.primary },
    { id: 'evening', name: t.calendar.evening, description: t.calendar.eveningDesc, startTime: 18, endTime: 24, icon: 'moon', color: Colors.secondary },
    { id: 'work', name: t.calendar.workHours, description: t.calendar.workHoursDesc, startTime: 9, endTime: 17, icon: 'business', color: Colors.success },
    { id: 'fullday', name: t.calendar.fullDay, description: t.calendar.fullDayDesc, startTime: 0, endTime: 24, icon: 'time', color: Colors.text.primary },
  ];

  useEffect(() => {
    if (!currentDate || !currentGroup) return;

    // Find all members available on this date
    const available = new Set<string>();
    
    groupAvailabilities.forEach(availability => {
      const hasAvailability = availability.slots.some(slot => 
        slot.date === currentDate && slot.available
      );
      if (hasAvailability) {
        available.add(availability.userId);
      }
    });

    setAvailableMembers(Array.from(available));

    // Initialize user availability - CRITICAL: Always use the latest myAvailability from AppContext
    if (myAvailability) {
      console.log('[DATE_DETAIL] Using myAvailability with', myAvailability.slots.length, 'total slots');
      console.log('[DATE_DETAIL] myAvailability slots by date:', myAvailability.slots.reduce((acc, slot) => {
        acc[slot.date] = (acc[slot.date] || 0) + (slot.available ? 1 : 0);
        return acc;
      }, {} as Record<string, number>));
      
      // Create a deep clone to ensure we're working with a fresh copy
      setUserAvailability(myAvailability.clone());
    } else if (user && currentGroup) {
      console.log('[DATE_DETAIL] Loading existing availability or creating new one');
      // CRITICAL FIX: Always try to load existing availability first before creating new
      const loadExistingAvailability = async () => {
        try {
          const existingAvailability = await LocalStorage.getAvailability(user.id, currentGroup.id);
          if (existingAvailability) {
            console.log('[DATE_DETAIL] Found existing availability with', existingAvailability.slots.length, 'slots');
            setUserAvailability(existingAvailability);
          } else {
            console.log('[DATE_DETAIL] No existing availability found, creating new one');
            const newAvailability = new Availability({
              userId: user.id,
              groupId: currentGroup.id
            });
            setUserAvailability(newAvailability);
          }
        } catch (error) {
          console.error('[DATE_DETAIL] Error loading existing availability:', error);
          // Fallback to creating new availability
          const newAvailability = new Availability({
            userId: user.id,
            groupId: currentGroup.id
          });
          setUserAvailability(newAvailability);
        }
      };
      
      loadExistingAvailability();
    }

    // Load user's default time range
    if (user) {
      loadUserDefaultTimeRange();
    }

    // Messages will be loaded via Firestore subscription
  }, [currentDate, currentGroup, groupAvailabilities, myAvailability, user]);

  const loadUserDefaultTimeRange = async () => {
    if (!user) return;
    try {
      const defaultRange = await LocalStorage.getUserDefaultTimeRange(user.id);
      setUserDefaultTimeRange(defaultRange);
    } catch (error) {
      console.error('Error loading user default time range:', error);
    }
  };

  // Subscribe to chat messages for the current date
  useEffect(() => {
    if (!currentGroup || !currentDate) return;

    console.log('[DATE_DETAIL] Setting up chat subscription for date:', currentDate);
    
    const unsubscribe = ChatService.subscribeToDateMessages(
      currentGroup.id,
      currentDate,
      (newMessages) => {
        console.log('[DATE_DETAIL] Received', newMessages.length, 'messages for date:', currentDate);
        setMessages(newMessages);
        
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => {
          if (flatListRef.current && newMessages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }
    );

    return () => {
      console.log('[DATE_DETAIL] Cleaning up chat subscription');
      unsubscribe();
    };
  }, [currentGroup, currentDate]);

  const sendMessage = async () => {
    if (!messageText.trim() || !user || !currentGroup || isSending) return;

    setIsSending(true);
    
    try {
      console.log('[DATE_DETAIL] Sending message to Firestore for date:', currentDate);
      
      await ChatService.sendMessage(
        currentGroup.id,
        currentDate,
        user.id,
        user.name,
        messageText.trim()
      );
      
      setMessageText('');
      console.log('[DATE_DETAIL] ✅ Message sent successfully');
      
      // Auto-scroll to bottom after sending message
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 200);
    } catch (error) {
      console.error('[DATE_DETAIL] ❌ Error sending message:', error);
      showToastMessage(t.calendar.failedToSendMessage);
    } finally {
      setIsSending(false);
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    
    // Reset animation
    toastOpacity.setValue(0);
    
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500), // Slightly longer display time for better readability
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
    });
  };

  const formatDate = (dateStr: string) => {
    return DateUtils.formatDate(dateStr, language || 'en', {
      weekday: true,
      year: true,
      month: 'long',
      day: true
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const handleSetTimeRange = async () => {
    if (!userAvailability || !currentGroup) {
      showToastMessage(`❌ ${t.calendar.unableToSetAvailability}`);
      return;
    }
    
    if (startTime >= endTime) {
      showToastMessage(`⚠️ ${t.calendar.endTimeAfterStart}`);
      return;
    }

    try {
      console.log('[DATE_DETAIL] Setting time range for date:', currentDate, 'from', startTime, 'to', endTime);
      console.log('[DATE_DETAIL] Current availability has', userAvailability.slots.length, 'total slots before update');
      
      // Use the clone method to create a proper deep copy that preserves all existing availability
      const updatedAvailability = userAvailability.clone();
      
      // Clear existing availability for this date only (this preserves other dates)
      updatedAvailability.clearDay(currentDate);
      console.log('[DATE_DETAIL] After clearing current date, availability has', updatedAvailability.slots.length, 'slots');
      
      // Set availability for the selected time range
      for (let hour = startTime; hour < endTime; hour++) {
        updatedAvailability.setSlot(currentDate, hour, true);
      }
      
      console.log('[DATE_DETAIL] After setting new times, availability has', updatedAvailability.slots.length, 'total slots');
      console.log('[DATE_DETAIL] Slots by date:', updatedAvailability.slots.reduce((acc, slot) => {
        acc[slot.date] = (acc[slot.date] || 0) + (slot.available ? 1 : 0);
        return acc;
      }, {} as Record<string, number>));
      
      // Update local state first
      setUserAvailability(updatedAvailability);
      
      // Save to storage
      await saveAvailability(updatedAvailability);
      
      // Save the last set time range
      setLastSetTimeRange({ startTime, endTime });
      
      // Refresh calendar to show updated colors
      await loadGroupAvailabilities();
      
      const timeStr = DateUtils.formatTimeRange(startTime, endTime, language || 'en');
      showToastMessage(`✅ ${t.calendar.customRangeSet}: ${timeStr}`);
      
      // Close popup after successful save
      setShowTimeRangePicker(false);
    } catch (error) {
      console.error('[DATE_DETAIL] Error saving time range:', error);
      showToastMessage(`❌ ${t.calendar.failedToSave}`);
      // Still close popup even on error
      setShowTimeRangePicker(false);
    }
  };

  const handlePresetSelection = async (preset: any) => {
    if (!userAvailability || !currentGroup) {
      showToastMessage(`❌ ${t.calendar.unableToSetAvailability}`);
      return;
    }

    try {
      console.log('[DATE_DETAIL] Setting preset', preset.name, 'for date:', currentDate);
      console.log('[DATE_DETAIL] Current availability has', userAvailability.slots.length, 'total slots before update');
      
      // Use the clone method to create a proper deep copy that preserves all existing availability
      const updatedAvailability = userAvailability.clone();
      
      // Clear existing availability for this date only (this preserves other dates)
      updatedAvailability.clearDay(currentDate);
      console.log('[DATE_DETAIL] After clearing current date, availability has', updatedAvailability.slots.length, 'slots');
      
      // Set availability for the preset time range
      for (let hour = preset.startTime; hour < preset.endTime; hour++) {
        updatedAvailability.setSlot(currentDate, hour, true);
      }
      
      console.log('[DATE_DETAIL] After setting preset times, availability has', updatedAvailability.slots.length, 'total slots');
      
      // Update local state first
      setUserAvailability(updatedAvailability);
      
      // Save to storage
      await saveAvailability(updatedAvailability);
      setShowTimeRangePicker(false);
      
      // Save the last set time range
      setLastSetTimeRange({ startTime: preset.startTime, endTime: preset.endTime });
      
      // Refresh calendar to show updated colors
      await loadGroupAvailabilities();
      
      const timeStr = DateUtils.formatTimeRange(preset.startTime, preset.endTime, language || 'en');
      showToastMessage(`✅ ${preset.name} ${t.calendar.presetSet}: ${timeStr}`);
    } catch (error) {
      console.error('[DATE_DETAIL] Error saving preset time range:', error);
      showToastMessage(`❌ ${t.calendar.failedToSave}`);
    }
  };

  const handleMyDefaultSelection = async () => {
    if (!userDefaultTimeRange) {
      showToastMessage(`⚠️ ${t.calendar.noDefaultSaved}`);
      return;
    }

    const preset = {
      name: t.calendar.myDefault,
      description: t.calendar.myDefaultDesc,
      startTime: userDefaultTimeRange.startTime,
      endTime: userDefaultTimeRange.endTime,
      icon: 'star',
      color: Colors.accent
    };
    
    await handlePresetSelection(preset);
  };

  const saveAsDefault = async () => {
    if (!user) {
      showToastMessage(`❌ ${t.calendar.userNotFound}`);
      return;
    }
    
    if (startTime >= endTime) {
      showToastMessage(`⚠️ ${t.calendar.selectValidTimeRange}`);
      return;
    }

    try {
      await LocalStorage.saveUserDefaultTimeRange(user.id, startTime, endTime);
      setUserDefaultTimeRange({ startTime, endTime });
      const timeStr = DateUtils.formatTimeRange(startTime, endTime, language || 'en');
      showToastMessage(`⭐ ${t.calendar.savedAsDefault}: ${timeStr}`);
    } catch (error) {
      console.error('Error saving default time range:', error);
      showToastMessage(`❌ ${t.calendar.failedToSaveDefault}`);
    }
  };

  const handleQuickDefaultApplication = async () => {
    if (!userDefaultTimeRange || !userAvailability || !currentGroup) {
      showToastMessage(`⚠️ ${t.calendar.noDefaultSaved}`);
      return;
    }

    try {
      console.log('[DATE_DETAIL] Applying default time range for date:', currentDate);
      console.log('[DATE_DETAIL] Current availability has', userAvailability.slots.length, 'total slots before update');
      
      // Use the clone method to create a proper deep copy that preserves all existing availability
      const updatedAvailability = userAvailability.clone();
      
      // Clear existing availability for this date only (this preserves other dates)
      updatedAvailability.clearDay(currentDate);
      console.log('[DATE_DETAIL] After clearing current date, availability has', updatedAvailability.slots.length, 'slots');
      
      // Set availability for the default time range
      for (let hour = userDefaultTimeRange.startTime; hour < userDefaultTimeRange.endTime; hour++) {
        updatedAvailability.setSlot(currentDate, hour, true);
      }
      
      console.log('[DATE_DETAIL] After setting default times, availability has', updatedAvailability.slots.length, 'total slots');
      
      // Update local state first
      setUserAvailability(updatedAvailability);
      
      // Save to storage
      await saveAvailability(updatedAvailability);
      
      // Refresh calendar to show updated colors
      await loadGroupAvailabilities();
      
      const timeStr = DateUtils.formatTimeRange(userDefaultTimeRange.startTime, userDefaultTimeRange.endTime, language || 'en');
      showToastMessage(`✅ ${t.calendar.defaultTimeApplied}: ${timeStr}`);
    } catch (error) {
      console.error('[DATE_DETAIL] Error applying quick default:', error);
      showToastMessage(`❌ ${t.calendar.failedToApply}`);
    }
  };

  const handleQuickLastSetApplication = async () => {
    if (!lastSetTimeRange || !userAvailability || !currentGroup) {
      showToastMessage(`⚠️ ${t.calendar.noTimeRangeSet}`);
      return;
    }

    try {
      console.log('[DATE_DETAIL] Applying last set time range for date:', currentDate);
      console.log('[DATE_DETAIL] Current availability has', userAvailability.slots.length, 'total slots before update');
      
      // Use the clone method to create a proper deep copy that preserves all existing availability
      const updatedAvailability = userAvailability.clone();
      
      // Clear existing availability for this date only (this preserves other dates)
      updatedAvailability.clearDay(currentDate);
      console.log('[DATE_DETAIL] After clearing current date, availability has', updatedAvailability.slots.length, 'slots');
      
      // Set availability for the last set time range
      for (let hour = lastSetTimeRange.startTime; hour < lastSetTimeRange.endTime; hour++) {
        updatedAvailability.setSlot(currentDate, hour, true);
      }
      
      console.log('[DATE_DETAIL] After setting last set times, availability has', updatedAvailability.slots.length, 'total slots');
      
      // Update local state first
      setUserAvailability(updatedAvailability);
      
      // Save to storage
      await saveAvailability(updatedAvailability);
      
      // Refresh calendar to show updated colors
      await loadGroupAvailabilities();
      
      const timeStr = DateUtils.formatTimeRange(lastSetTimeRange.startTime, lastSetTimeRange.endTime, language || 'en');
      showToastMessage(`✅ ${t.calendar.lastTimeRangeApplied}: ${timeStr}`);
    } catch (error) {
      console.error('[DATE_DETAIL] Error applying last set time:', error);
      showToastMessage(`❌ ${t.calendar.failedToApply}`);
    }
  };

  const getUserTimeRange = () => {
    if (!userAvailability) return null;
    
    const daySlots = userAvailability.slots
      .filter(slot => slot.date === currentDate && slot.available)
      .sort((a, b) => a.hour - b.hour);
    
    if (daySlots.length === 0) return null;
    
    const start = daySlots[0].hour;
    const end = daySlots[daySlots.length - 1].hour + 1;
    
    return DateUtils.formatTimeRange(start, end, language || 'en');
  };

  const renderMember = ({ item }: { item: string }) => {
    const memberData = currentGroup?.members.find(m => m === item);
    return (
      <View style={styles.memberItem}>
        <Ionicons name="person-circle" size={32} color={Colors.primary} />
        <Text style={styles.memberName}>{t.calendar.member} {item.slice(-4)}</Text>
        <View style={styles.availableBadge}>
          <Text style={styles.availableText}>{t.calendar.available}</Text>
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.userId === user?.id;
    return (
      <View style={[styles.message, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        <Text style={styles.messageAuthor}>{item.userName}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {ChatService.formatTimestamp(item.timestamp)}
        </Text>
      </View>
    );
  };

  // Prevent rendering until currentDate is initialized to avoid useInsertionEffect warnings
  if (!currentDate) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.dateTitle}>{formatDate(currentDate)}</Text>
            <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>
            {t.calendar.availableMembers} ({availableMembers.length}/{currentGroup?.members.length})
          </Text>
          
          {/* User Time Range Section */}
          <View style={styles.timeRangeSection}>
            <View style={styles.timeRangeHeader}>
              <Text style={styles.timeRangeTitle}>{t.calendar.yourAvailability}</Text>
              <TouchableOpacity 
                onPress={() => setShowTimeRangePicker(true)}
                style={styles.setTimeButton}
              >
                <Ionicons name="time" size={16} color={Colors.text.primary} />
                <Text style={styles.setTimeText}>{t.calendar.setTimeRange}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Default Button - More Prominent Placement */}
            {userDefaultTimeRange && (
              <TouchableOpacity 
                onPress={handleQuickDefaultApplication}
                style={styles.prominentDefaultButton}
              >
                <View style={styles.defaultButtonContent}>
                  <Ionicons name="star" size={18} color={Colors.accent} />
                  <Text style={styles.defaultButtonText}>{t.calendar.applyMyDefaultTime}</Text>
                  <Text style={styles.defaultButtonTime}>
                    {DateUtils.formatTimeRange(userDefaultTimeRange.startTime, userDefaultTimeRange.endTime, language || 'en')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            
            {getUserTimeRange() ? (
              <View style={styles.currentTimeRange}>
                <Ionicons name="clock" size={16} color={Colors.success} />
                <Text style={styles.timeRangeText}>{getUserTimeRange()}</Text>
              </View>
            ) : (
              <Text style={styles.noTimeRange}>{t.calendar.noAvailabilitySet}</Text>
            )}
            
            {/* Quick Set Box - Shows after setting time once */}
            {lastSetTimeRange && !getUserTimeRange() && (
              <TouchableOpacity 
                style={styles.quickSetBox}
                onPress={handleQuickLastSetApplication}
                activeOpacity={0.7}
              >
                <View style={styles.quickSetContent}>
                  <Ionicons name="add-circle" size={18} color={Colors.text.primary} />
                  <Text style={styles.quickSetText}>
                    {DateUtils.formatTimeRange(lastSetTimeRange.startTime, lastSetTimeRange.endTime, language || 'en')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={availableMembers}
            renderItem={renderMember}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.membersList}
          />
        </View>

        <View style={styles.chatSection}>
          <Text style={styles.sectionTitle}>{t.calendar.teamChat}</Text>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            style={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              // Auto-scroll to bottom when content size changes
              if (flatListRef.current && messages.length > 0) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder={t.calendar.typeMessage}
          placeholderTextColor={Colors.text.tertiary}
          multiline
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          style={[styles.sendButton, isSending && { opacity: 0.6 }]}
          disabled={isSending}
        >
          <Ionicons name="send" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Time Range Picker Modal */}
      <Modal
        visible={showTimeRangePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeRangePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.calendar.setYourAvailability}</Text>
              <TouchableOpacity
                onPress={saveAsDefault}
                style={styles.saveDefaultStar}
              >
                <Ionicons name="star-outline" size={24} color={Colors.accent} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>{t.calendar.selectStartEndTimes}</Text>
            
            <View style={styles.timePickerContainer}>
              <View style={styles.timePicker}>
                <Text style={styles.timeLabel}>{t.calendar.from}</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.timeOption, startTime === i && styles.selectedTime]}
                      onPress={() => setStartTime(i)}
                    >
                      <Text style={[styles.timeOptionText, startTime === i && styles.selectedTimeText]}>
                        {i.toString().padStart(2, '0')}:00
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.timePicker}>
                <Text style={styles.timeLabel}>{t.calendar.to}</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map(hour => (
                    <TouchableOpacity
                      key={hour}
                      style={[styles.timeOption, endTime === hour && styles.selectedTime]}
                      onPress={() => setEndTime(hour)}
                    >
                      <Text style={[styles.timeOptionText, endTime === hour && styles.selectedTimeText]}>
                        {hour.toString().padStart(2, '0')}:00
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowTimeRangePicker(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSetTimeRange}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <Text style={styles.confirmButtonText}>{t.calendar.setAvailability}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Custom Toast Notification */}
      {showToast && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  navButton: {
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginHorizontal: 8,
  },
  closeButton: {
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  content: {
    flex: 1,
    paddingTop: 85,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  membersList: {
    marginTop: 8,
  },
  memberItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
  },
  memberName: {
    fontSize: 12,
    color: Colors.text.primary,
    marginTop: 4,
  },
  availableBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  availableText: {
    fontSize: 10,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  chatSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
  },
  messagesList: {
    maxHeight: 300,
  },
  message: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: Colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRangeSection: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
  },
  timeRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prominentDefaultButton: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  defaultButtonContent: {
    alignItems: 'center',
    gap: 8,
  },
  defaultButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  defaultButtonTime: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  quickSetBox: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20, // Increased padding for better touch target
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 68, // Ensure good touch target size
  },
  quickSetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12, // Increased gap for better spacing
  },
  quickSetText: {
    fontSize: 16, // Larger text for better readability
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  timeRangeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  setTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  setTimeText: {
    fontSize: 12,
    color: Colors.text.primary,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  currentTimeRange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRangeText: {
    fontSize: 14,
    color: Colors.success,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  noTimeRange: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: '85%',
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
  },
  saveDefaultStar: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: `${Colors.accent}15`,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  timePickerContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  timePicker: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  timeScroll: {
    maxHeight: 150,
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
  },
  timeOption: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  selectedTime: {
    backgroundColor: Colors.primary,
  },
  timeOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  selectedTimeText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButtonText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toastContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 12,
    borderLeftWidth: 5,
    borderLeftColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  toastText: {
    fontSize: 15,
    color: Colors.text.primary,
    marginLeft: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default DateDetailScreen;