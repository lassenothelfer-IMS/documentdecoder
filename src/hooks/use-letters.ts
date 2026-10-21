import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getLetter, listLetters, type Letter, type LetterSummary } from '@/db/letters';

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; data: T };

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/** The saved letters, newest first. Reloads whenever the screen regains focus, keeping old rows meanwhile. */
export function useLetters() {
  const db = useSQLiteContext();
  const [state, setState] = useState<LoadState<LetterSummary[]>>({ status: 'loading' });

  const reload = useCallback(async () => {
    try {
      setState({ status: 'ready', data: await listLetters(db) });
    } catch (error) {
      setState({ status: 'error', error: toError(error) });
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { state, reload };
}

/** One saved letter with its original text. Resolves to null when the letter doesn't exist. */
export function useLetter(id: number) {
  const db = useSQLiteContext();
  const [state, setState] = useState<LoadState<Letter | null>>({ status: 'loading' });

  const reload = useCallback(async () => {
    try {
      setState({ status: 'ready', data: Number.isInteger(id) ? await getLetter(db, id) : null });
    } catch (error) {
      setState({ status: 'error', error: toError(error) });
    }
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { state, reload };
}
