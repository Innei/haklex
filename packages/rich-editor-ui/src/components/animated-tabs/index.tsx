'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import * as css from './styles.css';

export interface Tab {
  id: string;
  label: string;
}

export interface AnimatedTabsProps {
  className?: string;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  tabs: Tab[];
  value?: string;
}

interface IndicatorStyle {
  left: number;
  width: number;
}

function cn(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function AnimatedTabs({ tabs, defaultTab, value, onChange, className }: AnimatedTabsProps) {
  const isControlled = value !== undefined;
  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.id ?? '');
  const activeTab = isControlled ? value : internalTab;

  const [indicator, setIndicator] = useState<IndicatorStyle>({
    left: 0,
    width: 0,
  });
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const updateIndicator = useCallback(() => {
    const activeEl = tabRefs.current.get(activeTab);
    const container = containerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const handleTabClick = (tabId: string) => {
    if (!isControlled) {
      setInternalTab(tabId);
    }
    onChange?.(tabId);
  };

  return (
    <div className={cn(css.root, className)} ref={containerRef}>
      <div aria-orientation="horizontal" className={css.tablist} role="tablist">
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={cn(css.tab, activeTab === tab.id ? css.tabActive : undefined)}
            key={tab.id}
            role="tab"
            type="button"
            ref={(el) => {
              if (el) {
                tabRefs.current.set(tab.id, el);
              } else {
                tabRefs.current.delete(tab.id);
              }
            }}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div aria-hidden="true" className={css.border} />

      <div
        aria-hidden="true"
        className={css.indicator}
        style={{
          left: indicator.left,
          width: indicator.width,
        }}
      />
    </div>
  );
}
