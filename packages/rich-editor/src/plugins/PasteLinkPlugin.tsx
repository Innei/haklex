import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
} from 'lexical';
import { useEffect } from 'react';

const LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function toPureUrl(raw: string | undefined): string | null {
  const text = raw?.trim();
  if (!text || /\s/.test(text)) return null;
  try {
    return LINK_PROTOCOLS.has(new URL(text).protocol) ? text : null;
  } catch {
    return null;
  }
}

export function PasteLinkPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!(event instanceof ClipboardEvent)) return false;

        const selection = $getSelection();
        if (!$isRangeSelection(selection) || selection.isCollapsed()) return false;

        const url = toPureUrl(event.clipboardData?.getData('text/plain'));
        if (!url) return false;

        const textNodes = selection.getNodes().filter($isTextNode);
        if (textNodes.length === 0) return false;
        if (textNodes.some((node) => !node.isSimpleText())) return false;

        const block = textNodes[0].getTopLevelElement();
        if (!block || textNodes.some((node) => node.getTopLevelElement() !== block)) return false;

        event.preventDefault();
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
