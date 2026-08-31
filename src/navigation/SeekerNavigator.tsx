import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';

import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type SeekerStackParamList = { SeekerHome: undefined };
const Stack = createNativeStackNavigator<SeekerStackParamList>();

/**
 * Placeholder home screen. Real seeker features (browse providers, AI
 * camera, job requests, booking) ship in later milestones — this exists
 * only to prove the RootNavigator → role-based routing works end to end.
 */
function SeekerHomeScreen() {
  const { user, signOut, isLoading } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={typography.h1}>Seeker Home</Text>
      <Text style={typography.body}>
        Signed in as {user?.email ?? user?.phoneNumber ?? user?.uid}
      </Text>
      <View style={styles.spacer} />
      <Button label="Sign Out" variant="danger" onPress={() => signOut()} loading={isLoading} />
    </View>
  );
}

export function SeekerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SeekerHome" component={SeekerHomeScreen} options={{ title: 'Home' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xxl },
  spacer: { height: spacing.lg },
});
