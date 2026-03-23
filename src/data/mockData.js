export const initialUser = {
  id: '',
  firstName: '',
  skillLevel: '',
};

export const dayTabs = [
  { label: 'Today', date: '2026-03-23' },
  { label: 'Tue 24', date: '2026-03-24' },
  { label: 'Wed 25', date: '2026-03-25' },
  { label: 'Thu 26', date: '2026-03-26' },
  { label: 'Fri 27', date: '2026-03-27' },
  { label: 'Sat 28', date: '2026-03-28' },
  { label: 'Sun 29', date: '2026-03-29' },
];

export function getSlotCount(slot) {
  return (slot.courtA?.length || 0) + (slot.courtB?.length || 0) + (slot.onDeck?.length || 0);
}

export function areCourtsFull(slot) {
  return (slot.courtA?.length || 0) >= 4 && (slot.courtB?.length || 0) >= 4;
}

export function isSlotFull(slot) {
  return getSlotCount(slot) >= 12;
}

export function getSlotsForDate(slots, date) {
  return slots.filter((slot) => slot.date === date).sort((a, b) => a.order - b.order);
}
