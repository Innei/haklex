export { EditorBlockContext } from './context/EditorBlockContext';
export type { SerializedBlock } from './virtualization/document';
export {
  type BlockMetrics,
  collapsedMargin,
  estimateHeight,
  HeightIndex,
  occupiedHeight,
  type Slot,
  TypePool,
} from './virtualization/layout';
export { PreserveNodeManager } from './virtualization/preserve';
export {
  canvas as recyclerCanvas,
  editable as recyclerContent,
  slot as recyclerSlot,
} from './virtualization/style.css';
export type { EditorVirtualizationOptions as RecyclerOptions } from './virtualization/types';
export { resolveScrollContainer } from './virtualization/viewport';
