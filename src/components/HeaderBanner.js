import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function HeaderBanner({ title, subtitle, onBack }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <View style={styles.row}>
          <TouchableOpacity onPress={onBack} disabled={!onBack} style={styles.side}>
            <Text style={styles.back}>{onBack ? '‹' : ''}</Text>
          </TouchableOpacity>
          <View style={styles.center}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <View style={styles.side} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.navy },
  wrap: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  side: { width: 40, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#E8EEF7', fontSize: 14, marginTop: 4 },
  back: { color: '#fff', fontSize: 34, lineHeight: 34 },
});
