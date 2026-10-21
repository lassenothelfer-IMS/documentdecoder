import type { ConfirmOptions } from './confirm';

// react-native-web's Alert.alert is a no-op, so the browser preview uses the built-in dialog.
export function confirmDestructive({ title, message }: ConfirmOptions): Promise<boolean> {
  return Promise.resolve(window.confirm(`${title}\n\n${message}`));
}
