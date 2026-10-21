import { Redirect } from 'expo-router';

import { AiCheck } from '@/screens/ai-check';

export default function AiCheckScreen() {
  // Developer tool only: release builds have no way in, and a deep link lands on Home.
  if (!__DEV__) {
    return <Redirect href="/" />;
  }
  return <AiCheck />;
}
