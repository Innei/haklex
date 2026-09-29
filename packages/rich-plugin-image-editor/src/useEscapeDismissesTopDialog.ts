import { dismissTopDialog } from '@haklex/rich-editor-ui';
import { useEffect } from 'react';

// Stacked presentDialog entries are sibling Base UI roots that each treat
// themselves as topmost, so one Escape would close every layer.
export function useEscapeDismissesTopDialog() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      dismissTopDialog();
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);
}
