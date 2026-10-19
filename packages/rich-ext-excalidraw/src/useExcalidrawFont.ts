import { useEffect } from 'react';

import { useExcalidrawConfig } from './ExcalidrawConfigContext';

export function useExcalidrawFont(): void {
  const { fontCssHref } = useExcalidrawConfig();
  useEffect(() => {
    if (!fontCssHref || typeof document === 'undefined') return;
    if (document.head.querySelector(`link[href="${CSS.escape(fontCssHref)}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontCssHref;
    document.head.append(link);
  }, [fontCssHref]);
}
