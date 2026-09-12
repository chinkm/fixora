import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import  { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

import { toFriendlyAuthErrorMessage } from '../../../api/firebase/auth';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useAuth } from '../../../hooks/useAuth';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import type { UserRole } from '../../../types/user';
import {
  validateEmailField,
  validatePasswordField,
  validateConfirmPasswordField,
} from '../../../utils/validators';
import type { AuthStackParamList, FormErrors } from '../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

type FieldName = 'email' | 'password' | 'confirmPassword' | 'role';

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: 'seeker', label: 'Seeker', description: 'I want to find service providers' },
  { value: 'provider', label: 'Provider', description: 'I want to offer my services' },
];

export function SignUpScreen({ navigation }: Props) {
  const { signUp, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [errors, setErrors] = useState<FormErrors<FieldName>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const nextErrors: FormErrors<FieldName> = {
      email: validateEmailField(email) ?? undefined,
      password: validatePasswordField(password) ?? undefined,
      confirmPassword: validateConfirmPasswordField(password, confirmPassword) ?? undefined,
      role: role ? undefined : 'Please choose whether you are a seeker or a provider.',
    };
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!validate() || !role) return;
    try {
      await signUp(email, password, role);
      // RootNavigator reacts to the new auth state automatically.
    } catch (err) {
      setSubmitError(toFriendlyAuthErrorMessage(err));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typography.h1}>Create your account</Text>

      <Input
        testID="signup-email"
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Input
        testID="signup-password"
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        placeholder="At least 8 characters"
      />
      <Input
        testID="signup-confirm-password"
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
        secureTextEntry
        placeholder="Re-enter your password"
      />

      <Text style={[typography.caption, styles.roleLabel]}>I am a...</Text>
      <View style={styles.roleRow}>
        {ROLE_OPTIONS.map((option) => {
          const selected = role === option.value;
          return (
            <Pressable
              key={option.value}
              testID={`role-${option.value}`}
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
      {!!errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

      {!!submitError && <Text style={styles.errorBanner}>{submitError}</Text>}

      <Button
        testID="signup-submit"
        label="Create Account"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
      />

      <Pressable
        onPress={() => navigation.navigate('Login')}
        disabled={isLoading}
        style={styles.footerRow}
      >
        <Text style={typography.body}>
          Already have an account? <Text style={typography.link}>Sign in</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xxl },
  roleLabel: { marginBottom: spacing.sm },
  roleRow: { flexDirection: 'row', gap: spacing.sm },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
  },
  roleCardSelected: { borderColor: colors.primary, backgroundColor: colors.surface },
  roleTextSelected: { color: colors.primary, fontWeight: '600' },
  errorText: { color: colors.danger, fontSize: 13, marginTop: spacing.xs },
  errorBanner: { color: colors.danger, marginTop: spacing.md, marginBottom: spacing.sm },
  footerRow: { marginTop: spacing.xl, alignSelf: 'center' },
});
