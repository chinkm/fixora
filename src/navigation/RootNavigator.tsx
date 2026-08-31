import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthNavigator } from './AuthNavigator';
import { ProviderNavigator } from './ProviderNavigator';
import { SeekerNavigator } from './SeekerNavigator';
import { RoleSelectionScreen } from '../features/auth/screens/RoleSelectionScreen';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';

/**
 * Single place that decides which navigator to render, based on auth state:
 *   1. Not yet initialized  -> full-screen spinner (checking persisted session)
 *   2. Not authenticated    -> AuthNavigator (Login/SignUp/etc.)
 *   3. Authenticated, no role yet (new Phone/Google user) -> RoleSelectionScreen
 *   4. Authenticated, role = seeker  -> SeekerNavigator
 *   5. Authenticated, role = provider -> ProviderNavigator
 */
export function RootNavigator() {
  const { isInitialized, isAuthenticated, needsRoleSelection, role } = useAuth();

  if (!isInitialized) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : needsRoleSelection ? (
        <RoleSelectionScreen />
      ) : role === 'provider' ? (
        <ProviderNavigator />
      ) : (
        <SeekerNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
