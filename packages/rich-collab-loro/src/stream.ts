import {
  $getRoot,
  $isElementNode,
  $isTextNode,
  type LexicalEditor,
  type NodeKey,
  type SerializedEditorState,
} from 'lexical';
import type { LoroDoc, TreeID } from 'loro-crdt';

import { createLoroBinding } from './binding';
import { $reconcileRoot, type Frontiers, type Json, lcs, pairable, stable } from './reconcile';

export interface FrameFocus {
  offset: number;
  path: number[];
}

export interface Frame {
  focus: FrameFocus | null;
  root: Json;
}

export interface StreamStep {
  cursor: { id: TreeID; offset: number } | null;
  update: Uint8Array;
}

const TYPING_FRAME_BUDGET = 120;
const MAX_FRAMES_PER_BLOCK = 24;

interface Item {
  next: Json;
  old: Json | null;
}

interface Gap {
  dels: Json[];
  items: Item[];
  matched: Json | null;
}

const isFlat = (block: Json | null) =>
  !block || (block.children ?? []).every((child) => child.type === 'text');

const textOf = (block: Json | null) =>
  (block?.children ?? []).map((child) => child.text ?? '').join('');

function sliceRuns(runs: Json[], start: number, end: number): Json[] {
  const out: Json[] = [];
  let offset = 0;
  for (const run of runs) {
    const text = run.text ?? '';
    const from = Math.max(start, offset);
    const to = Math.min(end, offset + text.length);
    if (to > from) out.push({ ...run, text: text.slice(from - offset, to - offset) });
    offset += text.length;
  }
  return out;
}

function typingSpan(item: Item) {
  const before = textOf(item.old);
  const after = textOf(item.next);
  const limit = Math.min(before.length, after.length);
  let prefix = 0;
  while (prefix < limit && before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < limit - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix++;
  }
  return { after, prefix, suffix, middle: after.length - prefix - suffix };
}

function pairGap(dels: Json[], adds: Json[]): Item[] {
  const pending = [...dels];
  return adds.map((next) => {
    const blockId = next.$?.blockId;
    let slot = blockId === undefined ? -1 : pending.findIndex((old) => old.$?.blockId === blockId);
    if (slot === -1) slot = pending.findIndex((old) => pairable(old, next));
    return { next, old: slot === -1 ? null : pending.splice(slot, 1)[0]! };
  });
}

export function planFrames(base: Json, target: Json): Frame[] {
  const before = base.children ?? [];
  const after = target.children ?? [];
  const gaps: Gap[] = [];
  let ci = 0;
  let tj = 0;
  for (const [i, j] of [
    ...lcs(before.map(stable), after.map(stable)),
    [before.length, after.length] as [number, number],
  ]) {
    gaps.push({
      dels: before.slice(ci, i),
      items: pairGap(before.slice(ci, i), after.slice(tj, j)),
      matched: after[j] ?? null,
    });
    ci = i + 1;
    tj = j + 1;
  }

  const typingItems = gaps
    .flatMap((gap) => gap.items)
    .filter((item) => isFlat(item.old) && isFlat(item.next) && typingSpan(item).middle > 0);
  const perBlock = Math.min(
    MAX_FRAMES_PER_BLOCK,
    Math.max(1, Math.floor(TYPING_FRAME_BUDGET / Math.max(1, typingItems.length))),
  );

  const regions = gaps.map((gap) => [...gap.dels]);
  const frames: Frame[] = [];
  const render = () => ({
    ...target,
    children: gaps.flatMap((gap, g) => [...regions[g]!, ...(gap.matched ? [gap.matched] : [])]),
  });
  const regionStart = (g: number) =>
    gaps.slice(0, g).reduce((sum, gap, k) => sum + regions[k]!.length + (gap.matched ? 1 : 0), 0);
  const push = (focus: FrameFocus | null) => frames.push({ focus, root: render() });

  gaps.forEach((gap, g) => {
    const kept = gap.items.flatMap((item) => (item.old ? [item.old] : []));
    if (stable(kept) !== stable(regions[g])) {
      regions[g] = kept;
      push(null);
    }
    gap.items.forEach((item, k) => {
      const region = regions[g]!;
      const place = (block: Json, offset: number, first: boolean) => {
        region.splice(k, first && !item.old ? 0 : 1, block);
        push({ offset, path: [regionStart(g) + k] });
      };
      const span = typingSpan(item);
      if (!isFlat(item.old) || !isFlat(item.next) || span.middle === 0) {
        place(item.next, item.old ? span.prefix : 0, true);
        return;
      }
      const runs = item.next.children ?? [];
      const count = Math.min(perBlock, span.middle);
      const chunk = Math.ceil(span.middle / count);
      let first = true;
      for (let revealed = chunk; revealed < span.middle; revealed += chunk) {
        const cut = span.prefix + revealed;
        place(
          {
            ...item.next,
            children: [
              ...sliceRuns(runs, 0, cut),
              ...sliceRuns(runs, span.after.length - span.suffix, span.after.length),
            ],
          },
          cut,
          first,
        );
        first = false;
      }
      place(item.next, span.prefix + span.middle, first);
    });
  });
  return frames;
}

function $locate(focus: FrameFocus | null): { key: NodeKey; offset: number } | null {
  if (!focus) return null;
  const block = $getRoot().getChildAtIndex(focus.path[0]!);
  if (!block) return null;
  if (!$isElementNode(block)) return { key: block.getKey(), offset: 0 };
  let remaining = focus.offset;
  const texts = block.getChildren().filter($isTextNode);
  for (const text of texts) {
    const size = text.getTextContentSize();
    if (remaining <= size) return { key: text.getKey(), offset: remaining };
    remaining -= size;
  }
  const last = texts.at(-1);
  return last
    ? { key: last.getKey(), offset: last.getTextContentSize() }
    : { key: block.getKey(), offset: 0 };
}

export function streamAtVersion(
  doc: LoroDoc,
  frontiers: Frontiers,
  createEditor: () => LexicalEditor,
  base: SerializedEditorState,
  target: SerializedEditorState,
  commitMessage?: string,
): { frontiers: Frontiers; steps: StreamStep[] } {
  const fork = doc.forkAt(frontiers);
  const editor = createEditor();
  const binding = createLoroBinding(editor, fork, { commitMessage });
  const steps: StreamStep[] = [];
  let from = fork.oplogVersion();
  for (const frame of planFrames(base.root as unknown as Json, target.root as unknown as Json)) {
    editor.update(() => $reconcileRoot(frame.root as never), { discrete: true });
    const at = editor.getEditorState().read(() => $locate(frame.focus));
    const id = at ? binding.idOf(at.key) : undefined;
    const update = fork.export({ from, mode: 'update' });
    from = fork.oplogVersion();
    steps.push({ cursor: id && at ? { id, offset: at.offset } : null, update });
  }
  binding.dispose();
  return { frontiers: fork.frontiers(), steps };
}
