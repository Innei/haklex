import { PortalThemeWrapper } from '@haklex/rich-style-token';
import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { ActionButton } from '../action-button';
import type { ToastItem } from './store';
import { dismissToast, getToasts, subscribeToasts } from './store';
import * as css from './styles.css';

export type { ToastItem, ToastOptions, ToastTone } from './store';
export { dismissToast, getToasts, toast, updateToast } from './store';

const EMPTY: ToastItem[] = [];

function ToastIcon({ tone }: { tone: ToastItem['tone'] }) {
  if (tone === 'loading') return <LoaderCircle className={`${css.icon} ${css.spin}`} />;
  if (tone === 'success') return <CircleCheck className={`${css.icon} ${css.success}`} />;
  if (tone === 'error') return <CircleAlert className={`${css.icon} ${css.error}`} />;
  return null;
}

export function ToastViewport() {
  const items = useSyncExternalStore(subscribeToasts, getToasts, () => EMPTY);
  if (typeof document === 'undefined') return null;

  return createPortal(
    <PortalThemeWrapper>
      <div aria-live="polite" className={css.viewport} role="status">
        {items.map((item) => (
          <div className={css.toast} key={item.id}>
            <ToastIcon tone={item.tone} />
            <span className={css.title}>{item.title}</span>
            {item.action && (
              <ActionButton
                size="sm"
                onClick={() => {
                  item.action?.onClick();
                  dismissToast(item.id);
                }}
              >
                {item.action.label}
              </ActionButton>
            )}
          </div>
        ))}
      </div>
    </PortalThemeWrapper>,
    document.body,
  );
}
