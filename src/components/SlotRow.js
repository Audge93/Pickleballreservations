import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { areCourtsFull, getSlotCount, isSlotFull } from '../data/mockData';
import { colors } from '../theme/colors';

export default function SlotRow({ slot, onPress }) {
  const count = getSlotCount(slot);
  const full = isSlotFull(slot);
  const courtsFull = areCourtsFull(slot) && !full;

  return (
    <TouchableOpacity
      style={[styles.card, courtsFull && styles.courtsFull, full && styles.full]}
      disabled={full}
      onPress={onPress}
    >
      <Text style={[styles.time, (courtsFull || full) && styles.inverseText]}>{slot.timeLabel}</Text>
      <Text style={[styles.meta, (courtsFull || full) && styles.inverseText]}>
        {full
          ? '12/12 spots filled • Full'
          : courtsFull
          ? `${count}/12 spots filled • On Deck Available`
          : `${count}/12 spots filled`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  courtsFull: { backgroundColor: colors.blue, borderColor: colors.blue },
  full: { backgroundColor: colors.disabled, borderColor: colors.disabled },
  time: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  meta: { fontSize: 14, color: colors.subtext },
  inverseText: { color: '#fff' },
});
