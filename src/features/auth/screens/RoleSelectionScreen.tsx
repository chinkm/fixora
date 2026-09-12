import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

import { toFriendlyAuthErrorMessage } from '../../../api/firebase/auth';
import { Button } from '../../../components/Button';
import { useAuth } from '../../../hooks/useAuth';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import type { UserRole } from '../../../types/user';

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: 'seeker', label: 'Seeker', description: 'I want to find service providers' },
  { value: 'provider', label: 'Provider', description: 'I want to offer my services' },
];

/**
 * Rendered directly by RootNavigator — not part of AuthNavigator's stack —
 * whenever `needsRoleSelection` is true (signed in, but no `users/{uid}`
 * document yet). This happens for first-time Phone/Google sign-ins, since
 * those flows don't collect a role up front the way email sign-up does.
 */
export function RoleSelectionScreen() {
  const { completeRoleSelection, isLoading, signOut } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!role) {
      setError('Please choose one to continue.');
      return;
    }
    setError(null);
    try {
      await completeRoleSelection(role);
    } catch (err) {
      setError(toFriendlyAuthErrorMessage(err));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typography.h1}>One last step</Text>
      <Text style={[typography.body, styles.subtitle]}>How do you plan to use the app?</Text>

      <View style={styles.roleColumn}>
        {ROLE_OPTIONS.map((option) => {
          const selected = role === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setRole(option.value)}
              style={[styles.roleCard, selected && styles.roleCardSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={[typography.body, selected && styles.roleTextSelected]}>
                {option.label}
              </Text>
              <Text style={typography.caption}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <Button label="Continue" onPress={handleConfirm} loading={isLoading} disabled={isLoading} />

      <Pressable onPress={() => signOut()} disabled={isLoading} style={styles.cancelRow}>
        <Text style={typography.link}>Cancel and sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xxl },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  roleColumn: { gap: spacing.sm, marginBottom: spacing.lg },
  roleCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
  },
  roleCardSelected: { borderColor: colors.primary, backgroundColor: colors.surface },
  roleTextSelected: { color: colors.primary, fontWeight: '600' },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
  cancelRow: { marginTop: spacing.lg, alignSelf: 'center' },
});
