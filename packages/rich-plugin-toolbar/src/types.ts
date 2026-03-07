import type { createTooltipHandle } from '@haklex/rich-editor-ui';

export interface ToolbarTooltipPayload {
  shortcut?: string;
  title: string;
}

export type ToolbarTooltipHandle = ReturnType<typeof createTooltipHandle<ToolbarTooltipPayload>>;
