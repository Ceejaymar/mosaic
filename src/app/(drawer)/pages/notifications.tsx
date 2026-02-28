import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  requestNotificationPermissions,
  rescheduleAllNotifications,
} from '@/src/features/notifications/notificationService';
import { useAppStore } from '@/src/store/useApp';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimeForDevice(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const date = new Date(2000, 0, 1, h, m);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function timeToDate(time24: string): Date {
  const [h, m] = time24.split(':').map(Number);
  return new Date(2000, 0, 1, h, m);
}

function dateToTime24(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

const is24Hour = !new Intl.DateTimeFormat([], { hour: 'numeric' }).resolvedOptions().hour12;

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const isEnabled = useAppStore((s) => s.isNotificationsEnabled);
  const reminderTimes = useAppStore((s) => s.reminderTimes);
  const toggleNotifications = useAppStore((s) => s.toggleNotifications);
  const addReminderTime = useAppStore((s) => s.addReminderTime);
  const removeReminderTime = useAppStore((s) => s.removeReminderTime);
  const updateReminderTime = useAppStore((s) => s.updateReminderTime);

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = useCallback(async () => {
    if (!isEnabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
      toggleNotifications();
      await rescheduleAllNotifications(reminderTimes, true);
    } else {
      toggleNotifications();
      await rescheduleAllNotifications(reminderTimes, false);
      setExpandedIndex(null);
    }
  }, [isEnabled, reminderTimes, toggleNotifications]);

  const handleRowPress = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleIOSPickerChange = useCallback(
    async (_event: DateTimePickerEvent, date?: Date) => {
      if (!date || expandedIndex === null) return;

      const newTime = dateToTime24(date);
      updateReminderTime(reminderTimes[expandedIndex], newTime);

      const currentTimes = useAppStore.getState().reminderTimes;
      await rescheduleAllNotifications(currentTimes, true);
    },
    [expandedIndex, reminderTimes, updateReminderTime],
  );

  const handleAndroidPickerChange = useCallback(
    async (event: DateTimePickerEvent, date?: Date) => {
      setExpandedIndex(null);

      if (event.type === 'dismissed' || !date || expandedIndex === null) return;

      const newTime = dateToTime24(date);
      updateReminderTime(reminderTimes[expandedIndex], newTime);

      const currentTimes = useAppStore.getState().reminderTimes;
      await rescheduleAllNotifications(currentTimes, true);
    },
    [expandedIndex, reminderTimes, updateReminderTime],
  );

  const handleAddTime = useCallback(async () => {
    if (reminderTimes.length >= 4) return;

    addReminderTime('12:00');
    const currentTimes = useAppStore.getState().reminderTimes;
    const newIndex = currentTimes.indexOf('12:00');
    setExpandedIndex(newIndex >= 0 ? newIndex : currentTimes.length - 1);

    await rescheduleAllNotifications(currentTimes, true);
  }, [reminderTimes, addReminderTime]);

  const handleRemoveTime = useCallback(
    async (time: string) => {
      if (expandedIndex !== null) setExpandedIndex(null);
      removeReminderTime(time);

      const currentTimes = useAppStore.getState().reminderTimes;
      await rescheduleAllNotifications(currentTimes, true);
    },
    [expandedIndex, removeReminderTime],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.typography} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.typography }]}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* Master Switch */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.switchRow}>
            <View>
              <Text style={[styles.switchLabel, { color: theme.colors.typography }]}>
                Enable reminders
              </Text>
              <Text style={[styles.switchDescription, { color: theme.colors.textMuted }]}>
                Get daily check-in prompts
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: theme.colors.divider, true: theme.colors.mosaicGold }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Permission Denied */}
        {permissionDenied ? (
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Ionicons
              name="notifications-off-outline"
              size={28}
              color={theme.colors.textMuted}
              style={styles.deniedIcon}
            />
            <Text style={[styles.deniedText, { color: theme.colors.typography }]}>
              Notifications are disabled in your device settings.
            </Text>
            <Text style={[styles.deniedSubtext, { color: theme.colors.textMuted }]}>
              To receive check-in reminders, enable notifications for Mosaic in Settings.
            </Text>
            <Pressable
              onPress={() => Linking.openSettings()}
              style={({ pressed }) => [
                styles.settingsBtn,
                { backgroundColor: theme.colors.mosaicGold, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={[styles.settingsBtnText, { color: theme.colors.onAccent }]}>
                Open Settings
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Reminder Times — always visible, dimmed when disabled */}
        <View
          style={[styles.timesSection, !isEnabled && styles.disabledSection]}
          pointerEvents={isEnabled ? 'auto' : 'none'}
        >
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
            Reminder times
          </Text>

          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {reminderTimes.map((time, index) => (
              <View key={time}>
                {index > 0 && (
                  <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
                )}
                <View style={styles.timeRow}>
                  <Pressable
                    onPress={() => handleRowPress(index)}
                    style={({ pressed }) => [styles.timeLabel, pressed && styles.pressed]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={theme.colors.typography}
                      style={styles.timeIcon}
                    />
                    <Text style={[styles.timeText, { color: theme.colors.typography }]}>
                      {formatTimeForDevice(time)}
                    </Text>
                    <Ionicons
                      name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={theme.colors.textMuted}
                    />
                  </Pressable>
                  {reminderTimes.length > 1 && (
                    <Pressable
                      onPress={() => handleRemoveTime(time)}
                      style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.colors.destructive} />
                    </Pressable>
                  )}
                </View>

                {/* iOS inline picker — accordion style */}
                {expandedIndex === index && Platform.OS === 'ios' && (
                  <DateTimePicker
                    value={timeToDate(time)}
                    mode="time"
                    display="spinner"
                    is24Hour={is24Hour}
                    onChange={handleIOSPickerChange}
                    textColor={theme.colors.typography}
                    style={styles.iosPicker}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Add Reminder */}
          {reminderTimes.length < 4 && (
            <Pressable
              onPress={handleAddTime}
              style={({ pressed }) => [
                styles.addBtn,
                { backgroundColor: theme.colors.surface, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons name="add-circle-outline" size={20} color={theme.colors.mosaicGold} />
              <Text style={[styles.addBtnText, { color: theme.colors.mosaicGold }]}>
                Add reminder
              </Text>
            </Pressable>
          )}
        </View>

        {/* Android modal picker — rendered at root level */}
        {expandedIndex !== null && Platform.OS === 'android' && (
          <DateTimePicker
            value={timeToDate(reminderTimes[expandedIndex])}
            mode="time"
            is24Hour={is24Hour}
            onChange={handleAndroidPickerChange}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  title: {
    fontSize: 28,
    fontFamily: 'Fraunces',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  content: { paddingHorizontal: 16, gap: 16 },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  switchDescription: {
    fontSize: 13,
    fontFamily: 'SpaceMono',
    marginTop: 2,
  },
  deniedIcon: { alignSelf: 'center', marginBottom: 12 },
  deniedText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  deniedSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  settingsBtn: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  settingsBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  timesSection: { gap: 16 },
  disabledSection: { opacity: 0.4 },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  timeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  timeIcon: { opacity: 0.4 },
  timeText: {
    fontSize: 18,
    fontWeight: '500',
  },
  pressed: { opacity: 0.6 },
  deleteBtn: { padding: 8 },
  divider: { height: 1 },
  iosPicker: { height: 160 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
