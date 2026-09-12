import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

import { getPendingPhoneConfirmation } from './PhoneSignInScreen';
import { confirmPhoneOtp, toFriendlyAuthErrorMessage } from '../../../api/firebase/auth';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useAuth } from '../../../hooks/useAuth';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { validateOtpField } from '../../../utils/validators';
import type { AuthStackParamList } from '../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneOtpVerify'>;

export function PhoneOtpVerifyScreen({ route }: Props) {
  const { phoneNumber } = route.params;
  const { refreshSession } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setError(null);
    const validationError = validateOtpField(code);
    if (validationError) {
      setError(validationError);
      return;
    }
    const confirmationResult = getPendingPhoneConfirmation();
    if (!confirmationResult) {
      setError('Your verification session expired. Please request a new code.');
      return;
    }
    setIsVerifying(true);
    try {
      await confirmPhoneOtp(confirmationResult, code);
      // Firebase is now signed in. AuthContext's onAuthStateChanged listener
      // will pick this up, but we refresh explicitly so role state (or the
      // "needs role selection" state for a brand-new user) updates immediately.
      await refreshSession();
      // RootNavigator takes it from here (RoleSelection or Seeker/ProviderNavigator).
    } catch (err) {
      setError(toFriendlyAuthErrorMessage(err));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typography.h1}>Enter your code</Text>
      <Text style={[typography.body, styles.subtitle]}>
        We sent a 6-digit code to {phoneNumber}
      </Text>

      <Input
        label="Verification code"
        value={code}
        onChangeText={setCode}
        error={error}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="123456"
      />

      <Button label="Verify" onPress={handleVerify} loading={isVerifying} disabled={isVerifying} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xxl },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
});
