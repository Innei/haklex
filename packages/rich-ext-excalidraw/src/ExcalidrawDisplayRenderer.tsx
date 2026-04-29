import type { ExcalidrawImperativeAPI, ExcalidrawProps } from '@excalidraw/excalidraw/types';
import { useColorScheme } from '@haklex/rich-editor';
import { presentDialog } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import { Maximize2, ScanSearch, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Component, type ComponentType, type FC, type ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { readonlyUIOptions } from './constants';
import * as css from './styles.css';
import { useExcalidrawData } from './useExcalidrawData';

export interface ExcalidrawStaticRendererProps {
  snapshot: string;
}

export const ExcalidrawDisplayRenderer: FC<ExcalidrawStaticRendererProps> = ({ snapshot }) => {
  const theme = useColorScheme();
  return <ExcalidrawStaticCanvas snapshot={snapshot} theme={theme} />;
};

// --- Fullscreen readonly content ---

const ExcalidrawExpandContent: FC<{
  dismiss: () => void;
  ExcalidrawComponent: ComponentType<ExcalidrawProps>;
  data: Record<string, any>;
  theme: 'light' | 'dark';
}> = ({ dismiss, ExcalidrawComponent, data, theme }) => {
  const apiRef = useRef<any>(null);

  return (
    <>
      <div className={css.excalidrawDialogHeader}>
        <div className={css.excalidrawDialogHeaderTitle}>
          <span className={css.excalidrawDialogTitle}>Whiteboard</span>
          <span className={css.excalidrawDialogMeta}>excalidraw</span>
        </div>
        <button className={css.excalidrawHeaderClose} type="button" onClick={dismiss}>
          <X size={18} />
        </button>
      </div>
      <div className={css.excalidrawDialogCanvas}>
        <ExcalidrawComponent
          viewModeEnabled
          zenModeEnabled
          UIOptions={readonlyUIOptions}
          initialData={data}
          theme={theme}
          excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
            apiRef.current = api;
            setTimeout(() => api.scrollToContent(), 100);
          }}
        />
      </div>
    </>
  );
};

// --- Main Canvas ---

const ExcalidrawStaticCanvas: FC<{
  snapshot: string;
  theme: 'light' | 'dark';
}> = ({ snapshot, theme }) => {
  const { snapshot: data, loading: dataLoading, error: dataError } = useExcalidrawData(snapshot);
  const [ExcalidrawComponent, setExcalidrawComponent] =
    useState<ComponentType<ExcalidrawProps> | null>(null);
  const [libLoading, setLibLoading] = useState(true);
  const apiRef = useRef<any>(null);
  const { className: portalClassName } = usePortalTheme();

  useEffect(() => {
    Promise.all([
      import('@excalidraw/excalidraw'),
      // @ts-expect-error - Excalidraw 0.18 ships CSS as a separate entry; loaded for side effects.
      import('@excalidraw/excalidraw/index.css'),
    ])
      .then(([mod]) => {
        const Comp = mod.Excalidraw;

        if (Comp) setExcalidrawComponent(() => Comp as ComponentType<ExcalidrawProps>);
        setLibLoading(false);
      })
      .catch((error) => {
        console.error('Error loading excalidraw', error);
        setLibLoading(false);
      });
  }, []);

  const handleExpand = useCallback(() => {
    if (!ExcalidrawComponent || !data) return;
    presentDialog({
      content: ({ dismiss }) => (
        <ExcalidrawExpandContent
          ExcalidrawComponent={ExcalidrawComponent}
          data={data}
          dismiss={dismiss}
          theme={theme}
        />
      ),
      className: css.excalidrawFullscreenPopup,
      portalClassName,
      theme,
      showCloseButton: false,
      clickOutsideToDismiss: true,
    });
  }, [ExcalidrawComponent, data, theme, portalClassName]);

  const loading = dataLoading || libLoading;

  if (loading) {
    return (
      <div className={css.excalidrawStaticContainer}>
        <div className={css.excalidrawLoading}>Loading excalidraw...</div>
      </div>
    );
  }

  if (dataError || !data) {
    return (
      <div className={css.excalidrawStaticContainer}>
        <div className={css.excalidrawError}>{dataError || 'No data'}</div>
      </div>
    );
  }

  if (!ExcalidrawComponent) {
    return (
      <div className={css.excalidrawStaticContainer}>
        <div className={css.excalidrawError}>Failed to load excalidraw</div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className={css.excalidrawStaticContainer}
      data-color-scheme={theme}
      data-theme={theme}
    >
      <ExcalidrawErrorBoundary
        fallback={<div className={css.excalidrawError}>Failed to render excalidraw</div>}
      >
        <ExcalidrawComponent
          viewModeEnabled
          zenModeEnabled
          UIOptions={readonlyUIOptions}
          initialData={data}
          theme={theme}
          excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
            apiRef.current = api;
            setTimeout(() => api.scrollToContent(), 100);
          }}
        />
      </ExcalidrawErrorBoundary>

      <div className={css.excalidrawActionGroup}>
        <button
          className={css.excalidrawActionButton}
          title="Zoom In"
          type="button"
          onClick={() => {
            const api = apiRef.current;
            if (!api) return;
            const zoom = api.getAppState().zoom.value;
            api.updateScene({ appState: { zoom: { value: zoom * 1.25 } } });
          }}
        >
          <ZoomIn size={20} />
        </button>
        <button
          className={css.excalidrawActionButton}
          title="Zoom Out"
          type="button"
          onClick={() => {
            const api = apiRef.current;
            if (!api) return;
            const zoom = api.getAppState().zoom.value;
            api.updateScene({ appState: { zoom: { value: zoom / 1.25 } } });
          }}
        >
          <ZoomOut size={20} />
        </button>
        <button
          className={css.excalidrawActionButton}
          title="Fit to Content"
          type="button"
          onClick={() => apiRef.current?.scrollToContent()}
        >
          <ScanSearch size={20} />
        </button>
        <button
          className={css.excalidrawActionButton}
          title="Expand"
          type="button"
          onClick={handleExpand}
        >
          <Maximize2 size={20} />
        </button>
      </div>
    </div>
  );
};

class ExcalidrawErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
