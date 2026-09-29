import type { ExcalidrawImperativeAPI, ExcalidrawProps } from '@excalidraw/excalidraw/types';

export const readonlyUIOptions: ExcalidrawProps['UIOptions'] = {
  canvasActions: {
    toggleTheme: false,
    export: false,
    saveAsImage: false,
    loadScene: false,
    changeViewBackgroundColor: false,
  },
};

export const fitSceneToViewport = (api: ExcalidrawImperativeAPI) =>
  api.scrollToContent(undefined, { fitToViewport: true, viewportZoomFactor: 0.9, maxZoom: 1 });

// excalidrawAPI fires before the scene is loaded and the canvas is measured; fitting then is a no-op.
export const fitSceneOnReady = (api: ExcalidrawImperativeAPI) => {
  const isReady = () => api.getAppState().width > 0 && api.getSceneElements().length > 0;
  if (isReady()) {
    fitSceneToViewport(api);
    return;
  }
  const unsubscribe = api.onChange(() => {
    if (!isReady()) return;
    unsubscribe();
    fitSceneToViewport(api);
  });
};
