export interface Transform {
  s: number;
  tx: number;
  ty: number;
}

export const MIN_SCALE = 0.05;
export const MAX_SCALE = 16;

export const fromViewport = (v: { scrollX: number; scrollY: number; zoom: number }): Transform => ({
  s: v.zoom,
  tx: v.scrollX * v.zoom,
  ty: v.scrollY * v.zoom,
});

export const toViewport = (t: Transform) => ({
  scrollX: t.tx / t.s,
  scrollY: t.ty / t.s,
  zoom: t.s,
});
