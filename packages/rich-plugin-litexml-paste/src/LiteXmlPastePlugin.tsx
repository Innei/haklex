import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, $parseSerializedNode, COMMAND_PRIORITY_HIGH, PASTE_COMMAND } from 'lexical';
import { useEffect } from 'react';

import { detectLiteXml, parseLiteXmlSerializedNodes } from './litexml-import';

export function LiteXmlPastePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const clipboardData =
          'clipboardData' in event ? (event as ClipboardEvent).clipboardData : null;
        if (!clipboardData) return false;

        if (clipboardData.getData('application/x-lexical-editor')) return false;
        if (Array.from(clipboardData.files).some((f) => f.type.startsWith('image/'))) return false;

        const text = clipboardData.getData('text/plain');
        if (!text || !detectLiteXml(text)) return false;

        try {
          const serializedNodes = parseLiteXmlSerializedNodes(text);
          if (!serializedNodes?.length) return false;

          const nodes = serializedNodes.map((s) => $parseSerializedNode(s));
          $insertNodes(nodes);
          event.preventDefault();
          return true;
        } catch (error) {
          console.error('LiteXmlPastePlugin: paste error', error);
          return false;
        }
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
