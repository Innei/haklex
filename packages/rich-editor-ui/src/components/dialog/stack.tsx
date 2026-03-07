import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { PortalThemeProvider, PortalThemeWrapper } from '@haklex/rich-style-token';
import { X } from 'lucide-react';
import type { FC, PropsWithChildren } from 'react';
import { createElement, useCallback, useEffect, useSyncExternalStore } from 'react';

import { SheetStackEntry } from './sheet';
import type { DialogStackItem } from './store';
import { dismissDialog, getSnapshot, removeDialog, subscribe } from './store';
import * as css from './styles.css';

const MOBILE_QUERY = '(max-width: 640px)';

function useIsMobile(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(MOBILE_QUERY);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

function shouldUseSheet(sheet: boolean | 'auto' | undefined, isMobile: boolean): boolean {
  if (sheet === true) return true;
  if (sheet === 'auto') return isMobile;
  return false;
}

const CloseIcon: FC = () => <X />;

const DialogStackEntry: FC<{
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
    showCloseButton = true,
    clickOutsideToDismiss = true,
  } = item;

  const dismiss = useCallback(() => dismissDialog(id), [id]);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        removeDialog(id);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open, id]);

  const zIndex = 50 + index;

  return (
    <DialogPrimitive.Root
      disablePointerDismissal={!clickOutsideToDismiss}
      open={open}
      onOpenChange={(open) => {
        if (!open) dismiss();
      }}
    >
      <DialogPrimitive.Portal>
        <PortalThemeProvider className={portalClassName ?? ''} theme={theme}>
          <PortalThemeWrapper>
            <DialogPrimitive.Backdrop className={css.backdrop} style={{ zIndex }} />
            <DialogPrimitive.Popup
              suppressHydrationWarning
              className={`${css.popup}${className ? ` ${className}` : ''}`}
              data-theme={theme}
              style={{ zIndex: zIndex + 1 }}
            >
              {(title || description) && (
                <div className={css.header}>
                  {title && (
                    <DialogPrimitive.Title className={css.title}>{title}</DialogPrimitive.Title>
                  )}
                  {description && (
                    <DialogPrimitive.Description className={css.description}>
                      {description}
                    </DialogPrimitive.Description>
                  )}
                </div>
              )}
              {createElement(content, { dismiss })}
              {showCloseButton && (
                <DialogPrimitive.Close className={css.closeButton}>
                  <CloseIcon />
                </DialogPrimitive.Close>
              )}
            </DialogPrimitive.Popup>
          </PortalThemeWrapper>
        </PortalThemeProvider>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export const DialogStackProvider: FC<PropsWithChildren> = ({ children }) => {
  const stack = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const isMobile = useIsMobile();

  return (
    <>
      {children}
      {stack.map((item, index) =>
        shouldUseSheet(item.sheet, isMobile) ? (
          <SheetStackEntry index={index} item={item} key={item.id} />
        ) : (
          <DialogStackEntry index={index} item={item} key={item.id} />
        ),
      )}
    </>
  );
};
