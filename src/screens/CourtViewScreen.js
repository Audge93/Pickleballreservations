import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HeaderBanner from '../components/HeaderBanner';
import SlotRow from '../components/SlotRow';
import { colors } from '../theme/colors';
import { getSlotCount, getSlotsForDate } from '../data/mockData';

function getSectionTitle(slot) {
  const hour = slot.startHour;
  if (hour < 9) return 'Morning';
  if (hour < 13) return 'Midday';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

export default function CourtViewScreen({ user, slots, selectedDate, setSelectedDate, dayTabs }) {
  const navigation = useNavigation();
  const daySlots = getSlotsForDate(slots, selectedDate);

  const grouped = daySlots.reduce((acc, slot) => {
    const section = getSectionTitle(slot);
    if (!acc[section]) acc[section] = [];
    acc[section].push(slot);
    return acc;
  }, {});

  const nextAvailable = daySlots.find((slot) => getSlotCount(slot) < 12);

  return (
    <View style={styles.container}>
      <HeaderBanner title="Court View" subtitle={`Welcome back, ${user.firstName}`} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.next}>
          Next Available: {nextAvailable ? nextAvailable.timeLabel : 'No open slots'}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {dayTabs.map((tab) => {
            const active = selectedDate === tab.date;
            return (
              <TouchableOpacity
                key={tab.date}
                style={[styles.dayChip, active && styles.dayChipActive]}
                onPress={() => setSelectedDate(tab.date)}
              >
                <Text style={[styles.dayText, active && styles.dayTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {Object.entries(grouped).map(([section, sectionSlots]) => (
          <View key={section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section}</Text>
            {sectionSlots.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                onPress={() => navigation.navigate('SlotDetail', { slotId: slot.id })}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 30 },
  next: { color: colors.blue, fontWeight: '700', fontSize: 16, marginBottom: 16 },
  tabs: { marginBottom: 20 },
  dayChip: {
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF1F5',
    marginRight: 8,
  },
  dayChipActive: { backgroundColor: colors.navy },
  dayText: { color: colors.text, fontWeight: '600' },
  dayTextActive: { color: '#fff' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
});
