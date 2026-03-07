import { PortalThemeProvider, PortalThemeWrapper } from '@haklex/rich-style-token';
import type { FC } from 'react';
import { createElement, useCallback, useEffect, useRef, useState } from 'react';

import type { DialogStackItem } from './store';
import { dismissDialog, removeDialog } from './store';
import * as css from './styles.css';

export const SheetStackEntry: FC<{
  item: DialogStackItem;
  index: number;
}> = ({ item, index }) => {
  const {
    id,
    open,
    title,
    description,
    content,
    className,
    portalClassName,
    theme = 'light',
    clickOutsideToDismiss = true,
  } = item;

  const dismiss = useCallback(() => dismissDialog(id), [id]);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => removeDialog(id), 200);
      return () => clearTimeout(timer);
    }
  }, [open, id]);

  // Body scroll lock
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Touch gesture state
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startY: number;
    startTime: number;
    currentY: number;
    isDragging: boolean;
  } | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    const isHandle = target.closest(`.${css.sheetDragHandle}`) !== null;
    const contentEl = contentRef.current;
    const isContentAtTop = !contentEl || contentEl.scrollTop <= 0;

    if (!isHandle && !isContentAtTop) return;

    dragState.current = {
      startY: touch.clientY,
      startTime: Date.now(),
      currentY: touch.clientY,
      isDragging: false,
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const state = dragState.current;
    if (!state) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - state.startY;

    if (deltaY < 0) {
      if (state.isDragging) {
        setTranslateY(0);
        setIsDragging(false);
        state.isDragging = false;
      }
      return;
    }

    if (!state.isDragging && deltaY > 5) {
      state.isDragging = true;
      setIsDragging(true);
    }

    if (state.isDragging) {
      e.preventDefault();
      state.currentY = touch.clientY;
      setTranslateY(deltaY);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const state = dragState.current;
    if (!state || !state.isDragging) {
      dragState.current = null;
      return;
    }

    const deltaY = state.currentY - state.startY;
    const elapsed = Date.now() - state.startTime;
    const velocity = (deltaY / Math.max(elapsed, 1)) * 1000;
    const sheetHeight = sheetRef.current?.offsetHeight ?? 0;
    const threshold = sheetHeight * 0.25;

    if (deltaY > threshold || velocity > 500) {
      dismiss();
    } else {
      setTranslateY(0);
    }

    setIsDragging(false);
    dragState.current = null;
  }, [dismiss]);

  const zIndex = 50 + index;
  const sheetHeight = sheetRef.current?.offsetHeight || 1;
  const backdropOpacity = isDragging ? Math.max(0, 1 - translateY / sheetHeight) * 0.5 : 0.5;

  return (
    <PortalThemeProvider className={portalClassName ?? ''} theme={theme}>
      <PortalThemeWrapper>
        <div
          className={css.sheetBackdrop}
          style={{
            zIndex,
            opacity: open ? backdropOpacity : 0,
            pointerEvents: open ? 'auto' : 'none',
          }}
          onClick={clickOutsideToDismiss ? dismiss : undefined}
        />

        <div
          className={`${css.sheetContainer}${className ? ` ${className}` : ''}`}
          data-closed={!open ? '' : undefined}
          data-open={open ? '' : undefined}
          ref={sheetRef}
          style={{
            zIndex: zIndex + 1,
            transform: isDragging ? `translateY(${translateY}px)` : undefined,
            transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
          }}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
        >
          <div className={css.sheetDragHandle}>
            <div className={css.sheetDragPill} />
          </div>

          {(title || description) && (
            <div className={css.sheetHeader}>
              {title && <div className={css.title}>{title}</div>}
              {description && <div className={css.description}>{description}</div>}
            </div>
          )}

          <div className={css.sheetContent} ref={contentRef}>
            {createElement(content, { dismiss })}
          </div>
        </div>
      </PortalThemeWrapper>
    </PortalThemeProvider>
  );
};
