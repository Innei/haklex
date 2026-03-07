import type { FC, ReactNode } from 'react';
import { createContext, use } from 'react';

export interface PresentDialogProps {
  className?: string;
  clickOutsideToDismiss?: boolean;
  content: FC<{ dismiss: () => void }>;
  description?: ReactNode;
  portalClassName?: string;
  sheet?: boolean | 'auto';
  showCloseButton?: boolean;
  theme?: 'light' | 'dark';
  title?: ReactNode;
}

export type PresentDialogFn = (props: PresentDialogProps) => (() => void) | void;

const PresentDialogContext = createContext<PresentDialogFn | null>(null);

export const PresentDialogProvider = PresentDialogContext.Provider;

export function usePresentDialog(): PresentDialogFn | null {
  return use(PresentDialogContext);
}
