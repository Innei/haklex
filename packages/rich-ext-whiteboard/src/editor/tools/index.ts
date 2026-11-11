import type { ToolType } from '../types';
import { createCardTool } from './card';
import { createEraserTool } from './eraser';
import { createFreedrawTool } from './freedraw';
import { createHandTool } from './hand';
import { createImageTool } from './image';
import { createLinearTool } from './linear';
import { createSelectionTool } from './selection';
import { createShapeTool } from './shape';
import { createTextTool } from './text';
import type { ToolHandler } from './types';

export type ToolHandlers = Partial<Record<ToolType, ToolHandler>> & {
  hand: ToolHandler;
  selection: ToolHandler;
};

export function createToolHandlers(): ToolHandlers {
  return {
    selection: createSelectionTool(),
    hand: createHandTool(),
    rectangle: createShapeTool('rectangle'),
    diamond: createShapeTool('diamond'),
    ellipse: createShapeTool('ellipse'),
    frame: createShapeTool('frame'),
    arrow: createLinearTool('arrow'),
    line: createLinearTool('line'),
    freedraw: createFreedrawTool(),
    eraser: createEraserTool(),
    text: createTextTool(),
    card: createCardTool(),
    image: createImageTool(),
  };
}

export function getToolHandler(handlers: ToolHandlers, tool: ToolType): ToolHandler {
  return handlers[tool] ?? handlers.selection;
}
