import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConfirmationResult } from 'firebase/auth';
import { useRef, useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

import { startPhoneSignIn, toFriendlyAuthErrorMessage } from '../../../api/firebase/auth';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { validatePhoneField } from '../../../utils/validators';
import {
  PhoneRecaptchaVerifier,
  type PhoneRecaptchaVerifierHandle,
} from '../components/PhoneRecaptchaVerifier';
import type { AuthStackParamList } from '../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneSignIn'>;

// Module-level so the pending ConfirmationResult survives navigation to the
// next screen without threading a non-serializable object through route params.
let pendingConfirmation: ConfirmationResult | null = null;
export function getPendingPhoneConfirmation(): ConfirmationResult | null {
  return pendingConfirmation;
}

export function PhoneSignInScreen({ navigation }: Props) {
  const recaptchaRef = useRef<PhoneRecaptchaVerifierHandle>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSendCode = async () => {
    setError(null);
    const validationError = validatePhoneField(phoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!recaptchaRef.current) {
      setError('Verification is still loading. Please try again in a moment.');
      return;
    }
    setIsSending(true);
    try {
      const confirmationResult = await startPhoneSignIn(phoneNumber, recaptchaRef.current);
      pendingConfirmation = confirmationResult;
      navigation.navigate('PhoneOtpVerify', {
        verificationId: confirmationResult.verificationId,
        phoneNumber: phoneNumber.trim(),
      });
    } catch (err) {
      setError(toFriendlyAuthErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typography.h1}>Sign in with phone</Text>
      <Text style={[typography.body, styles.subtitle]}>
        We&apos;ll text you a one-time code. Standard SMS rates may apply.
      </Text>

      <Input
        label="Phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        error={error}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="+60123456789"
      />

      <Button label="Send Code" onPress={handleSendCode} loading={isSending} disabled={isSending} />

      {/* Invisible — solves the reCAPTCHA challenge required by Firebase phone auth. */}
      <PhoneRecaptchaVerifier ref={recaptchaRef} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xxl },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
});
