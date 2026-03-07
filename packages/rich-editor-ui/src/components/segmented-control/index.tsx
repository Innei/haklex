'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import * as css from './styles.css';

export interface SegmentedControlItem<T extends string = string> {
  disabled?: boolean;
  label: ReactNode;
  value: T;
}

export interface SegmentedControlProps<T extends string = string> {
  className?: string;
  fullWidth?: boolean;
  items: SegmentedControlItem<T>[];
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  value: T;
}

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  size = 'sm',
  fullWidth = false,
  className,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemElementsRef = useRef<Map<T, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [isReady, setIsReady] = useState(false);

  const updateIndicator = useCallback(() => {
    const container = containerRef.current;
    const activeEl = itemElementsRef.current.get(value);
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    setIndicator({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    });
    setIsReady(true);
  }, [value]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      updateIndicator();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateIndicator]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabledItems = items.filter((item) => !item.disabled);
    const currentIndex = enabledItems.findIndex((item) => item.value === value);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % enabledItems.length;
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
        break;
      }
      case 'Home': {
        e.preventDefault();
        nextIndex = 0;
        break;
      }
      case 'End': {
        e.preventDefault();
        nextIndex = enabledItems.length - 1;
        break;
      }
    }

    if (nextIndex !== currentIndex) {
      const nextItem = enabledItems[nextIndex];
      onChange(nextItem.value);
      itemElementsRef.current.get(nextItem.value)?.focus();
    }
  };

  return (
    <div
      aria-orientation="horizontal"
      className={`${css.container({ size, fullWidth })} ${className || ''}`.trim()}
      ref={containerRef}
      role="tablist"
      onKeyDown={handleKeyDown}
    >
      <div
        aria-hidden="true"
        className={css.indicator({ ready: isReady })}
        style={{
          left: indicator.left,
          width: indicator.width,
        }}
      />

      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            aria-selected={isActive}
            data-active={isActive || undefined}
            disabled={item.disabled}
            key={item.value}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
            className={css.item({
              size,
              active: isActive,
              disabled: Boolean(item.disabled),
              fullWidth,
            })}
            ref={(el) => {
              if (el) itemElementsRef.current.set(item.value, el);
              else itemElementsRef.current.delete(item.value);
            }}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
