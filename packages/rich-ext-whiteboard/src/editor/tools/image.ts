import type { ToolHandler } from './types';

export function createImageTool(): ToolHandler {
  return {
    onPointerDown(ctx, e) {
      ctx.requestImage?.(e.scene);
    },
    onPointerMove() {},
    onPointerUp() {},
  };
}
