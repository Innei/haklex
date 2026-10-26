import { $isElementNode, $parseSerializedNode, type ElementNode, type LexicalNode } from 'lexical';

import type { SerializedBlock } from './document';

// Custom nodes need an explicit rebinding adapter; unknown types remount their body.
const reusable = new Set([
  'paragraph',
  'text',
  'heading',
  'quote',
  'list',
  'listitem',
  'details',
  'dynamic',
]);

export function $syncChildren(parent: ElementNode, data: SerializedBlock[]) {
  const previous = parent.getChildren();
  data.forEach((next, index) => {
    const node = previous[index];
    if (node?.getType() === next.type && reusable.has(next.type)) {
      node.updateFromJSON(next as never);
      if (next.type === 'details') {
        const details = node as LexicalNode & {
          setOpen: (open: boolean) => void;
          setSummary: (summary: string) => void;
        };
        details.setOpen(Boolean(next.open));
        details.setSummary(next.summary);
      } else if (next.type === 'dynamic') {
        const dynamic = node as LexicalNode & {
          setUrl: (url: string) => void;
          setProps: (props: Record<string, unknown>) => void;
          setInitialHeight: (height: number) => void;
        };
        dynamic.setUrl(next.url);
        dynamic.setProps(next.props);
        dynamic.setInitialHeight(next.initialHeight);
      }
      if ($isElementNode(node)) $syncChildren(node, next.children ?? []);
    } else {
      const replacement = $parseSerializedNode(next);
      if (node) node.replace(replacement);
      else parent.append(replacement);
    }
  });
  for (const node of previous.slice(data.length)) node.remove();
}
