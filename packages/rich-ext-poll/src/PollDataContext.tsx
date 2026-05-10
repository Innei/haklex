import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

import type { PollDataAdapter, PollState } from './types';

interface PollDataContextValue {
  adapter: PollDataAdapter | null;
  initialStates: Record<string, PollState>;
}

const PollDataContext = createContext<PollDataContextValue>({
  adapter: null,
  initialStates: {},
});

export interface PollDataProviderProps {
  adapter: PollDataAdapter;
  children: ReactNode;
  initialStates?: Record<string, PollState>;
}

export function PollDataProvider({ adapter, initialStates, children }: PollDataProviderProps) {
  const value = useMemo<PollDataContextValue>(
    () => ({ adapter, initialStates: initialStates ?? {} }),
    [adapter, initialStates],
  );
  return <PollDataContext.Provider value={value}>{children}</PollDataContext.Provider>;
}

export function usePollDataAdapter(): PollDataAdapter | null {
  return use(PollDataContext).adapter;
}

export function useInitialPollState(pollId: string): PollState | undefined {
  return use(PollDataContext).initialStates[pollId];
}
