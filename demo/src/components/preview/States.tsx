import type { ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';

import { installPseudoStates } from '../../site/pseudo-states';

interface ForceProps {
  attrs: Record<string, string>;
  children: ReactNode;
  target?: string;
}

export function Force({ attrs, children, target }: ForceProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if ('data-pseudo' in attrs) installPseudoStates();
    const root = ref.current;
    if (!root) return;
    const find = () =>
      target ? root.querySelector(target) : (root.firstElementChild as Element | null);
    const apply = () => {
      const el = find();
      if (!el) return;
      for (const [name, value] of Object.entries(attrs)) {
        if (el.getAttribute(name) !== value) el.setAttribute(name, value);
      }
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, childList: true, subtree: true });
    return () => observer.disconnect();
  }, [attrs, target]);

  return (
    <span className="force" ref={ref}>
      {children}
    </span>
  );
}

export const hover = { 'data-pseudo': 'hover' };
export const focusVisible = { 'data-pseudo': 'focus-visible' };
export const focus = { 'data-pseudo': 'focus focus-visible' };
export const highlighted = { 'data-highlighted': '' };

export function StateGrid({ children }: { children: ReactNode }) {
  return <div className="state-grid">{children}</div>;
}

export function StateCell({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="state-cell">
      <span className="state-label">{label}</span>
      <div className="state-body">{children}</div>
    </div>
  );
}
