import '@haklex/rich-diff/style.css';

import { createAgentStore, createReviewBatch } from '@haklex/rich-agent-core';
import { AgentDiffEditNode, DiffReviewOverlayPlugin } from '@haklex/rich-ext-ai-agent';
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import type { SerializedEditorState } from 'lexical';
import { useEffect, useMemo } from 'react';

import { Panel } from '../../../components/Panel';
import { useTheme } from '../../../context/ThemeContext';
import { LexicalEditor } from '../../../lexical';
import { demoParagraph } from './demo-nodes';

const agentDiffBaseContent: SerializedEditorState = {
  root: {
    type: 'root',
    children: [
      demoParagraph(
        'The agent proposes changes as persistent Lexical nodes, not external overlay DOM.',
        'agent-diff-source-1',
      ),
      demoParagraph(
        'Pending proposals remain reviewable while undo and redo can traverse the node insertion.',
        'agent-diff-source-2',
      ),
      demoParagraph(
        'The next agent turn should read the factual document by projecting pending diff nodes back to the pre-accept side.',
        'agent-diff-source-3',
      ),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
};

const agentDiffOperations = [
  {
    op: 'replace' as const,
    blockId: 'agent-diff-source-1',
    node: demoParagraph(
      'The agent now proposes changes as durable Lexical diff nodes with real document placement.',
      'agent-diff-source-1',
    ),
  },
  {
    op: 'insert' as const,
    position: { type: 'after' as const, blockId: 'agent-diff-source-2' },
    node: demoParagraph(
      'Inserted proposals occupy their final document position before acceptance.',
      'agent-diff-inserted-1',
    ),
  },
  {
    op: 'delete' as const,
    blockId: 'agent-diff-source-3',
  },
];

function AgentDiffSeed({ store }: { store: ReturnType<typeof createAgentStore> }) {
  useEffect(() => {
    const batch = createReviewBatch(agentDiffOperations, agentDiffBaseContent, 0);
    store.getState().setReviewState({ documentRevision: 0, batches: [] });
    store.getState().addReviewBatch(batch);
  }, [store]);

  return null;
}

export function AgentDiffNodeDetail() {
  const theme = useTheme();
  const store = useMemo(() => createAgentStore(), []);

  return (
    <Panel badge={`real node · ${theme}`} bodyStyle={{ padding: 0 }} title="AI Agent Diff Node">
      <LexicalEditor
        extraNodes={[AgentDiffEditNode]}
        header={<ToolbarPlugin />}
        initialValue={agentDiffBaseContent}
        placeholder="Agent diff node demo"
        theme={theme}
        variant="article"
      >
        <DiffReviewOverlayPlugin store={store} />
        <AgentDiffSeed store={store} />
      </LexicalEditor>
    </Panel>
  );
}
