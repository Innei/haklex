import type { RefObject } from 'react';

import type { SerializedBlock } from './document';

export interface EditorVirtualizationOptions {
  estimateBlockHeight?: (block: SerializedBlock, width: number) => number;
  /** Extra rendered pixels before and after the viewport. */
  overscan?: number;
  /** Maximum offscreen nodes kept mounted. Zero always uses state restoration. Defaults to 32. */
  preserveCapacity?: number;
  /** The scrolling viewport, not its content. Defaults to the nearest scrollable ancestor. */
  scrollContainer?: HTMLElement | RefObject<HTMLElement | null> | (() => HTMLElement | null);
}
export type EditorVirtualization = boolean | EditorVirtualizationOptions;
