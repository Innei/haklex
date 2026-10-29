import { detectPlatform } from '@haklex/rich-editor-ui';
import { $getNodeByKey, type LexicalEditor } from 'lexical';
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';

import { $isAgentDiffNode } from '../nodes/AgentDiffNode';
import type { AgentDiffReviewActions } from './diff-node-controller';
import {
  getReviewPosition,
  isTextEntryTarget,
  matchReviewShortcut,
  reconcileCurrentHunk,
  REVIEW_CURRENT_ATTR,
  type ReviewShortcut,
  stepReviewHunk,
} from './review-navigation';

export function useReviewNavigation(
  editor: LexicalEditor,
  hunkKeys: readonly string[],
  actions: AgentDiffReviewActions,
) {
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [trackedKeys, setTrackedKeys] = useState<readonly string[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const keysSignature = hunkKeys.join('\u0000');

  if (trackedKeys.join('\u0000') !== keysSignature) {
    setTrackedKeys(hunkKeys);
    setCurrentKey(reconcileCurrentHunk(trackedKeys, hunkKeys, currentKey));
  }

  useEffect(() => {
    if (!currentKey) return;
    const element = editor.getElementByKey(currentKey);
    if (!element) return;
    element.setAttribute(REVIEW_CURRENT_ATTR, 'true');
    return () => element.removeAttribute(REVIEW_CURRENT_ATTR);
  }, [currentKey, editor, keysSignature]);

  const go = useCallback(
    (direction: 1 | -1) => {
      const next = stepReviewHunk(hunkKeys, currentKey, direction);
      setCurrentKey(next);
      if (next) {
        editor.getElementByKey(next)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [currentKey, editor, hunkKeys],
  );

  const resolveCurrent = useCallback(
    (side: 'accepted' | 'rejected') => {
      if (!currentKey) return;
      const ids = editor.getEditorState().read(() => {
        const node = $getNodeByKey(currentKey);
        return $isAgentDiffNode(node)
          ? { batchId: node.getBatchId(), entryId: node.getDiffEntryId() }
          : null;
      });
      if (!ids) return;
      if (side === 'accepted') actions.acceptNode(currentKey, ids.batchId, ids.entryId);
      else actions.rejectNode(currentKey, ids.batchId, ids.entryId);
    },
    [actions, currentKey, editor],
  );

  const onShortcut = useEffectEvent((shortcut: ReviewShortcut) => {
    if (shortcut === 'previous') go(-1);
    else if (shortcut === 'next') go(1);
    else resolveCurrent(shortcut === 'accept' ? 'accepted' : 'rejected');
  });

  const active = hunkKeys.length > 0;

  useEffect(() => {
    if (!active) return;
    const isMac = detectPlatform(navigator) === 'mac';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const shortcut = matchReviewShortcut(event, isMac);
      if (!shortcut) return;

      const { target } = event;
      if (isTextEntryTarget(target)) return;
      const rootElement = editor.getRootElement();
      const inScope =
        target === document.body ||
        (target instanceof Node &&
          (barRef.current?.contains(target) || rootElement?.contains(target)));
      if (!inScope) return;

      event.preventDefault();
      onShortcut(shortcut);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, editor]);

  return {
    barRef,
    next: useCallback(() => go(1), [go]),
    previous: useCallback(() => go(-1), [go]),
    accept: useCallback(() => resolveCurrent('accepted'), [resolveCurrent]),
    reject: useCallback(() => resolveCurrent('rejected'), [resolveCurrent]),
    ...getReviewPosition(hunkKeys, currentKey),
  };
}
