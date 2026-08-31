import type { GestureResponderEvent } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  /** Shows a spinner and disables the button — use while a request is in flight. */
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}
