import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

// Re-export common node types (defined inline to avoid Lexical package import issues)
type SerializedTextNode = SerializedLexicalNode & {
  type: 'text';
  text: string;
  format: number;
  detail: number;
  mode: 'normal' | 'token' | 'segmented';
  style: string;
};

type SerializedParagraphNode = SerializedLexicalNode & {
  type: 'paragraph';
  children: SerializedLexicalNode[];
  direction: 'ltr' | 'rtl' | null;
  format: string;
  indent: number;
  textFormat: number;
  textStyle: string;
};

type SerializedHeadingNode = SerializedLexicalNode & {
  type: 'heading';
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: SerializedLexicalNode[];
  direction: 'ltr' | 'rtl' | null;
  format: string;
  indent: number;
};

type SerializedQuoteNode = SerializedLexicalNode & {
  type: 'quote';
  children: SerializedLexicalNode[];
  direction: 'ltr' | 'rtl' | null;
  format: string;
  indent: number;
};

type SerializedListNode = SerializedLexicalNode & {
  type: 'list';
  listType: 'bullet' | 'number';
  start: number;
  tag: 'ul' | 'ol';
  children: SerializedLexicalNode[];
  direction: 'ltr' | 'rtl' | null;
  format: string;
  indent: number;
};

type SerializedListItemNode = SerializedLexicalNode & {
  type: 'listitem';
  value: number;
  children: SerializedLexicalNode[];
  direction: 'ltr' | 'rtl' | null;
  format: string;
  indent: number;
};

type SerializedLinkNode = SerializedLexicalNode & {
  type: 'link';
  url: string;
  rel: string | null;
  target: string | null;
  title: string | null;
  children: SerializedLexicalNode[];
  direction: 'ltr' | 'rtl' | null;
  format: string;
  indent: number;
};

// Text formats (bitwise flags)
export const FORMAT_BOLD = 1;
export const FORMAT_ITALIC = 1 << 1;
export const FORMAT_STRIKETHROUGH = 1 << 2;
export const FORMAT_UNDERLINE = 1 << 3;
export const FORMAT_CODE = 1 << 4;
export const FORMAT_SUBSCRIPT = 1 << 5;
export const FORMAT_SUPERSCRIPT = 1 << 6;
export const FORMAT_HIGHLIGHT = 1 << 7;

export function text(content: string, format = 0): SerializedTextNode {
  return {
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    text: content,
    type: 'text',
    version: 1,
  };
}

export function paragraph(...children: SerializedLexicalNode[]): SerializedParagraphNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
    textFormat: 0,
    textStyle: '',
  };
}

export function heading(
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  ...children: SerializedLexicalNode[]
): SerializedHeadingNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    tag,
    type: 'heading',
    version: 1,
  };
}

export function quote(...children: SerializedLexicalNode[]): SerializedQuoteNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'quote',
    version: 1,
  };
}

export function list(
  listType: 'bullet' | 'number',
  ...children: SerializedLexicalNode[]
): SerializedListNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    listType,
    start: 1,
    tag: listType === 'bullet' ? 'ul' : 'ol',
    type: 'list',
    version: 1,
  };
}

export function listItem(...children: SerializedLexicalNode[]): SerializedListItemNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'listitem',
    version: 1,
    value: 1,
  };
}

export function link(url: string, ...children: SerializedLexicalNode[]): SerializedLinkNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'link',
    version: 1,
    rel: null,
    target: null,
    title: null,
    url,
  };
}

export function horizontalRule() {
  return {
    type: 'horizontalrule',
    version: 1,
  };
}

export function lineBreak() {
  return {
    type: 'linebreak',
    version: 1,
  };
}

export function table(...children: SerializedLexicalNode[]) {
  return {
    children,
    direction: 'ltr' as const,
    format: '',
    indent: 0,
    type: 'table',
    version: 1,
  };
}

export function tableRow(...children: SerializedLexicalNode[]) {
  return {
    children,
    direction: 'ltr' as const,
    format: '',
    indent: 0,
    type: 'tablerow',
    version: 1,
  };
}

export function tableCell(headerState: number, ...children: SerializedLexicalNode[]) {
  return {
    children,
    colSpan: 1,
    direction: 'ltr' as const,
    format: '',
    headerState,
    indent: 0,
    type: 'tablecell',
    version: 1,
    width: null,
  };
}

export function alertQuote(alertType: string, ...children: SerializedLexicalNode[]) {
  return {
    type: 'alert-quote',
    alertType,
    content: {
      root: {
        children,
        direction: 'ltr' as const,
        format: '',
        indent: 0,
        type: 'root' as const,
        version: 1,
      },
    },
    version: 1,
  };
}

export function image(payload: {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  caption?: string;
  thumbhash?: string;
  accent?: string;
}) {
  return {
    type: 'image',
    src: payload.src,
    altText: payload.altText,
    width: payload.width,
    height: payload.height,
    caption: payload.caption,
    thumbhash: payload.thumbhash,
    accent: payload.accent,
    version: 1,
  };
}

export function video(payload: { src: string; poster?: string; width?: number; height?: number }) {
  return {
    type: 'video',
    src: payload.src,
    poster: payload.poster,
    width: payload.width,
    height: payload.height,
    version: 1,
  };
}

export function mermaid(diagram: string) {
  return {
    type: 'mermaid',
    diagram,
    version: 1,
  };
}

export function katexBlock(equation: string) {
  return {
    type: 'katex-block',
    equation,
    version: 1,
  };
}

export function katexInline(equation: string) {
  return {
    type: 'katex-inline',
    equation,
    version: 1,
  };
}

export function details(summary: string, open: boolean, ...children: SerializedLexicalNode[]) {
  return {
    type: 'details',
    summary,
    open,
    children,
    direction: 'ltr' as const,
    format: '',
    indent: 0,
    version: 1,
  };
}

export function spoiler(...children: SerializedLexicalNode[]) {
  return {
    type: 'spoiler',
    children,
    direction: 'ltr' as const,
    format: '',
    indent: 0,
    version: 1,
  };
}

export function ruby(base: string, reading: string) {
  return {
    type: 'ruby',
    reading,
    children: [text(base)],
    direction: 'ltr' as const,
    format: '',
    indent: 0,
    version: 1,
  };
}

export function footnote(identifier: string) {
  return {
    type: 'footnote',
    identifier,
    version: 1,
  };
}

export function footnoteSection(definitions: Record<string, string>) {
  return {
    type: 'footnote-section',
    definitions,
    version: 1,
  };
}

export function mention(platform: string, handle: string, displayName?: string) {
  return {
    type: 'mention',
    platform,
    handle,
    ...(displayName ? { displayName } : {}),
    version: 1,
  };
}

export function banner(
  bannerType: 'note' | 'tip' | 'important' | 'warning' | 'caution',
  ...children: SerializedLexicalNode[]
) {
  return {
    type: 'banner',
    bannerType,
    content: {
      root: {
        children,
        direction: 'ltr' as const,
        format: '',
        indent: 0,
        type: 'root' as const,
        version: 1,
      },
    },
    version: 1,
  };
}

export function excalidraw(snapshot: string) {
  return {
    type: 'excalidraw',
    snapshot,
    version: 1,
  };
}

export function nestedDoc(...children: SerializedLexicalNode[]) {
  return {
    type: 'nested-doc',
    content: {
      root: {
        children,
        direction: 'ltr' as const,
        format: '',
        indent: 0,
        type: 'root' as const,
        version: 1,
      },
    },
    version: 1,
  };
}

export function tag(text: string) {
  return {
    type: 'tag',
    text,
    version: 1,
  };
}

export function poll(payload: {
  pollId: string;
  question: string;
  options: Array<{ id: string; label: string }>;
  mode: 'single' | 'multiple';
  closeAt?: string;
  showResults?: 'always' | 'after-vote' | 'after-close';
}) {
  return {
    type: 'poll',
    pollId: payload.pollId,
    question: payload.question,
    options: payload.options,
    mode: payload.mode,
    ...(payload.closeAt ? { closeAt: payload.closeAt } : {}),
    ...(payload.showResults ? { showResults: payload.showResults } : {}),
    version: 1,
  };
}

export function chat(payload: {
  variant: 'user-agent' | 'user-user';
  participants: Array<{ id: string; kind: 'user' | 'agent'; name?: string; avatar?: string }>;
  messages: Array<{ id: string; participantId: string; content: string }>;
}) {
  return {
    type: 'chat',
    version: 1,
    variant: payload.variant,
    participants: payload.participants,
    messages: payload.messages,
  };
}

export function doc(...children: SerializedLexicalNode[]): SerializedEditorState {
  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}
