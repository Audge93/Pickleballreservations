import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import HeaderBanner from '../components/HeaderBanner';
import { colors } from '../theme/colors';

export default function ProfileScreen({ user }) {
  return (
    <View style={styles.container}>
      <HeaderBanner title="Profile" subtitle="Employee pickleball booking" />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>First Name</Text>
          <Text style={styles.value}>{user.firstName}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Skill Level</Text>
          <Text style={styles.value}>{user.skillLevel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  label: { fontSize: 14, color: colors.subtext, marginBottom: 6 },
  value: { fontSize: 18, fontWeight: '700', color: colors.text },
});
