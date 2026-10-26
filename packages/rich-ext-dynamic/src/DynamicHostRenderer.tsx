import type { DynamicMountHandle, DynamicMountInput } from '@haklex/rich-dynamic-protocol';
import { isDynamicComponentModule } from '@haklex/rich-dynamic-protocol';
import { useColorScheme, useEditorBlock } from '@haklex/rich-editor/static';
import type { NodeKey } from 'lexical';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { DynamicSlotProps } from './slot';
import * as css from './styles.css';

export interface DynamicHostRendererProps extends DynamicSlotProps {
  nodeKey?: NodeKey;
  validateUrl?: (url: string) => boolean;
}

type Status = 'loading' | 'mounted' | 'error';

// The ignore hints keep bundlers from rewriting the remote URL import into a
// "too dynamic" stub; avoiding new Function keeps it CSP-safe without unsafe-eval
const importRemoteModule = (url: string): Promise<unknown> =>
  import(/* @vite-ignore */ /* webpackIgnore: true */ /* turbopackIgnore: true */ url);

function parseProps(json: string): Record<string, unknown> {
  try {
    const value = JSON.parse(json);
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function DynamicHostRenderer({
  url,
  componentProps,
  initialHeight,
  validateUrl,
  nodeKey,
}: DynamicHostRendererProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<DynamicMountHandle | null>(null);
  const latestInputRef = useRef<DynamicMountInput | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);
  const theme = useColorScheme();
  const propsJson = JSON.stringify(componentProps ?? {});
  const binding = useEditorBlock();
  const state = useMemo(() => binding?.nodeState(nodeKey), [binding, nodeKey]);
  const latestState = useRef(state);
  latestState.current = state;
  const ownerState = useRef(state);

  useEffect(() => {
    const input: DynamicMountInput = { props: parseProps(propsJson), host: { theme } };
    latestInputRef.current = input;
    const handle = handleRef.current;
    if (handle?.getState && ownerState.current)
      ownerState.current.set('dynamic', handle.getState());
    handle?.update?.(input);
    if (state !== ownerState.current) handle?.setState?.(state?.get('dynamic'));
    ownerState.current = state;
  }, [propsJson, state, theme]);

  useEffect(() => {
    const container = hostRef.current?.shadowRoot?.firstElementChild;
    if (container instanceof HTMLElement) {
      container.style.minHeight = `${initialHeight}px`;
      container.style.colorScheme = theme;
    }
  }, [initialHeight, theme]);

  useEffect(() => {
    const hostEl = hostRef.current;
    if (!hostEl || !url) return;
    if (validateUrl && !validateUrl(url)) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    const shadow = hostEl.shadowRoot ?? hostEl.attachShadow({ mode: 'open' });
    shadow.replaceChildren();
    const container = document.createElement('div');
    // Inherited properties cross the shadow boundary, including the inline
    // white-space: pre-wrap / word-break that Lexical sets on its editable root
    container.style.all = 'initial';
    container.style.display = 'block';
    container.style.colorScheme = theme;
    // initialHeight is the box's permanent floor, mirrored inside the shadow
    // root, so mount never shrinks the reserved space (zero-CLS contract)
    container.style.minHeight = `${initialHeight}px`;
    shadow.append(container);

    importRemoteModule(url)
      .then((mod) => {
        if (cancelled) return;
        const component = (mod as { default?: unknown })?.default;
        if (!isDynamicComponentModule(component)) {
          throw new Error('module default export does not implement the dynamic mount protocol');
        }
        const input = latestInputRef.current ?? {
          props: parseProps(propsJson),
          host: { theme },
        };
        handleRef.current = component.mount(container, input);
        if (latestState.current) {
          if (!handleRef.current.getState || !handleRef.current.setState) {
            handleRef.current.unmount();
            handleRef.current = null;
            throw new Error('Virtualized dynamic components require getState/setState');
          }
          handleRef.current.setState(latestState.current.get('dynamic'));
          ownerState.current = latestState.current;
        }
        setStatus('mounted');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error('[DynamicHostRenderer]', error);
        setStatus('error');
      });

    return () => {
      cancelled = true;
      try {
        if (handleRef.current?.getState && ownerState.current)
          ownerState.current.set('dynamic', handleRef.current.getState());
        handleRef.current?.unmount();
      } catch (error) {
        console.error('[DynamicHostRenderer]', error);
      }
      handleRef.current = null;
    };
    // propsJson/theme flow through latestInputRef + handle.update, not remount
  }, [url, attempt, validateUrl]);

  if (!url) {
    return (
      <div
        className={`${css.root} ${css.semanticClassNames.root}`}
        style={{ minHeight: initialHeight }}
      >
        <div className={`${css.overlay} ${css.semanticClassNames.placeholder}`}>
          <span>No component URL</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${css.root} ${css.semanticClassNames.root}`}
      style={{ minHeight: initialHeight }}
    >
      <div className={`${css.host} ${css.semanticClassNames.host}`} ref={hostRef} />
      {status === 'loading' && (
        <div className={`${css.overlay} ${css.semanticClassNames.placeholder}`}>
          <span>Loading component…</span>
        </div>
      )}
      {status === 'error' && (
        <div className={`${css.overlay} ${css.semanticClassNames.error}`}>
          <span>Failed to load component</span>
          <span className={css.errorUrl}>{url}</span>
          <button
            className={css.retryButton}
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
