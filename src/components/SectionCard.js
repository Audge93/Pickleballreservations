import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import PlayerRow from './PlayerRow';

export default function SectionCard({
  title,
  countLabel,
  players,
  helperText,
  buttonLabel,
  buttonDisabled,
  onPress,
  user,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{countLabel}</Text>
      </View>

      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}

      {players.length === 0 ? (
        <Text style={styles.empty}>No one has booked this section yet.</Text>
      ) : (
        players.map((player, idx) => (
          <PlayerRow key={`${title}_${idx}`} player={player} currentUserId={user.id} />
        ))
      )}

      {buttonLabel ? (
        <TouchableOpacity
          style={[styles.button, buttonDisabled && styles.buttonDisabled]}
          onPress={onPress}
          disabled={buttonDisabled}
        >
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  count: { fontSize: 14, color: colors.subtext, fontWeight: '600' },
  helper: { fontSize: 14, color: colors.subtext, marginBottom: 12 },
  empty: { fontSize: 14, color: colors.subtext, marginBottom: 12 },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: colors.disabled },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
