import { useColorScheme } from '@haklex/rich-editor/static';
import { Component, type FC, type ReactNode, useCallback, useMemo } from 'react';

import { InteractiveScene } from './scene/InteractiveScene';
import { countElements, toScene } from './scene/normalize';
import * as css from './styles.css';
import { useWhiteboardData } from './useWhiteboardData';
import { useWhiteboardFont } from './useWhiteboardFont';
import {
  WhiteboardEmptyState,
  WhiteboardErrorState,
  WhiteboardLoadingState,
} from './WhiteboardFrameStates';

export interface WhiteboardExpandPayload {
  content: ReactNode;
  elementCount?: number;
  target: HTMLElement;
  theme: 'light' | 'dark';
}

export type OnWhiteboardExpand = (payload: WhiteboardExpandPayload) => void;

export interface WhiteboardStaticRendererProps {
  onExpand?: OnWhiteboardExpand;
  snapshot: string;
}

export const WhiteboardDisplayRenderer: FC<WhiteboardStaticRendererProps> = ({
  onExpand,
  snapshot,
}) => {
  const theme = useColorScheme();
  const { snapshot: data, loading, error, retry, retryable } = useWhiteboardData(snapshot);
  const scene = useMemo(() => toScene(data), [data]);
  useWhiteboardFont();

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
  if (loading) body = <WhiteboardLoadingState />;
  else if (error)
    body = <WhiteboardErrorState message={error} onRetry={retryable ? retry : undefined} />;
  else if (!data) body = <WhiteboardEmptyState />;
  else if (!scene) body = <WhiteboardErrorState message="Invalid whiteboard data" />;
  else if (countElements(scene) === 0) body = <WhiteboardEmptyState />;
  else {
    body = (
      <WhiteboardErrorBoundary
        fallback={<WhiteboardErrorState message="Failed to render whiteboard" />}
      >
        <InteractiveScene
          scene={scene}
          theme={theme}
          onExpand={onExpand ? handleExpand : undefined}
        />
      </WhiteboardErrorBoundary>
    );
  }

  return (
    <div className={css.whiteboardStaticContainer} data-theme={theme}>
      {body}
    </div>
  );
};

class WhiteboardErrorBoundary extends Component<
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
