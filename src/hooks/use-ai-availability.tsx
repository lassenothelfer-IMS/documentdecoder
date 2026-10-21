import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { explainer, type AiAvailability } from '@/explainer';

type AiAvailabilityContextValue = {
  /** null while the first check is still running. */
  availability: AiAvailability | null;
  recheck: () => Promise<AiAvailability>;
};

const AiAvailabilityContext = createContext<AiAvailabilityContextValue | null>(null);

export function AiAvailabilityProvider({ children }: { children: ReactNode }) {
  const [availability, setAvailability] = useState<AiAvailability | null>(null);

  useEffect(() => {
    let active = true;
    const check = () => {
      void explainer.checkAvailability().then((result) => {
        if (active) {
          setAvailability(result);
        }
      });
    };
    check();
    // People fix "Apple Intelligence off" in the Settings app, so check again when they come back.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        check();
      }
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const recheck = useCallback(async () => {
    const result = await explainer.checkAvailability();
    setAvailability(result);
    return result;
  }, []);

  return <AiAvailabilityContext value={{ availability, recheck }}>{children}</AiAvailabilityContext>;
}

export function useAiAvailability(): AiAvailabilityContextValue {
  const value = use(AiAvailabilityContext);
  if (!value) {
    throw new Error('useAiAvailability must be used inside <AiAvailabilityProvider>.');
  }
  return value;
}
