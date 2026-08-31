import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { PhoneOtpVerifyScreen } from '../features/auth/screens/PhoneOtpVerifyScreen';
import { PhoneSignInScreen } from '../features/auth/screens/PhoneSignInScreen';
import { SignUpScreen } from '../features/auth/screens/SignUpScreen';
import type { AuthStackParamList } from '../features/auth/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Stack shown whenever there is no authenticated user. */
export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: true, title: 'Reset Password' }}
      />
      <Stack.Screen
        name="PhoneSignIn"
        component={PhoneSignInScreen}
        options={{ headerShown: true, title: 'Phone Sign-In' }}
      />
      <Stack.Screen
        name="PhoneOtpVerify"
        component={PhoneOtpVerifyScreen}
        options={{ headerShown: true, title: 'Verify Code' }}
      />
    </Stack.Navigator>
  );
}
