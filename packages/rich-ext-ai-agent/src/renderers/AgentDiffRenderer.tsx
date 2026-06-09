import { RichRenderer } from '@haklex/rich-compose';
import {
  useColorScheme,
  useExtraNodes,
  useRendererConfig,
  useVariant,
} from '@haklex/rich-editor/static';
import type { SerializedLexicalNode } from 'lexical';
import type { ReactElement } from 'react';

import { rendererFrame } from '../plugins/diff-review-overlay.css';
import {
  diffInlineRoot,
  diffInlineRow,
  diffInlineStack,
  diffRowDelete,
  diffRowInsert,
} from '../styles.css';

interface AgentDiffRendererProps {
  batchId: string;
  diffEntryId: string;
  opType: 'insert' | 'replace' | 'delete';
  originalNode?: SerializedLexicalNode | null;
  proposedNode?: SerializedLexicalNode | null;
}

function wrapDoc(node: SerializedLexicalNode) {
  return {
    root: {
      children: [node],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}

export function AgentDiffRenderer({
  originalNode,
  proposedNode,
}: AgentDiffRendererProps): ReactElement {
  const theme = useColorScheme();
  const variant = useVariant();
  const rendererConfig = useRendererConfig();
  const extraNodes = useExtraNodes();

  return (
    <div className={diffInlineRoot}>
      <div className={diffInlineStack}>
        {originalNode && (
          <div className={`${diffInlineRow} ${diffRowDelete}`}>
            <div className={rendererFrame}>
              <RichRenderer
                nested
                extraNodes={extraNodes}
                rendererConfig={rendererConfig}
                theme={theme}
                value={wrapDoc(originalNode)}
                variant={variant}
              />
            </div>
          </div>
        )}

        {proposedNode && (
          <div className={`${diffInlineRow} ${diffRowInsert}`}>
            <div className={rendererFrame}>
              <RichRenderer
                nested
                extraNodes={extraNodes}
                rendererConfig={rendererConfig}
                theme={theme}
                value={wrapDoc(proposedNode)}
                variant={variant}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
