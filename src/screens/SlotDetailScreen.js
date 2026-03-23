import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import HeaderBanner from '../components/HeaderBanner';
import SectionCard from '../components/SectionCard';
import { areCourtsFull, getSlotCount } from '../data/mockData';
import { colors } from '../theme/colors';
import { bookOrSwitchSlotTransaction, cancelBookingTransaction } from '../firebase/slots';

export default function SlotDetailScreen({ route, navigation, user, slots }) {
  const { slotId } = route.params;
  const [busy, setBusy] = useState(false);

  const slot = useMemo(() => slots.find((s) => s.id === slotId), [slots, slotId]);

  const userLocation = useMemo(() => {
    if (slot?.courtA?.some((p) => p.userId === user.id)) return 'courtA';
    if (slot?.courtB?.some((p) => p.userId === user.id)) return 'courtB';
    if (slot?.onDeck?.some((p) => p.userId === user.id)) return 'onDeck';
    return null;
  }, [slot, user.id]);

  if (!slot) {
    return (
      <View style={styles.container}>
        <HeaderBanner title="Slot Detail" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Text style={styles.helper}>This slot could not be found.</Text>
        </View>
      </View>
    );
  }

  const bothCourtsFull = areCourtsFull(slot);

  const handleBookOrSwitch = async (destination) => {
    try {
      setBusy(true);
      await bookOrSwitchSlotTransaction({ slotId: slot.id, destination, user });
      Alert.alert(userLocation ? 'Booking switched' : 'Booked', userLocation ? 'Your booking has been switched.' : 'Your booking is confirmed.');
    } catch (error) {
      Alert.alert('Cannot complete booking', error.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    try {
      setBusy(true);
      await cancelBookingTransaction({ slotId: slot.id, userId: user.id });
      Alert.alert('Booking canceled', 'Your spot has been released.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Cannot cancel booking', error.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const topCount = getSlotCount(slot);

  return (
    <View style={styles.container}>
      <HeaderBanner title={slot.timeLabel} subtitle={`${topCount}/12 spots filled`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.helper}>Shared play booking. Players rotate manually on court.</Text>

        <SectionCard
          title="Court A"
          countLabel={`${slot.courtA.length}/4`}
          players={slot.courtA}
          user={user}
          buttonLabel={userLocation === 'courtA' ? 'Cancel Booking' : userLocation ? 'Switch to Court A' : 'Join Court A'}
          buttonDisabled={busy || (slot.courtA.length >= 4 && userLocation !== 'courtA')}
          onPress={userLocation === 'courtA' ? handleCancel : () => handleBookOrSwitch('courtA')}
        />

        <SectionCard
          title="Court B"
          countLabel={`${slot.courtB.length}/4`}
          players={slot.courtB}
          user={user}
          buttonLabel={userLocation === 'courtB' ? 'Cancel Booking' : userLocation ? 'Switch to Court B' : 'Join Court B'}
          buttonDisabled={busy || (slot.courtB.length >= 4 && userLocation !== 'courtB')}
          onPress={userLocation === 'courtB' ? handleCancel : () => handleBookOrSwitch('courtB')}
        />

        {bothCourtsFull ? (
          <SectionCard
            title="On Deck"
            countLabel={`${slot.onDeck.length}/4`}
            players={slot.onDeck}
            helperText="Join On Deck to rotate into the next game as players finish."
            user={user}
            buttonLabel={userLocation === 'onDeck' ? 'Cancel Booking' : userLocation ? 'Switch to On Deck' : 'Join On Deck'}
            buttonDisabled={busy || (slot.onDeck.length >= 4 && userLocation !== 'onDeck')}
            onPress={userLocation === 'onDeck' ? handleCancel : () => handleBookOrSwitch('onDeck')}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 30 },
  helper: { fontSize: 14, color: colors.subtext, marginBottom: 16 },
});
