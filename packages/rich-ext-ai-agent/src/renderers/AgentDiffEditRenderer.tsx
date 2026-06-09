import { RichRenderer } from '@haklex/rich-compose';
import {
  useColorScheme,
  useExtraNodes,
  useRendererConfig,
  useVariant,
} from '@haklex/rich-editor/static';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { SerializedLexicalNode } from 'lexical';
import { Check, X } from 'lucide-react';
import type { ReactElement } from 'react';

import { getAgentDiffReviewController } from '../plugins/diff-node-controller';
import { rendererFrame } from '../plugins/diff-review-overlay.css';
import {
  diffInlineBar,
  diffInlineBarAccept,
  diffInlineBarReject,
  diffInlineRoot,
  diffInlineRow,
  diffInlineStack,
  diffRowDelete,
  diffRowInsert,
} from '../styles.css';

interface AgentDiffEditRendererProps {
  batchId: string;
  diffEntryId: string;
  nodeKey: string;
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

export function AgentDiffEditRenderer({
  batchId,
  diffEntryId,
  nodeKey,
  originalNode,
  proposedNode,
}: AgentDiffEditRendererProps): ReactElement {
  const [editor] = useLexicalComposerContext();
  const actions = getAgentDiffReviewController(editor);
  const theme = useColorScheme();
  const variant = useVariant();
  const rendererConfig = useRendererConfig();
  const extraNodes = useExtraNodes();

  return (
    <div className={diffInlineRoot}>
      <div className={diffInlineBar}>
        <button
          className={diffInlineBarReject}
          title="Reject change"
          type="button"
          onClick={() => actions?.rejectNode(nodeKey, batchId, diffEntryId)}
        >
          <X size={13} />
          Reject
        </button>
        <button
          className={diffInlineBarAccept}
          title="Accept change"
          type="button"
          onClick={() => actions?.acceptNode(nodeKey, batchId, diffEntryId)}
        >
          <Check size={13} />
          Accept
        </button>
      </div>

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
