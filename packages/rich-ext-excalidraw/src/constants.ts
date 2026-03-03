import type { ExcalidrawProps } from '@excalidraw/excalidraw/types/types'

export const readonlyUIOptions: ExcalidrawProps['UIOptions'] = {
  canvasActions: {
    toggleTheme: false,
    export: false,
    saveAsImage: false,
    loadScene: false,
    changeViewBackgroundColor: false,
  },
}
