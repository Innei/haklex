import type { DocumentBlocks } from '@haklex/rich-editor';
import { useEditorBlock } from '@haklex/rich-editor';
import type { LexicalEditor, LexicalNode } from 'lexical';
import {
  $createParagraphNode,
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getRoot,
  getNearestEditorFromDOMNode,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';

import { findGap } from './geometry';

const GAP_DELAY = 150;
const LEAVE_GRACE = 300;
const GUTTER = 32;

export interface GapState {
  index: number;
  left: number;
  next: HTMLElement | null;
  previous: HTMLElement | null;
  top: number;
  width: number;
}

function rootBlocks(rootElement: HTMLElement) {
  return [...rootElement.children].filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
}

function islandBlocks(canvas: HTMLElement) {
  return [...canvas.querySelectorAll<HTMLElement>('[data-virtual-editor-content]')]
    .flatMap(rootBlocks)
    .filter((block) => block.getBoundingClientRect().height > 0)
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
}

function firstVisibleIsland(canvas: HTMLElement) {
  return [...canvas.querySelectorAll<HTMLElement>('[data-virtual-editor-content]')].find(
    (root) => root.getBoundingClientRect().height > 0,
  );
}

function documentKeyOf(block: HTMLElement, documentBlocks: DocumentBlocks) {
  const owner = getNearestEditorFromDOMNode(block);
  if (!owner) return;
  const key = owner.read(() => $getNearestNodeFromDOMNode(block)?.getKey());
  return key ? documentBlocks.documentKeys(owner, [key])[0] : undefined;
}

export function $insertSlashParagraph(target: LexicalNode | null, before: boolean) {
  const paragraph = $createParagraphNode();
  const trigger = $createTextNode('/');
  paragraph.append(trigger);
  if (!target) $getRoot().append(paragraph);
  else if (before) target.insertBefore(paragraph);
  else target.insertAfter(paragraph);
  trigger.select(1, 1);
}

export function useGapInsert(
  editor: LexicalEditor,
  isBlockTarget: (target: HTMLElement) => boolean,
) {
  const [gap, setGap] = useState<GapState | null>(null);
  const pendingIndexRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveringPlusRef = useRef(false);
  const documentBlocks = useEditorBlock()?.documentBlocks;

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = null;
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    pendingIndexRef.current = null;
    if (!hoveringPlusRef.current) setGap(null);
  }, [clearTimer]);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;
    const container = rootElement.closest<HTMLElement>('.rich-editor') ?? rootElement.parentElement;
    if (!container) return;
    const canvas = documentBlocks
      ? rootElement.closest<HTMLElement>('[data-virtual-editor]')
      : null;

    let rafId: number | null = null;

    const evaluate = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (canvas && firstVisibleIsland(canvas) !== rootElement) {
        dismiss();
        return;
      }
      const rootRect = (canvas ?? rootElement).getBoundingClientRect();
      const inColumn = event.clientX >= rootRect.left - GUTTER && event.clientX <= rootRect.right;
      if (!inColumn || isBlockTarget(target) || target.closest('[role="toolbar"]')) {
        dismiss();
        return;
      }
      const blocks = canvas ? islandBlocks(canvas) : rootBlocks(rootElement);
      const found = findGap(
        blocks.map((block) => block.getBoundingClientRect()),
        event.clientY,
      );
      if (!found) {
        dismiss();
        return;
      }
      if (pendingIndexRef.current === found.index) return;
      clearTimer();
      pendingIndexRef.current = found.index;
      timerRef.current = setTimeout(() => {
        setGap({
          index: found.index,
          top: found.y + window.scrollY,
          left: rootRect.left + window.scrollX,
          width: rootRect.width,
          next: blocks[found.index] ?? null,
          previous: blocks[found.index - 1] ?? null,
        });
      }, GAP_DELAY);
    };

    const onMouseMove = (event: MouseEvent) => {
      clearLeaveTimer();
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        evaluate(event);
      });
    };

    // The + sits in the gutter, often outside the container, so leaving the
    // container on the way to it must not dismiss it before it is reached.
    const onMouseLeave = () => {
      clearLeaveTimer();
      leaveTimerRef.current = setTimeout(dismiss, LEAVE_GRACE);
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('scroll', dismiss, true);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', dismiss, true);
      clearTimer();
      clearLeaveTimer();
    };
  }, [clearLeaveTimer, clearTimer, dismiss, documentBlocks, editor, isBlockTarget]);

  const onPlusEnter = useCallback(() => {
    hoveringPlusRef.current = true;
    clearTimer();
    clearLeaveTimer();
  }, [clearLeaveTimer, clearTimer]);

  const onPlusLeave = useCallback(() => {
    hoveringPlusRef.current = false;
    dismiss();
  }, [dismiss]);

  const insertAtGap = useCallback(() => {
    if (!gap) return;
    const { index, next, previous } = gap;
    hoveringPlusRef.current = false;
    dismiss();
    setGap(null);
    const neighbor = next ?? previous;
    if (documentBlocks && neighbor) {
      const key = documentKeyOf(neighbor, documentBlocks);
      if (!key) return;
      documentBlocks.editor.update(
        () => $insertSlashParagraph($getNodeByKey(key), neighbor === next),
        { discrete: true },
      );
      documentBlocks.focusSelection();
      return;
    }
    editor.update(() => $insertSlashParagraph($getRoot().getChildAtIndex(index), true));
    editor.focus();
  }, [dismiss, documentBlocks, editor, gap]);

  return { gap, insertAtGap, onPlusEnter, onPlusLeave };
}
