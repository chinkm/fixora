import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';

import { toFriendlyAuthErrorMessage } from '../../../api/firebase/auth';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useAuth } from '../../../hooks/useAuth';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { GOOGLE_OAUTH_CLIENT_IDS } from '../../../utils/constants';
import { validateEmailField, validatePasswordField } from '../../../utils/validators';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';
import type { AuthStackParamList, FormErrors } from '../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

type FieldName = 'email' | 'password';

export function LoginScreen({ navigation }: Props) {
  const { signIn, isLoading } = useAuth();
  const {
    signInWithGoogle,
    isSigningIn: isGoogleSigningIn,
    error: googleError,
  } = useGoogleSignIn(GOOGLE_OAUTH_CLIENT_IDS);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors<FieldName>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const nextErrors: FormErrors<FieldName> = {
      email: validateEmailField(email) ?? undefined,
      password: validatePasswordField(password) ?? undefined,
    };
    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!validate()) return;
    try {
      await signIn(email, password);
      // Navigation onward happens automatically: RootNavigator watches
      // isAuthenticated/role and swaps to Seeker/ProviderNavigator.
    } catch (err) {
      setSubmitError(toFriendlyAuthErrorMessage(err));
    }
  };

  const busy = isLoading || isGoogleSigningIn;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typography.h1}>Welcome back</Text>
      <Text style={[typography.body, styles.subtitle]}>Sign in to continue</Text>

      <Input
        testID="login-email"
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Input
        testID="login-password"
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoComplete="password"
        placeholder="••••••••"
      />

      {!!submitError && <Text style={styles.errorBanner}>{submitError}</Text>}
      {!!googleError && <Text style={styles.errorBanner}>{googleError}</Text>}

      <Button
        testID="login-submit"
        label="Sign In"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={busy}
      />

      <Pressable
        onPress={() => navigation.navigate('ForgotPassword')}
        disabled={busy}
        style={styles.linkRow}
      >
        <Text style={typography.link}>Forgot password?</Text>
      </Pressable>

      <View style={styles.divider} />

      <Button
        label="Continue with Google"
        variant="secondary"
        onPress={() => signInWithGoogle().catch(() => Alert.alert('Google sign-in failed'))}
        loading={isGoogleSigningIn}
        disabled={busy}
      />
      <View style={styles.spacer} />
      <Button
        label="Continue with Phone Number"
        variant="ghost"
        onPress={() => navigation.navigate('PhoneSignIn')}
        disabled={busy}
      />
      <View style={styles.spacer} />
      <Button
        label="Continue with Facebook (coming soon)"
        variant="ghost"
        onPress={() => Alert.alert('Facebook Login', 'Facebook Login is not implemented yet.')}
        disabled
      />

      <Pressable
        onPress={() => navigation.navigate('SignUp')}
        disabled={busy}
        style={styles.footerRow}
      >
        <Text style={typography.body}>
          Don&apos;t have an account? <Text style={typography.link}>Sign up</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xxl },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  errorBanner: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  linkRow: { marginTop: spacing.md, alignSelf: 'center' },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  spacer: { height: spacing.sm },
  footerRow: { marginTop: spacing.xl, alignSelf: 'center' },
});
