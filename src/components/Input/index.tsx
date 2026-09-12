import { View, Text, TextInput } from 'react-native';

import { styles } from './styles';
import type { InputProps } from './types';
import { colors } from '../../theme/colors';

/** Presentational-only text field with a label and an inline error slot. */
export function Input({ label, error, testID, ...textInputProps }: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        testID={testID}
        style={[styles.field, error ? styles.fieldError : null]}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        {...textInputProps}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default Input;
