import { $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createNodeSelection, $getNodeByKey, $setSelection } from 'lexical';
import { useCallback, useMemo } from 'react';

import { matchUrl } from './hooks/useUrlMatcher';
import { $createLinkCardEditNode } from './LinkCardEditNode';
import { LinkKindSwitch } from './LinkKindSwitch';
import type { PluginRegistry } from './types';

export interface ConvertToLinkCardActionProps {
  /** Ignored since the action renders a `Link | Card` segmented control; kept for slot compatibility. */
  className?: string;
  linkKey: string;
  pluginRegistry?: PluginRegistry;
  url: string;
}

export function ConvertToLinkCardAction({
  url,
  linkKey,
  pluginRegistry,
}: ConvertToLinkCardActionProps) {
  const [editor] = useLexicalComposerContext();

  const info = useMemo(() => matchUrl(url, pluginRegistry), [url, pluginRegistry]);

  const handleConvert = useCallback(() => {
    editor.update(() => {
      const linkNode = $getNodeByKey(linkKey);
      if (!linkNode || !$isLinkNode(linkNode)) return;
      const topElement = linkNode.getTopLevelElement();
      if (!topElement) return;

      const linkCardNode = $createLinkCardEditNode({ url });
      topElement.replace(linkCardNode);
      const nodeSelection = $createNodeSelection();
      nodeSelection.add(linkCardNode.getKey());
      $setSelection(nodeSelection);
    });
  }, [editor, linkKey, url]);

  if (!info) return null;

  return (
    <LinkKindSwitch
      value="link"
      onChange={(kind) => {
        if (kind === 'card') handleConvert();
      }}
    />
  );
}
