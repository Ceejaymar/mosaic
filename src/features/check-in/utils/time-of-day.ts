export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export const TIME_SLOTS: readonly TimeSlot[] = ['morning', 'afternoon', 'evening', 'night'];

export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

export function getTimeSlotForOccurredAt(occurredAt: string): TimeSlot {
  const hour = new Date(occurredAt).getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

export function getTimeSlotLabel(slot: TimeSlot): string {
  const labels: Record<TimeSlot, string> = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
  };
  return labels[slot];
}

// Representative hour for each slot, used when backdating a check-in
export const SLOT_DEFAULT_HOURS: Record<TimeSlot, number> = {
  morning: 9,
  afternoon: 14,
  evening: 18,
  night: 21,
};
