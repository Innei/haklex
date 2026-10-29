import { vars } from '@haklex/rich-style-token';
import type { LexicalEditor } from 'lexical';
import type { RefObject } from 'react';
import { useLayoutEffect } from 'react';

import type { Box } from './position';
import { computeToolbarPosition, getViewportBounds } from './position';

type CssVarName = `--${string}`;

function extractCssVarName(value: string): CssVarName | null {
  const match = value.match(/^var\((--[^\s),]+)(?:,[^)]+)?\)$/);
  return (match?.[1] as CssVarName | undefined) ?? null;
}

function collectThemeVarNames(contract: unknown, output: Set<CssVarName>): Set<CssVarName> {
  if (typeof contract === 'string') {
    const cssVarName = extractCssVarName(contract);
    if (cssVarName) output.add(cssVarName);
    return output;
  }

  if (contract && typeof contract === 'object') {
    for (const value of Object.values(contract as Record<string, unknown>)) {
      collectThemeVarNames(value, output);
    }
  }

  return output;
}

const THEME_VAR_NAMES = Array.from(collectThemeVarNames(vars, new Set()));

function applyThemeVars(editor: LexicalEditor, toolbar: HTMLElement) {
  const rootElement = editor.getRootElement();
  if (!rootElement) return;
  const computed = window.getComputedStyle(rootElement);
  for (const name of THEME_VAR_NAMES) {
    const value = computed.getPropertyValue(name).trim();
    if (value) toolbar.style.setProperty(name, value);
  }
}

export function useToolbarPosition({
  active,
  editor,
  getAnchor,
  portalContainer,
  toolbarRef,
  trigger,
}: {
  active: boolean;
  editor: LexicalEditor;
  getAnchor: () => Box | null;
  portalContainer: Element;
  toolbarRef: RefObject<HTMLDivElement | null>;
  trigger: unknown;
}) {
  useLayoutEffect(() => {
    if (!active) return;

    const position = () => {
      const toolbar = toolbarRef.current;
      const rootElement = editor.getRootElement();
      if (!toolbar || !rootElement) return;

      // Portaled outside the editor, so theme variables must be copied over for
      // light/dark to match the editor it belongs to.
      applyThemeVars(editor, toolbar);

      const anchor = getAnchor();
      if (!anchor) return;

      const pos = computeToolbarPosition({
        anchor,
        size: { width: toolbar.offsetWidth, height: toolbar.offsetHeight },
        bounds: getViewportBounds(rootElement, toolbar, anchor.top),
      });

      // Inside a transformed ancestor (e.g. a dialog popup) position:fixed is
      // relative to that ancestor rather than the viewport.
      const containerRect =
        portalContainer === document.body ? null : portalContainer.getBoundingClientRect();
      toolbar.style.top = `${pos.top - (containerRect?.top ?? 0)}px`;
      toolbar.style.left = `${pos.left - (containerRect?.left ?? 0)}px`;
      toolbar.dataset.placement = pos.placement;
    };

    position();
    const frame = requestAnimationFrame(position);
    const onScroll = () => requestAnimationFrame(position);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
    };
  }, [active, editor, getAnchor, portalContainer, toolbarRef, trigger]);
}
