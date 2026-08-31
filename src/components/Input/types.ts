import type { KeyboardTypeOptions, TextInputProps } from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** Validation error text shown below the field; also flips border to danger color. */
  error?: string | null;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  testID?: string;
}
