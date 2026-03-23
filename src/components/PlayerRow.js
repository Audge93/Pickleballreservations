import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const dotColor = {
  Beginner: '#AEB6BF',
  Intermediate: colors.green,
  Advanced: colors.blue,
};

export default function PlayerRow({ player, currentUserId }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: dotColor[player.level] || colors.green }]} />
      <Text style={styles.text}>
        {player.name}
        {player.userId === currentUserId ? ' (You)' : ''} — {player.level}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  text: { fontSize: 15, color: colors.text },
});
