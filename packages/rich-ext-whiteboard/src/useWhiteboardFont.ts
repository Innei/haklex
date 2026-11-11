import { useEffect } from 'react';

import { useWhiteboardConfig } from './WhiteboardConfigContext';

export const DEFAULT_FONT_CSS_HREF =
  'https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont/style.css';

export function useWhiteboardFont(): void {
  const { fontCssHref = DEFAULT_FONT_CSS_HREF } = useWhiteboardConfig();
  useEffect(() => {
    if (!fontCssHref || typeof document === 'undefined') return;
    if (document.head.querySelector(`link[href="${CSS.escape(fontCssHref)}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontCssHref;
    document.head.append(link);
  }, [fontCssHref]);
}
