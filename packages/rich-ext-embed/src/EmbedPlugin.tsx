import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_LOW, createCommand, PASTE_COMMAND } from 'lexical';
import { useEffect, useMemo } from 'react';

import { $createEmbedEditNode } from './nodes/EmbedEditNode';
import { createSelfThinkingMatcher, matchEmbedUrl } from './url-matchers';

export const INSERT_EMBED_COMMAND = createCommand<string>('INSERT_EMBED');

export interface EmbedPluginProps {
  selfHostnames?: string[];
}

export function EmbedPlugin({ selfHostnames }: EmbedPluginProps) {
  const [editor] = useLexicalComposerContext();

  const thinkingMatcher = useMemo(
    () => (selfHostnames?.length ? createSelfThinkingMatcher(selfHostnames) : undefined),
    [selfHostnames],
  );

  useEffect(() => {
    const removePaste = editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!(event instanceof ClipboardEvent)) return false;
        const text = event.clipboardData?.getData('text/plain')?.trim();
        if (!text) return false;

        let url: URL;
        try {
          url = new URL(text);
        } catch {
          return false;
        }

        const source = matchEmbedUrl(url, thinkingMatcher);
        if (!source) return false;

        event.preventDefault();
        editor.update(() => {
          $insertNodes([$createEmbedEditNode(text, source)]);
        });
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    const removeInsert = editor.registerCommand(
      INSERT_EMBED_COMMAND,
      (url) => {
        let source = null;
        try {
          source = matchEmbedUrl(new URL(url));
        } catch {
          // keep null
        }
        editor.update(() => {
          $insertNodes([$createEmbedEditNode(url, source)]);
        });
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      removePaste();
      removeInsert();
    };
  }, [editor, thinkingMatcher]);

  return null;
}
