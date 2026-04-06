import { createContext, type Dispatch, type SetStateAction, use, useEffect } from 'react';

export const FullWidthContext = createContext<boolean>(false);
export const SetFullWidthContext = createContext<Dispatch<SetStateAction<boolean>>>(() => {});

export function useFullWidth() {
  const setFullWidth = use(SetFullWidthContext);
  useEffect(() => {
    setFullWidth(true);
    return () => setFullWidth(false);
  }, [setFullWidth]);
}
