import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { DrawerActions } from '@react-navigation/native';
import { getCalendars } from 'expo-localization';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useCallback, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import {
  requestNotificationPermissions,
  rescheduleAllNotifications,
} from '@/src/features/notifications/notificationService';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { useAppStore } from '@/src/store/useApp';

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Asking the native device directly, bypassing Hermes JS engine limitations
const is24Hour = getCalendars()[0]?.uses24hourClock ?? false;

function formatTimeForDevice(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const date = new Date(2000, 0, 1, h, m);

  // If the device uses a 24-hour clock, force it to format as HH:mm
  if (is24Hour) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // Otherwise, use the standard 12-hour format (e.g., 2:00 PM)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function parse24ToComponents(time24: string): { hour24: number; minute: number } {
  const [h, m] = time24.split(':').map(Number);
  return { hour24: h, minute: m };
}

function componentsTo24(hour24: number, minute: number): string {
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();
  const posthog = usePostHog();

  const isEnabled = useAppStore((s) => s.isNotificationsEnabled);
  const isSurpriseMeEnabled = useAppStore((s) => s.isSurpriseMeEnabled);
  const reminderTimes = useAppStore((s) => s.reminderTimes);
  const toggleNotifications = useAppStore((s) => s.toggleNotifications);
  const toggleSurpriseMe = useAppStore((s) => s.toggleSurpriseMe);
  const addReminderTime = useAppStore((s) => s.addReminderTime);
  const removeReminderTime = useAppStore((s) => s.removeReminderTime);
  const updateReminderTime = useAppStore((s) => s.updateReminderTime);

  const [permissionDenied, setPermissionDenied] = useState(false);

  // Bottom sheet state (We now store everything relative to standard 24-hour time)
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [activeEditingIndex, setActiveEditingIndex] = useState<number | null>(null);
  const [tempHour24, setTempHour24] = useState(12);
  const [tempMinute, setTempMinute] = useState(0);
  const [collisionWarning, setCollisionWarning] = useState(false);

  // ─── Deriving 12-Hour Display Values ─────────────────────────────────

  const displayHour12 = tempHour24 % 12 === 0 ? 12 : tempHour24 % 12;
  const displayPeriod = tempHour24 >= 12 ? 'PM' : 'AM';

  const handleHour12Change = (val: number) => {
    const isPM = tempHour24 >= 12;
    let newH24 = val === 12 ? 0 : val;
    if (isPM) newH24 += 12;
    setTempHour24(newH24);
  };

  const handlePeriodChange = (val: 'AM' | 'PM') => {
    if (val === 'PM' && tempHour24 < 12) setTempHour24(tempHour24 + 12);
    else if (val === 'AM' && tempHour24 >= 12) setTempHour24(tempHour24 - 12);
  };

  // ─── Handlers ──────────────────────────────────────────────────────

  const handleBackToDrawer = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const handleToggle = useCallback(async () => {
    if (!isEnabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
      toggleNotifications();
      try {
        await rescheduleAllNotifications(reminderTimes, true, isSurpriseMeEnabled);
        posthog.capture('notification_toggled', {
          enabled: true,
          reminder_count: reminderTimes.length,
        });
      } catch (err) {
        console.error('Failed to schedule notifications:', err);
        toggleNotifications(); // revert
      }
    } else {
      toggleNotifications();
      try {
        await rescheduleAllNotifications(reminderTimes, false);
        posthog.capture('notification_toggled', { enabled: false });
      } catch (err) {
        console.error('Failed to cancel notifications:', err);
        toggleNotifications(); // revert
      }
    }
  }, [isEnabled, isSurpriseMeEnabled, reminderTimes, posthog, toggleNotifications]);

  const openSheetForEdit = useCallback(
    (index: number) => {
      const { hour24, minute } = parse24ToComponents(reminderTimes[index]);
      setTempHour24(hour24);
      setTempMinute(minute);
      setActiveEditingIndex(index);
      setCollisionWarning(false);
      setIsSheetVisible(true);
    },
    [reminderTimes],
  );

  const openSheetForAdd = useCallback(() => {
    setTempHour24(12);
    setTempMinute(0);
    setActiveEditingIndex(null);
    setCollisionWarning(false);
    setIsSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setIsSheetVisible(false);
    setCollisionWarning(false);
  }, []);

  const handleSave = useCallback(async () => {
    const newTime = componentsTo24(tempHour24, tempMinute);
    const currentTimes = useAppStore.getState().reminderTimes;

    const editingOldTime = activeEditingIndex !== null ? currentTimes[activeEditingIndex] : null;
    const isDuplicate = currentTimes.some((t, i) => {
      if (activeEditingIndex !== null && i === activeEditingIndex) return false;
      return t === newTime;
    });

    if (isDuplicate) {
      setCollisionWarning(true);
      return;
    }

    if (activeEditingIndex !== null && editingOldTime) {
      updateReminderTime(editingOldTime, newTime);
    } else {
      addReminderTime(newTime);
    }

    const updatedTimes = useAppStore.getState().reminderTimes;
    await rescheduleAllNotifications(updatedTimes, true, isSurpriseMeEnabled);
    closeSheet();
  }, [
    tempHour24,
    tempMinute,
    activeEditingIndex,
    isSurpriseMeEnabled,
    updateReminderTime,
    addReminderTime,
    closeSheet,
  ]);

  const handleRemoveTime = useCallback(
    async (time: string) => {
      removeReminderTime(time);
      const currentTimes = useAppStore.getState().reminderTimes;
      await rescheduleAllNotifications(currentTimes, true, isSurpriseMeEnabled);
    },
    [removeReminderTime, isSurpriseMeEnabled],
  );

  const handleSurpriseMeToggle = useCallback(async () => {
    toggleSurpriseMe();
    const newState = useAppStore.getState().isSurpriseMeEnabled;
    await rescheduleAllNotifications(reminderTimes, true, newState);
  }, [toggleSurpriseMe, reminderTimes]);

  // ─── Render Data ───────────────────────────────────────────────────

  const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = Array.from({ length: 60 }, (_, i) => i);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ─── Stacked Header ─── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={handleBackToDrawer} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.typography} />
          </Pressable>

          <Pressable onPress={() => router.navigate('/(tabs)/' as Href)} style={styles.iconBtn}>
            <Ionicons name="home-outline" size={24} color={theme.colors.typography} />
          </Pressable>
        </View>
        <Text style={[styles.title, { color: theme.colors.typography }]}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* ── General Card ── */}
        <AppText colorVariant="muted" style={styles.sectionLabel}>
          General
        </AppText>

        <View style={[styles.flatCard, { backgroundColor: theme.colors.surface }]}>
          {/* Enable reminders row */}
          <View style={styles.row}>
            <View>
              <Text style={[styles.rowLabel, { color: theme.colors.typography }]}>
                Enable reminders
              </Text>
              <AppText colorVariant="muted" style={styles.rowSub}>
                Daily check-in prompts
              </AppText>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: colors.divider, true: theme.colors.mosaicGold }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Surprise Me row */}
          <View
            style={[styles.row, !isEnabled && styles.disabled]}
            pointerEvents={isEnabled ? 'auto' : 'none'}
          >
            <View>
              <Text style={[styles.rowLabel, { color: theme.colors.typography }]}>Surprise me</Text>
              <AppText colorVariant="muted" style={styles.rowSub}>
                One random reminder a day
              </AppText>
            </View>
            <Switch
              value={isSurpriseMeEnabled}
              onValueChange={handleSurpriseMeToggle}
              trackColor={{ false: colors.divider, true: theme.colors.mosaicGold }}
              thumbColor="#ffffff"
              disabled={!isEnabled}
            />
          </View>
        </View>

        {/* Permission Denied */}
        {permissionDenied ? (
          <View style={[styles.deniedBlock, { borderColor: colors.divider }]}>
            <Ionicons
              name="notifications-off-outline"
              size={28}
              color={colors.textMuted}
              style={styles.deniedIcon}
            />
            <Text style={[styles.deniedText, { color: theme.colors.typography }]}>
              Notifications are disabled in Settings.
            </Text>
            <AppText colorVariant="muted" style={styles.deniedSub}>
              Enable them for Mosaic to receive check-in reminders.
            </AppText>
            <Pressable
              onPress={() => Linking.openSettings()}
              style={({ pressed }) => [
                styles.openSettingsBtn,
                { backgroundColor: theme.colors.mosaicGold, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={[styles.openSettingsBtnText, { color: theme.colors.onAccent }]}>
                Open Settings
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* ── Daily Times Card ── */}
        <AppText colorVariant="muted" style={styles.sectionLabel}>
          Daily Times
        </AppText>

        <View
          style={[styles.timesSection, (!isEnabled || isSurpriseMeEnabled) && styles.disabled]}
          pointerEvents={isEnabled && !isSurpriseMeEnabled ? 'auto' : 'none'}
        >
          <View
            style={[styles.flatCard, { backgroundColor: theme.colors.surface, paddingVertical: 8 }]}
          >
            {reminderTimes.map((time, index) => (
              <View key={time}>
                {index > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                )}
                <View style={styles.timeRow}>
                  <Pressable
                    onPress={() => openSheetForEdit(index)}
                    style={({ pressed }) => [styles.timeLeft, pressed && styles.pressed]}
                  >
                    <Ionicons
                      name="alarm-outline"
                      size={20}
                      color={theme.colors.typography}
                      style={styles.timeIcon}
                    />
                    <Text style={[styles.timeText, { color: theme.colors.typography }]}>
                      {formatTimeForDevice(time)}
                    </Text>

                    <Ionicons
                      name="pencil-outline"
                      size={20}
                      color={theme.colors.typography}
                      style={{ opacity: 0.6 }}
                    />
                  </Pressable>

                  {reminderTimes.length > 1 && (
                    <Pressable
                      onPress={() => handleRemoveTime(time)}
                      style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                    >
                      <Ionicons name="trash-outline" size={20} color={theme.colors.destructive} />
                    </Pressable>
                  )}
                </View>
              </View>
            ))}

            {reminderTimes.length < 4 && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <Pressable
                  onPress={openSheetForAdd}
                  style={({ pressed }) => [styles.addBtnMain, pressed && styles.pressed]}
                >
                  <Ionicons name="add-circle-outline" size={20} color={theme.colors.mosaicGold} />
                  <Text style={[styles.addBtnMainText, { color: theme.colors.mosaicGold }]}>
                    Add reminder
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ─── Bottom Sheet Modal ──────────────────────────────────────── */}
      <Modal visible={isSheetVisible} animationType="slide" transparent onRequestClose={closeSheet}>
        <Pressable style={styles.overlay} onPress={closeSheet} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.divider }]} />

          <Text style={[styles.sheetTitle, { color: theme.colors.typography }]}>
            {activeEditingIndex !== null ? 'Edit reminder' : 'Add reminder'}
          </Text>

          {/* Wheel pickers */}
          <View style={styles.pickerRow}>
            {/* Conditional Hour Picker (12 vs 24 format) */}
            {is24Hour ? (
              <View style={styles.pickerWrapper}>
                <AppText colorVariant="muted" style={styles.pickerLabel}>
                  Hour
                </AppText>
                <Picker
                  selectedValue={tempHour24}
                  onValueChange={(v) => setTempHour24(v as number)}
                  style={[styles.picker, { color: theme.colors.typography }]}
                  itemStyle={{ color: theme.colors.typography }}
                >
                  {HOURS_24.map((h) => (
                    <Picker.Item key={h} label={String(h).padStart(2, '0')} value={h} />
                  ))}
                </Picker>
              </View>
            ) : (
              <View style={styles.pickerWrapper}>
                <AppText colorVariant="muted" style={styles.pickerLabel}>
                  Hour
                </AppText>
                <Picker
                  selectedValue={displayHour12}
                  onValueChange={handleHour12Change}
                  style={[styles.picker, { color: theme.colors.typography }]}
                  itemStyle={{ color: theme.colors.typography }}
                >
                  {HOURS_12.map((h) => (
                    <Picker.Item key={h} label={String(h)} value={h} />
                  ))}
                </Picker>
              </View>
            )}

            {/* Minutes (Same for both) */}
            <View style={styles.pickerWrapper}>
              <AppText colorVariant="muted" style={styles.pickerLabel}>
                Min
              </AppText>
              <Picker
                selectedValue={tempMinute}
                onValueChange={(v) => setTempMinute(v as number)}
                style={[styles.picker, { color: theme.colors.typography }]}
                itemStyle={{ color: theme.colors.typography }}
              >
                {MINUTES.map((m) => (
                  <Picker.Item key={m} label={String(m).padStart(2, '0')} value={m} />
                ))}
              </Picker>
            </View>

            {/* Conditional AM/PM Period Picker (Only show if on 12-hour clock) */}
            {!is24Hour && (
              <View style={styles.pickerWrapper}>
                <AppText colorVariant="muted" style={styles.pickerLabel}>
                  Period
                </AppText>
                <Picker
                  selectedValue={displayPeriod}
                  onValueChange={handlePeriodChange}
                  style={[styles.picker, { color: theme.colors.typography }]}
                  itemStyle={{ color: theme.colors.typography }}
                >
                  <Picker.Item label="AM" value="AM" />
                  <Picker.Item label="PM" value="PM" />
                </Picker>
              </View>
            )}
          </View>

          {/* Collision warning */}
          {collisionWarning ? (
            <Text style={[styles.collisionText, { color: theme.colors.destructive }]}>
              You already have a reminder set for this time.
            </Text>
          ) : null}

          {/* Save */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: theme.colors.mosaicGold, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.saveBtnText, { color: theme.colors.onAccent }]}>Save</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1 },
  header: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  iconBtn: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Fraunces',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  content: { paddingHorizontal: theme.spacing[4], paddingTop: 8 },

  sectionLabel: {
    fontSize: 11,
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  flatCard: {
    borderRadius: theme.radius.card,
    paddingHorizontal: theme.spacing[4],
    overflow: 'hidden',
    marginBottom: 24,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowLabel: { fontSize: theme.fontSize.base, fontWeight: '600' },
  rowSub: { fontSize: 13, fontFamily: 'SpaceMono', marginTop: 2 },

  disabled: { opacity: 0.4 },
  divider: { height: 1 },

  deniedBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  deniedIcon: { marginBottom: 12 },
  deniedText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  deniedSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing[4],
  },
  openSettingsBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  openSettingsBtnText: { fontSize: 15, fontWeight: '600' },

  timesSection: {},
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 0,
    paddingRight: 0,
  },
  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
  },
  timeIcon: { opacity: 0.4 },
  timeText: { fontSize: theme.fontSize.lg, fontWeight: '500', flex: 1 },
  deleteBtn: { padding: 10, marginLeft: 8 },
  addBtnMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 4,
  },
  addBtnMainText: { fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.6 },

  overlay: {
    flex: 1,
    backgroundColor: theme.colors.modalOverlay,
  },
  sheet: {
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing[4],
  },
  sheetTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: 'Fraunces',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerWrapper: { flex: 1, alignItems: 'center' },
  pickerLabel: {
    fontSize: 12,
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  picker: { width: '100%' },
  collisionText: {
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
    marginBottom: theme.spacing[2],
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: theme.spacing[4],
    marginBottom: 12,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700' },
}));
