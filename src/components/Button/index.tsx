import { Pressable, Text, ActivityIndicator, View } from 'react-native';

import { styles } from './styles';
import type { ButtonProps } from './types';
import { colors } from '../../theme/colors';

/**
 * Presentational-only button. No business logic — screens pass an onPress
 * handler and a loading flag (typically wired to an AuthContext call).
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isFilled = variant === 'primary' || variant === 'secondary' || variant === 'danger';

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && { opacity: 0.85 },
      ]}
    >
      {loading && (
        <View style={styles.spinnerSpacing}>
          <ActivityIndicator size="small" color={isFilled ? colors.white : colors.primary} />
        </View>
      )}
      <Text style={[styles.labelBase, isFilled ? styles.labelOnFilled : styles.labelOnGhost]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default Button;
