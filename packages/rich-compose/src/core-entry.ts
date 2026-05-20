export { composeRenderer } from './core/compose';
export { dedupNodes, mergeModules } from './core/dedup';
export { wrapLazy } from './core/lazy';
export type {
  ComposeRendererOptions,
  RendererKey,
  RichRendererBaseProps,
  RichRendererModule,
} from './core/types';
export type { BuiltinNodeRenderer, RichRendererProps } from './static-renderer';
export { RichRenderer } from './static-renderer';
