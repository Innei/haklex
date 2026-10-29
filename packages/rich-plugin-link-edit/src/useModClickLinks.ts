import type { LexicalEditor } from 'lexical';
import { useEffect } from 'react';

import * as styles from './styles.css';

const CSS_CLASSES = [styles.cmdHover, styles.semanticClassNames.cmdHover];

function bindRoot(root: HTMLElement): () => void {
  const updateCursor = (mod: boolean) => {
    for (const cssClass of CSS_CLASSES) {
      root.classList.toggle(cssClass, mod);
    }
  };

  const onKeyDown = (e: globalThis.KeyboardEvent) => {
    if (e.key === 'Meta' || e.key === 'Control') updateCursor(true);
  };
  const onKeyUp = (e: globalThis.KeyboardEvent) => {
    if (e.key === 'Meta' || e.key === 'Control') updateCursor(false);
  };
  const onBlur = () => updateCursor(false);

  const onClick = (e: MouseEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const anchor = (e.target as HTMLElement).closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href) {
      e.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  root.addEventListener('keydown', onKeyDown);
  root.addEventListener('keyup', onKeyUp);
  root.addEventListener('blur', onBlur);
  root.addEventListener('click', onClick);
  return () => {
    root.removeEventListener('keydown', onKeyDown);
    root.removeEventListener('keyup', onKeyUp);
    root.removeEventListener('blur', onBlur);
    root.removeEventListener('click', onClick);
    for (const cssClass of CSS_CLASSES) {
      root.classList.remove(cssClass);
    }
  };
}

export function useModClickLinks(editor: LexicalEditor): void {
  useEffect(() => {
    let unbind: (() => void) | null = null;
    const unregister = editor.registerRootListener((root) => {
      unbind?.();
      unbind = root ? bindRoot(root) : null;
    });
    return () => {
      unregister();
      unbind?.();
    };
  }, [editor]);
}
