import type { LexicalEditor } from 'lexical';

export type AgentDiffReviewActions = {
  acceptBatch: (batchId: string) => void;
  acceptNode: (nodeKey: string, batchId: string, entryId: string) => void;
  rejectBatch: (batchId: string) => void;
  rejectNode: (nodeKey: string, batchId: string, entryId: string) => void;
};

const controllers = new WeakMap<LexicalEditor, AgentDiffReviewActions>();

export function setAgentDiffReviewController(
  editor: LexicalEditor,
  controller: AgentDiffReviewActions | null,
) {
  if (controller) {
    controllers.set(editor, controller);
  } else {
    controllers.delete(editor);
  }
}

export function getAgentDiffReviewController(editor: LexicalEditor) {
  return controllers.get(editor) ?? null;
}
