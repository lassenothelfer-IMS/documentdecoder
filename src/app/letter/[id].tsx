import { useLocalSearchParams } from 'expo-router';

import { LetterScreen } from '@/screens/letter';

export default function LetterRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LetterScreen id={Number(id)} />;
}
