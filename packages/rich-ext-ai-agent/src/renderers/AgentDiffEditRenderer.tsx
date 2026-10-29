import { RichRenderer } from '@haklex/rich-compose';
import {
  useColorScheme,
  useExtraNodes,
  useRendererConfig,
  useVariant,
} from '@haklex/rich-editor/static';
import { ActionButton } from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { SerializedLexicalNode } from 'lexical';
import { Check, X } from 'lucide-react';
import type { ReactElement } from 'react';

import { getAgentDiffReviewController } from '../plugins/diff-node-controller';
import {
  hunkAccept,
  hunkBody,
  hunkGutter,
  hunkReject,
  hunkRoot,
  rendererFrame,
} from '../plugins/diff-review-overlay.css';
import { diffInlineRow, diffInlineStack, diffRowDelete, diffRowInsert } from '../styles.css';

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
    <div className={hunkRoot}>
      <div className={hunkBody}>
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

      <div aria-label="Review change" className={hunkGutter} role="group">
        <ActionButton
          icon
          aria-label="Reject change"
          className={hunkReject}
          size="sm"
          title="Reject change"
          variant="ghost"
          onClick={() => actions?.rejectNode(nodeKey, batchId, diffEntryId)}
        >
          <X />
        </ActionButton>
        <ActionButton
          icon
          aria-label="Accept change"
          className={hunkAccept}
          size="sm"
          title="Accept change"
          variant="ghost"
          onClick={() => actions?.acceptNode(nodeKey, batchId, diffEntryId)}
        >
          <Check />
        </ActionButton>
      </div>
    </div>
  );
}
