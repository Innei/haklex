import { useColorScheme } from '@haklex/rich-editor/static';
import { Component, type FC, type ReactNode, useCallback, useMemo } from 'react';

import {
  ExcalidrawEmptyState,
  ExcalidrawErrorState,
  ExcalidrawLoadingState,
} from './ExcalidrawFrameStates';
import { InteractiveScene } from './scene/InteractiveScene';
import { countElements, toScene } from './scene/normalize';
import * as css from './styles.css';
import { useExcalidrawData } from './useExcalidrawData';
import { useExcalidrawFont } from './useExcalidrawFont';

export interface ExcalidrawExpandPayload {
  content: ReactNode;
  elementCount?: number;
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
  const { snapshot: data, loading, error, retry, retryable } = useExcalidrawData(snapshot);
  const scene = useMemo(() => toScene(data), [data]);
  useExcalidrawFont();

  const handleExpand = useCallback(
    (target: HTMLElement) => {
      if (!onExpand || !scene) return;
      onExpand({
        content: <InteractiveScene mode="fullscreen" scene={scene} theme={theme} />,
        elementCount: countElements(scene),
        target,
        theme,
      });
    },
    [onExpand, scene, theme],
  );

  let body: ReactNode;
  if (loading) body = <ExcalidrawLoadingState />;
  else if (error)
    body = <ExcalidrawErrorState message={error} onRetry={retryable ? retry : undefined} />;
  else if (!data) body = <ExcalidrawEmptyState />;
  else if (!scene) body = <ExcalidrawErrorState message="Invalid whiteboard data" />;
  else if (countElements(scene) === 0) body = <ExcalidrawEmptyState />;
  else {
    body = (
      <ExcalidrawErrorBoundary
        fallback={<ExcalidrawErrorState message="Failed to render whiteboard" />}
      >
        <InteractiveScene
          scene={scene}
          theme={theme}
          onExpand={onExpand ? handleExpand : undefined}
        />
      </ExcalidrawErrorBoundary>
    );
  }

  return (
    <div className={css.excalidrawStaticContainer} data-theme={theme}>
      {body}
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
