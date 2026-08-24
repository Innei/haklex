/**
 * Slot key constants for the built-in renderers in `RendererConfig`.
 *
 * Use these instead of string literals when wiring decorators or composing
 * override modules so renames stay searchable and typos surface as compiler
 * errors. Each constant is `as const` so its type is the literal key, making
 * it safe for `keyof RendererConfig` indexing.
 *
 * Extension packages (`@haklex/rich-ext-*`) export their own slot constants
 * from a sibling `slot.ts` file; downstream apps should follow the same
 * pattern when adding bespoke slots via module augmentation.
 */
export const ALERT_NODE_KEY = 'Alert' as const;
export const BANNER_NODE_KEY = 'Banner' as const;
export const CODE_BLOCK_NODE_KEY = 'CodeBlock' as const;
export const FILE_NODE_KEY = 'File' as const;
export const FOOTNOTE_NODE_KEY = 'Footnote' as const;
export const FOOTNOTE_SECTION_NODE_KEY = 'FootnoteSection' as const;
export const IMAGE_NODE_KEY = 'Image' as const;
export const KATEX_NODE_KEY = 'KaTeX' as const;
export const LINK_CARD_NODE_KEY = 'LinkCard' as const;
export const MENTION_NODE_KEY = 'Mention' as const;
export const MERMAID_NODE_KEY = 'Mermaid' as const;
export const RUBY_NODE_KEY = 'Ruby' as const;
export const TAG_NODE_KEY = 'Tag' as const;
export const VIDEO_NODE_KEY = 'Video' as const;
