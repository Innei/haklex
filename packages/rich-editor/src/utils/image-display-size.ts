export type ImageDisplayMode = 'auto' | 'percent' | 'fixed-width' | 'fixed-height';

export type ImageDisplayFields = {
  displayWidth?: number;
  fixedWidth?: number;
  fixedHeight?: number;
};

export type ImageDisplaySize =
  | { mode: 'auto' }
  | { mode: 'percent'; value: number }
  | { mode: 'fixed-width'; px: number }
  | { mode: 'fixed-height'; px: number };

export type ImageDisplayConvertContext = {
  containerWidth: number;
  intrinsicHeight?: number;
  intrinsicWidth?: number;
  renderedHeight?: number;
  renderedWidth?: number;
};

export function sanitizeImageDisplayWidth(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.round(Math.min(100, Math.max(10, value)));
}

export function sanitizeImageFixedPx(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return undefined;
  return Math.round(value);
}

export function resolveImageDisplaySize(fields: ImageDisplayFields): ImageDisplaySize {
  const displayWidth = sanitizeImageDisplayWidth(fields.displayWidth);
  if (displayWidth !== undefined) return { mode: 'percent', value: displayWidth };
  const fixedWidth = sanitizeImageFixedPx(fields.fixedWidth);
  if (fixedWidth !== undefined) return { mode: 'fixed-width', px: fixedWidth };
  const fixedHeight = sanitizeImageFixedPx(fields.fixedHeight);
  if (fixedHeight !== undefined) return { mode: 'fixed-height', px: fixedHeight };
  return { mode: 'auto' };
}

export function imageDisplayFieldsFromSize(size: ImageDisplaySize): ImageDisplayFields {
  switch (size.mode) {
    case 'percent': {
      return { displayWidth: size.value };
    }
    case 'fixed-width': {
      return { fixedWidth: size.px };
    }
    case 'fixed-height': {
      return { fixedHeight: size.px };
    }
    default: {
      return {};
    }
  }
}

function aspectRatio(ctx: ImageDisplayConvertContext): number | undefined {
  const width = ctx.intrinsicWidth;
  const height = ctx.intrinsicHeight;
  if (!width || !height || width <= 0 || height <= 0) return undefined;
  return width / height;
}

function computedWidthPx(
  size: ImageDisplaySize,
  ctx: ImageDisplayConvertContext,
): number | undefined {
  switch (size.mode) {
    case 'percent': {
      return ctx.containerWidth > 0 ? (ctx.containerWidth * size.value) / 100 : undefined;
    }
    case 'fixed-width': {
      return size.px;
    }
    case 'fixed-height': {
      const ratio = aspectRatio(ctx);
      return ratio ? size.px * ratio : undefined;
    }
    case 'auto': {
      return ctx.intrinsicWidth;
    }
  }
}

function computedHeightPx(
  size: ImageDisplaySize,
  ctx: ImageDisplayConvertContext,
): number | undefined {
  if (size.mode === 'fixed-height') return size.px;
  const widthPx = computedWidthPx(size, ctx);
  const ratio = aspectRatio(ctx);
  if (!widthPx || !ratio) return undefined;
  return widthPx / ratio;
}

export function computeImageDisplayPixels(
  size: ImageDisplaySize,
  ctx: ImageDisplayConvertContext,
): { heightPx?: number; widthPx?: number } {
  const useRendered = size.mode === 'auto';
  return {
    widthPx: sanitizeImageFixedPx(
      useRendered ? (ctx.renderedWidth ?? computedWidthPx(size, ctx)) : computedWidthPx(size, ctx),
    ),
    heightPx: sanitizeImageFixedPx(
      useRendered
        ? (ctx.renderedHeight ?? computedHeightPx(size, ctx))
        : computedHeightPx(size, ctx),
    ),
  };
}

export function convertImageDisplaySize(
  from: ImageDisplaySize,
  to: ImageDisplayMode,
  ctx: ImageDisplayConvertContext,
): ImageDisplaySize {
  if (to === 'auto') return { mode: 'auto' };
  if (from.mode === to) return from;

  const pixels = computeImageDisplayPixels(from, ctx);

  if (to === 'percent') {
    if (!pixels.widthPx || ctx.containerWidth <= 0) return from;
    const value = sanitizeImageDisplayWidth((pixels.widthPx / ctx.containerWidth) * 100);
    return value === undefined ? from : { mode: 'percent', value };
  }

  if (to === 'fixed-width') {
    const px = sanitizeImageFixedPx(pixels.widthPx);
    return px === undefined ? from : { mode: 'fixed-width', px };
  }

  const px = sanitizeImageFixedPx(pixels.heightPx);
  return px === undefined ? from : { mode: 'fixed-height', px };
}

export function imageDisplayCssVars(size: ImageDisplaySize): Record<string, string> | undefined {
  switch (size.mode) {
    case 'percent': {
      return { '--rich-image-display-width': `${size.value}%` };
    }
    case 'fixed-width': {
      return { '--rich-image-display-width': `${size.px}px` };
    }
    case 'fixed-height': {
      return { '--rich-image-display-height': `${size.px}px` };
    }
    default: {
      return undefined;
    }
  }
}

export function imageDisplayDataAttr(size: ImageDisplaySize): string | undefined {
  return size.mode === 'auto' ? undefined : size.mode;
}

export function imageDisplaySizeAfterResize(
  mode: ImageDisplayMode,
  nextWidth: number,
  nextHeight: number,
  containerWidth: number,
): ImageDisplaySize {
  if (mode === 'fixed-width') {
    const px = sanitizeImageFixedPx(nextWidth);
    return px === undefined ? { mode: 'auto' } : { mode: 'fixed-width', px };
  }
  if (mode === 'fixed-height') {
    const px = sanitizeImageFixedPx(nextHeight);
    return px === undefined ? { mode: 'auto' } : { mode: 'fixed-height', px };
  }
  const value = sanitizeImageDisplayWidth((nextWidth / containerWidth) * 100) ?? 100;
  return { mode: 'percent', value };
}
