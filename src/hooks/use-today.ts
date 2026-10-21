import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Today's date for deadline maths. The app can stay suspended for days, so it is refreshed when
 * the screen regains focus and when the app returns to the foreground.
 */
export function useToday(): Date {
  const [today, setToday] = useState(() => new Date());

  const refresh = useCallback(() => {
    const now = new Date();
    setToday((previous) => (isSameDay(previous, now) ? previous : now));
  }, []);

  useFocusEffect(refresh);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  return today;
}
