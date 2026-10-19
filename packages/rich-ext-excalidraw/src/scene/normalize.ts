import type { ExcalidrawScene } from './types';

export function toScene(data: Record<string, any> | undefined): ExcalidrawScene | null {
  if (!data) return null;
  if (typeof data !== 'object') return null;
  if (!Array.isArray(data.elements) && data.data !== undefined) return toScene(data.data);
  return {
    type: 'excalidraw',
    elements: Array.isArray(data.elements) ? data.elements : [],
    appState: data.appState ?? {},
    files: data.files ?? {},
  };
}

export function countElements(scene: ExcalidrawScene): number {
  return scene.elements.filter((el) => !el.isDeleted).length;
}
