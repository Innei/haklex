import { $getNodeByKey, type LexicalEditor, type NodeKey } from 'lexical';

import {
  type CaretRect,
  caretRect,
  clearRanges,
  createCaretElement,
  findScrollContainer,
  publishRanges,
  supportsHighlights,
  textRange,
} from './dom';
import { $revealText, planReveal } from './plan';
import { createRevealQueue, type QueueOptions } from './queue';
import { FADE_HIGHLIGHTS, HIDDEN_HIGHLIGHT } from './styles.css';

export const AGENT_WRITE_TAG = 'agent-write';

export interface PlaybackState {
  blockKey: NodeKey | null;
  playing: boolean;
}

export interface PlayerOptions extends QueueOptions {
  agentName: string;
  onPlaybackChange?: (state: PlaybackState) => void;
  scrollContainer: HTMLElement | null;
}

const FADE_STEP = 2;
const LINGER_MS = 600;
const FOLLOW_MARGIN = 48;
const MAX_FRAME_SECONDS = 0.1;

export function playAgentWrite(editor: LexicalEditor, fn: () => void): void {
  editor.update(fn, { discrete: true, tag: AGENT_WRITE_TAG });
}

export function createAgentStreamPlayer(
  editor: LexicalEditor,
  getOptions: () => PlayerOptions,
): { dispose: () => void } {
  if (!supportsHighlights()) return { dispose: () => {} };

  const owner = {};
  const queue = createRevealQueue(getOptions);
  const caret = createCaretElement();
  const hiddenBlocks = new Set<NodeKey>();
  let frame = 0;
  let last = 0;
  let follow = true;
  let playing = false;
  let reported: NodeKey | null = null;
  let linger: ReturnType<typeof setTimeout> | undefined;

  const report = (state: PlaybackState) => getOptions().onPlaybackChange?.(state);

  const setBlockHidden = (key: NodeKey, hidden: boolean) => {
    const element = editor.getElementByKey(key);
    if (element) element.style.visibility = hidden ? 'hidden' : '';
    if (hidden) hiddenBlocks.add(key);
    else hiddenBlocks.delete(key);
  };

  const followCaret = (rect: CaretRect) => {
    const root = editor.getRootElement();
    if (!follow || !root) return;
    const container = getOptions().scrollContainer ?? findScrollContainer(root);
    const isDocument = container === document.scrollingElement;
    const bottom = isDocument ? window.innerHeight : container.getBoundingClientRect().bottom;
    const overflow = rect.top + rect.height + FOLLOW_MARGIN - bottom;
    if (overflow > 0) container.scrollTop += overflow;
  };

  const render = () => {
    const { pending, caret: at } = queue.snapshot();
    const hidden: Range[] = [];
    const fades: Range[][] = FADE_HIGHLIGHTS.map(() => []);
    const stillHidden = new Set<NodeKey>();
    pending.forEach(({ segment, revealed }, index) => {
      if (segment.kind === 'block') {
        if (revealed < 1) stillHidden.add(segment.blockKey);
        return;
      }
      const boundary = segment.from + revealed;
      const range = textRange(editor, segment.blockKey, boundary, segment.to);
      if (range) hidden.push(range);
      if (index !== 0 || revealed === 0) return;
      FADE_HIGHLIGHTS.forEach((_, tier) => {
        const end = boundary - tier * FADE_STEP;
        const start = Math.max(segment.from, end - FADE_STEP);
        const fade = end > start ? textRange(editor, segment.blockKey, start, end) : null;
        if (fade) fades[tier]!.push(fade);
      });
    });
    for (const key of hiddenBlocks) if (!stillHidden.has(key)) setBlockHidden(key, false);
    for (const key of stillHidden) setBlockHidden(key, true);
    publishRanges(owner, HIDDEN_HIGHLIGHT, hidden);
    FADE_HIGHLIGHTS.forEach((name, tier) => publishRanges(owner, name, fades[tier]!));

    const blockKey = at?.blockKey ?? pending[0]?.segment.blockKey ?? null;
    if (blockKey !== reported && playing) {
      reported = blockKey;
      report({ playing: true, blockKey });
    }
    const root = editor.getRootElement();
    const rect = at ? caretRect(editor, at) : null;
    if (rect && root?.parentElement) {
      caret.place(rect, root.parentElement);
      followCaret(rect);
    }
  };

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    queue.finish();
    const wasPlaying = playing;
    playing = false;
    reported = null;
    render();
    clearRanges(owner);
    clearTimeout(linger);
    linger = setTimeout(caret.hide, LINGER_MS);
    if (wasPlaying) report({ playing: false, blockKey: null });
  };

  const tick = (now: number) => {
    queue.advance(Math.min(MAX_FRAME_SECONDS, (now - last) / 1000));
    last = now;
    render();
    if (queue.snapshot().idle) stop();
    else frame = requestAnimationFrame(tick);
  };

  const invalidateChanged = () => {
    const { pending } = queue.snapshot();
    editor.getEditorState().read(() => {
      for (const { segment } of pending) {
        if (segment.kind !== 'text') continue;
        const node = $getNodeByKey(segment.blockKey);
        if (!node || $revealText(node) !== segment.text) queue.invalidate(segment.blockKey);
      }
    });
  };

  const unregisterUpdate = editor.registerUpdateListener(
    ({ tags, prevEditorState, editorState, dirtyElements, dirtyLeaves }) => {
      const hasDirt = dirtyElements.size > 0 || dirtyLeaves.size > 0;
      const agent = tags.has(AGENT_WRITE_TAG);
      if (agent) queue.enqueue(planReveal(prevEditorState, editorState));
      if (hasDirt && (playing || agent)) invalidateChanged();
      if (agent && !queue.snapshot().idle) {
        clearTimeout(linger);
        caret.setName(getOptions().agentName);
        follow = true;
        if (!playing) {
          playing = true;
          reported = null;
        }
        render();
        if (!frame) {
          last = performance.now();
          frame = requestAnimationFrame(tick);
        }
        return;
      }
      if (!playing) return;
      if (queue.snapshot().idle) stop();
      else render();
    },
  );

  const stopFollow = () => {
    follow = false;
  };

  const unregisterRoot = editor.registerRootListener((root, prev) => {
    for (const type of ['keydown', 'paste', 'pointerdown'] as const) {
      prev?.removeEventListener(type, stop);
      root?.addEventListener(type, stop);
    }
  });

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && playing) stop();
  };

  window.addEventListener('wheel', stopFollow, { passive: true });
  window.addEventListener('touchmove', stopFollow, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  return {
    dispose() {
      if (playing) report({ playing: false, blockKey: null });
      playing = false;
      cancelAnimationFrame(frame);
      clearTimeout(linger);
      for (const key of hiddenBlocks) setBlockHidden(key, false);
      clearRanges(owner);
      caret.element.remove();
      unregisterUpdate();
      unregisterRoot();
      window.removeEventListener('wheel', stopFollow);
      window.removeEventListener('touchmove', stopFollow);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    },
  };
}
