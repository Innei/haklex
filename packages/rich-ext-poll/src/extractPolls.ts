import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

import type { PollMetadata } from './types';

interface MaybeSerializedPollNode extends SerializedLexicalNode {
  children?: SerializedLexicalNode[];
  closeAt?: unknown;
  content?: SerializedEditorState;
  mode?: unknown;
  options?: unknown;
  pollId?: unknown;
  question?: unknown;
  showResults?: unknown;
}

function isPollNode(node: SerializedLexicalNode): node is Required<MaybeSerializedPollNode> {
  return node.type === 'poll';
}

function coercePollMetadata(node: MaybeSerializedPollNode): PollMetadata | null {
  if (typeof node.pollId !== 'string' || typeof node.question !== 'string') return null;
  if (!Array.isArray(node.options)) return null;
  if (node.mode !== 'single' && node.mode !== 'multiple') return null;

  const options = node.options
    .filter(
      (option): option is { id: string; label: string } =>
        !!option &&
        typeof option === 'object' &&
        typeof (option as { id?: unknown }).id === 'string' &&
        typeof (option as { label?: unknown }).label === 'string',
    )
    .map((option) => ({ id: option.id, label: option.label }));

  return {
    pollId: node.pollId,
    question: node.question,
    options,
    mode: node.mode,
    ...(typeof node.closeAt === 'string' ? { closeAt: node.closeAt } : {}),
    ...(node.showResults === 'always' ||
    node.showResults === 'after-vote' ||
    node.showResults === 'after-close'
      ? { showResults: node.showResults }
      : {}),
  };
}

function walk(node: SerializedLexicalNode, out: PollMetadata[]): void {
  if (isPollNode(node)) {
    const meta = coercePollMetadata(node);
    if (meta) out.push(meta);
    return;
  }

  const maybe = node as MaybeSerializedPollNode;
  if (Array.isArray(maybe.children)) {
    for (const child of maybe.children) walk(child, out);
  }
  if (maybe.content && typeof maybe.content === 'object') {
    walkSerializedState(maybe.content, out);
  }
}

function walkSerializedState(state: SerializedEditorState, out: PollMetadata[]): void {
  const root = state.root;
  if (!root || !Array.isArray(root.children)) return;
  for (const child of root.children) walk(child, out);
}

export function extractPolls(state: SerializedEditorState): PollMetadata[] {
  const out: PollMetadata[] = [];
  walkSerializedState(state, out);
  return out;
}
