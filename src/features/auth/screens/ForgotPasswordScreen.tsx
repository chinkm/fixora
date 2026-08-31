import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { toFriendlyAuthErrorMessage } from '../../../api/firebase/auth';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useAuth } from '../../../hooks/useAuth';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { validateEmailField } from '../../../utils/validators';
import type { AuthStackParamList } from '../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const validationError = validateEmailField(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(toFriendlyAuthErrorMessage(err));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typography.h1}>Reset your password</Text>
      <Text style={[typography.body, styles.subtitle]}>
        Enter the email you signed up with and we&apos;ll send you a reset link.
      </Text>

      {sent ? (
        <View>
          <Text style={styles.successBanner}>
            If an account exists for {email.trim()}, a reset link is on its way.
          </Text>
          <Button label="Back to Sign In" onPress={() => navigation.navigate('Login')} />
        </View>
      ) : (
        <>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={error}
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Button
            label="Send Reset Link"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xxl },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  successBanner: {
    color: colors.success,
    marginBottom: spacing.lg,
    fontSize: 15,
  },
});
