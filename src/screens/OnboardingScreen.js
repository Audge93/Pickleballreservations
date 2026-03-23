import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import HeaderBanner from '../components/HeaderBanner';
import { colors } from '../theme/colors';

const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function OnboardingScreen({ onComplete }) {
  const [firstName, setFirstName] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [busy, setBusy] = useState(false);

  return (
    <View style={styles.container}>
      <HeaderBanner title="Welcome!" subtitle="Enter your details to get started." />
      <View style={styles.content}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
          style={styles.input}
          autoCapitalize="words"
        />

        <Text style={[styles.label, { marginTop: 24 }]}>Skill Level</Text>
        {levels.map((level) => (
          <Pressable key={level} onPress={() => setSkillLevel(level)} style={styles.levelRow}>
            <View style={[styles.radio, skillLevel === level && styles.radioActive]} />
            <Text style={styles.levelText}>{level}</Text>
          </Pressable>
        ))}

        <Pressable
          onPress={async () => {
            try {
              setBusy(true);
              const cleanName = firstName.trim();
              const userId = `user_${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
              await onComplete({ id: userId, firstName: cleanName, skillLevel });
            } catch (error) {
              Alert.alert('Could not save profile', error.message || 'Please try again.');
            } finally {
              setBusy(false);
            }
          }}
          disabled={!firstName.trim() || busy}
          style={[styles.button, (!firstName.trim() || busy) && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{busy ? 'Saving...' : 'Continue'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  label: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 14,
  },
  levelRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 12,
  },
  radioActive: {
    borderColor: colors.darkGreen,
    backgroundColor: colors.green,
  },
  levelText: { fontSize: 16, color: colors.text },
  button: {
    marginTop: 28,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: colors.disabled },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
