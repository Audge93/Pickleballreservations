import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderBanner from '../components/HeaderBanner';
import { colors } from '../theme/colors';
import { cancelBookingTransaction } from '../firebase/slots';

export default function BookingsScreen({ user, slots, selectedDate }) {
  const [busyId, setBusyId] = useState(null);

  const bookings = useMemo(() => {
    return slots
      .map((slot) => {
        if (slot.courtA.some((p) => p.userId === user.id)) return { ...slot, position: 'Court A' };
        if (slot.courtB.some((p) => p.userId === user.id)) return { ...slot, position: 'Court B' };
        if (slot.onDeck.some((p) => p.userId === user.id)) return { ...slot, position: 'On Deck' };
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => (a.date !== b.date ? a.date.localeCompare(b.date) : a.order - b.order));
  }, [slots, user.id]);

  const bookedTodayCount = bookings.filter((b) => b.date === selectedDate).length;
  const bookedTodayMinutes = bookedTodayCount * 30;

  const cancel = async (slotId) => {
    try {
      setBusyId(slotId);
      await cancelBookingTransaction({ slotId, userId: user.id });
    } catch (error) {
      Alert.alert('Cannot cancel booking', error.message || 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBanner title="My Bookings" subtitle={`Booked today: ${bookedTodayMinutes} / 120 minutes`} />
      <ScrollView contentContainerStyle={styles.content}>
        {bookings.length === 0 ? (
          <Text style={styles.empty}>You do not have any bookings yet.</Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.card}>
              <Text style={styles.date}>{booking.date}</Text>
              <Text style={styles.time}>{booking.timeLabel}</Text>
              <Text style={styles.meta}>{booking.position}</Text>
              <TouchableOpacity style={[styles.button, busyId === booking.id && styles.buttonDisabled]} disabled={busyId === booking.id} onPress={() => cancel(booking.id)}>
                <Text style={styles.buttonText}>{busyId === booking.id ? 'Canceling...' : 'Cancel'}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  empty: { color: colors.subtext, fontSize: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  date: { fontSize: 13, color: colors.subtext, marginBottom: 4, fontWeight: '600' },
  time: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
  meta: { fontSize: 15, color: colors.subtext, marginBottom: 14 },
  button: {
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
