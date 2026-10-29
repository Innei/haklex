import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useStore } from 'jotai';
import {
  $createNodeSelection,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isNodeSelection,
  $setSelection,
} from 'lexical';
import { useEffect, useState } from 'react';

import { wrapperRefAtom } from './atoms';
import { semanticClassNames } from './styles.css';

export function useImageSelected(): boolean {
  const [editor] = useLexicalComposerContext();
  const store = useStore();
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const wrapper = store.get(wrapperRefAtom).current;
    if (!wrapper) return;

    const readSelected = () =>
      editor.read(() => {
        const selection = $getSelection();
        if (!$isNodeSelection(selection)) return false;
        const node = $getNearestNodeFromDOMNode(wrapper);
        return node !== null && selection.has(node.getKey());
      });

    const sync = () => {
      const next = readSelected();
      setSelected(next);
      if (next) wrapper.dataset.selected = '';
      else delete wrapper.dataset.selected;
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest(`.${semanticClassNames.editToolbar}`)) return;
      editor.update(
        () => {
          const node = $getNearestNodeFromDOMNode(wrapper);
          if (!node) return;
          const selection = $createNodeSelection();
          selection.add(node.getKey());
          $setSelection(selection);
        },
        { tag: 'skip-scroll-into-view' },
      );
    };

    sync();
    wrapper.addEventListener('click', handleClick);
    const unregister = editor.registerUpdateListener(sync);
    return () => {
      wrapper.removeEventListener('click', handleClick);
      unregister();
      delete wrapper.dataset.selected;
    };
  }, [editor, store]);

  return selected;
}
