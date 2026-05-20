import type { ExcalidrawImperativeAPI, ExcalidrawProps } from '@excalidraw/excalidraw/types';
import { useColorScheme } from '@haklex/rich-editor';
import { Maximize2, ScanSearch, ZoomIn, ZoomOut } from 'lucide-react';
import {
  Component,
  type ComponentType,
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { readonlyUIOptions } from './constants';
import * as css from './styles.css';
import { useExcalidrawData } from './useExcalidrawData';

export interface ExcalidrawExpandPayload {
  content: ReactNode;
  target: HTMLElement;
  theme: 'light' | 'dark';
}

export type OnExcalidrawExpand = (payload: ExcalidrawExpandPayload) => void;

export interface ExcalidrawStaticRendererProps {
  onExpand?: OnExcalidrawExpand;
  snapshot: string;
}

export const ExcalidrawDisplayRenderer: FC<ExcalidrawStaticRendererProps> = ({
  onExpand,
  snapshot,
}) => {
  const theme = useColorScheme();
  return <ExcalidrawStaticCanvas snapshot={snapshot} theme={theme} onExpand={onExpand} />;
};

const ExcalidrawStaticCanvas: FC<{
  onExpand?: OnExcalidrawExpand;
  snapshot: string;
  theme: 'light' | 'dark';
}> = ({ onExpand, snapshot, theme }) => {
  const { snapshot: data, loading: dataLoading, error: dataError } = useExcalidrawData(snapshot);
  const [ExcalidrawComponent, setExcalidrawComponent] =
    useState<ComponentType<ExcalidrawProps> | null>(null);
  const [libLoading, setLibLoading] = useState(true);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    Promise.all([import('@excalidraw/excalidraw'), import('@excalidraw/excalidraw/index.css')])
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

  const handleExpand = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!onExpand || !ExcalidrawComponent || !data) return;
      const content = (
        <ExcalidrawComponent
          viewModeEnabled
          zenModeEnabled
          UIOptions={readonlyUIOptions}
          initialData={data}
          theme={theme}
          excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
            setTimeout(() => api.scrollToContent(), 100);
          }}
        />
      );
      onExpand({ content, target: e.currentTarget, theme });
    },
    [onExpand, ExcalidrawComponent, data, theme],
  );

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

  const canExpand = Boolean(onExpand);

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
        {canExpand && (
          <button
            className={css.excalidrawActionButton}
            title="Expand"
            type="button"
            onClick={handleExpand}
          >
            <Maximize2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

class ExcalidrawErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
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
