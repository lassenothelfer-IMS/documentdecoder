import { router, Stack } from 'expo-router';

export function SettingsButton() {
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Button icon="gearshape" onPress={() => router.push('/settings')} />
    </Stack.Toolbar>
  );
}
