import { articleTheme, PortalThemeProvider } from '@haklex/rich-style-token';
import type { CSSProperties, ReactNode } from 'react';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { FrameTheme } from '../../site/tokens';
import { frameVarsFor } from '../../site/tokens';

const FrameInViewContext = createContext(true);

function useFullyInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.intersectionRatio >= 0.98),
      { threshold: [0, 0.5, 0.98, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

const themeLabels: Record<FrameTheme, string> = { light: 'Light', dark: 'Dark' };

interface ThemeFrameProps {
  children: ReactNode;
  label?: string;
  stageClassName?: string;
  theme: FrameTheme;
}

export function ThemeFrame({ children, label, stageClassName, theme }: ThemeFrameProps) {
  const style = useMemo(() => frameVarsFor(theme) as CSSProperties, [theme]);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useFullyInView(stageRef);
  return (
    <div className="tf">
      <div className="tf-head">{label ?? themeLabels[theme]}</div>
      <div
        className={`tf-stage ${articleTheme}${stageClassName ? ` ${stageClassName}` : ''}`}
        data-theme={theme}
        ref={stageRef}
        style={style}
      >
        <FrameInViewContext value={inView}>
          <PortalThemeProvider className={articleTheme} theme={theme}>
            {children}
          </PortalThemeProvider>
        </FrameInViewContext>
      </div>
    </div>
  );
}

interface ThemePairProps {
  children: (theme: FrameTheme) => ReactNode;
  stageClassName?: string;
}

export function ThemePair({ children, stageClassName }: ThemePairProps) {
  return (
    <div className="tf-pair">
      {(['light', 'dark'] as const).map((theme) => (
        <ThemeFrame key={theme} stageClassName={stageClassName} theme={theme}>
          {children(theme)}
        </ThemeFrame>
      ))}
    </div>
  );
}

const keepOpenReasons = new Set(['outside-press', 'focus-out']);

export function usePinnedOpen(initial = true) {
  const inView = use(FrameInViewContext);
  const [open, setOpen] = useState(initial);
  const onOpenChange = useCallback((next: boolean, details?: { reason?: string }) => {
    if (!next && details?.reason && keepOpenReasons.has(details.reason)) return;
    setOpen(next);
  }, []);
  return { open: open && inView, onOpenChange };
}
