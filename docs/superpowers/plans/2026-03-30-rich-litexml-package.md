# @haklex/rich-litexml + Agent XML Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `@haklex/rich-litexml` package for bidirectional Lexical SerializedNode JSON <-> XML conversion with a plugin registration system, then integrate into `@haklex/rich-agent-core` so the AI agent reads/writes XML instead of raw Lexical JSON.

**Architecture:** Pure-function conversion operating on `SerializedLexicalNode` JSON — no Lexical editor instance required. A `LitexmlRegistry` holds writer (JSON→XML) and reader (XML→JSON) functions keyed by node type / XML tag. Built-in and custom node converters are registered via `createDefaultRegistry()`. The `rich-agent-core` package consumes this for document context serialization and tool parameter deserialization.

**Tech Stack:** TypeScript 5.9, Vite 7, vitest, linkedom (XML parsing, works in Node + browser), `@haklex/rich-litexml` (new package)

---

### Task 1: Package Scaffolding

**Files:**

- Create: `packages/rich-litexml/package.json`
- Create: `packages/rich-litexml/tsconfig.json`
- Create: `packages/rich-litexml/vite.config.ts`
- Create: `packages/rich-litexml/src/index.ts` (empty placeholder)
- Create: `packages/rich-litexml/CLAUDE.md`

- [ ] **Step 1: Create package.json**

```json
{
  "dependencies": {
    "lexical": "^0.42.0",
    "linkedom": "^0.18.9"
  },
  "description": "Bidirectional Lexical SerializedNode <-> XML conversion with plugin registry",
  "devDependencies": {
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4"
  },
  "exports": {
    ".": "./src/index.ts"
  },
  "files": ["dist"],
  "license": "MIT",
  "main": "./src/index.ts",
  "name": "@haklex/rich-litexml",
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "import": "./dist/index.mjs",
        "types": "./dist/index.d.ts"
      }
    },
    "main": "./dist/index.mjs",
    "types": "./dist/index.d.ts"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/Innei/haklex.git",
    "directory": "packages/rich-litexml"
  },
  "scripts": {
    "build": "vite build",
    "dev:build": "vite build --watch"
  },
  "type": "module",
  "version": "0.0.90"
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["ES2021", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```ts
import { createViteConfig } from '../../vite.shared';

export default createViteConfig();
```

- [ ] **Step 4: Create empty src/index.ts**

```ts
export {};
```

- [ ] **Step 5: Create CLAUDE.md**

```markdown
# @haklex/rich-litexml

Bidirectional conversion between Lexical SerializedNode JSON and XML (lite XML format).
Pure functions — no Lexical editor instance required.

## Adding a New Node

When a new Lexical node type is created anywhere in haklex:

1. Add a writer in `src/writers/` — maps SerializedNode JSON → XML element
2. Add a reader in `src/readers/` — maps XML element → SerializedNode JSON
3. Register both in `createDefaultRegistry()` in `src/default-registry.ts`
4. Add a roundtrip test in `tests/`

### Writer/Reader Patterns by Node Category

- **Simple attributes** (image, video, link-card, embed): self-closing XML tag with attributes from JSON fields
- **Text content** (code-block, mermaid, katex): XML tag wrapping text content (e.g. `<codeblock lang="ts">code</codeblock>`)
- **Nested EditorState** (alert-quote, banner): XML tag wrapping recursively serialized children from the `content` field
- **Element with children** (details, spoiler): XML tag wrapping inline or block children
- **Inline** (mention, tag, footnote): inline XML tag within paragraph content

### Fallback

Unregistered nodes serialize as `<node type="..." data='{...}' />`. This preserves data
but is opaque to AI agents. Always register for best agent experience.
```

- [ ] **Step 6: Install deps and verify**

Run: `cd /Users/innei/git/innei-repo/haklex && pnpm install`
Expected: Installs without error, `packages/rich-litexml/node_modules` linked.

- [ ] **Step 7: Commit**

```bash
git add packages/rich-litexml/
git commit -m "chore: scaffold @haklex/rich-litexml package"
```

---

### Task 2: Types & Registry

**Files:**

- Create: `packages/rich-litexml/src/types.ts`
- Create: `packages/rich-litexml/src/registry.ts`
- Create: `packages/rich-litexml/tests/registry.test.ts`

- [ ] **Step 1: Write failing test for registry**

```ts
// tests/registry.test.ts
import { describe, expect, it } from 'vitest';
import { LitexmlRegistry } from '../src/registry';

describe('LitexmlRegistry', () => {
  it('registers and retrieves a writer', () => {
    const registry = new LitexmlRegistry();
    const writer = () => false as const;
    registry.registerWriter('paragraph', writer);
    expect(registry.getWriter('paragraph')).toBe(writer);
  });

  it('registers and retrieves a reader', () => {
    const registry = new LitexmlRegistry();
    const reader = () => false as const;
    registry.registerReader('p', reader);
    expect(registry.getReader('p')).toBe(reader);
  });

  it('returns undefined for unregistered types', () => {
    const registry = new LitexmlRegistry();
    expect(registry.getWriter('unknown')).toBeUndefined();
    expect(registry.getReader('unknown')).toBeUndefined();
  });

  it('reader lookup is case-insensitive', () => {
    const registry = new LitexmlRegistry();
    const reader = () => false as const;
    registry.registerReader('P', reader);
    expect(registry.getReader('p')).toBe(reader);
    expect(registry.getReader('P')).toBe(reader);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-litexml/tests/registry.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create types.ts**

```ts
// src/types.ts
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

/** Structured XML element for serializer output */
export interface XmlElement {
  tag: string;
  attrs?: Record<string, string>;
  children?: XmlContent[];
  selfClosing?: boolean;
}

/** XML content: either a structured element or raw text (will be escaped) */
export type XmlContent = XmlElement | string;

/** Context provided to writer functions */
export interface WriterContext {
  /** Serialize an array of child nodes into XML content */
  serializeChildren(children: SerializedLexicalNode[]): XmlContent[];
  /** Serialize a single node into XML content */
  serializeNode(node: SerializedLexicalNode): XmlContent | XmlContent[];
  /** Serialize a nested SerializedEditorState's root children into XmlContent[] (for container nodes like alert-quote, banner) */
  serializeNestedState(state: SerializedEditorState): XmlContent[];
}

/** Context provided to reader functions */
export interface ReaderContext {
  /** Parse all child elements of a DOM element into serialized nodes */
  parseChildren(element: Element): SerializedLexicalNode[];
  /** Parse a nested XML string into SerializedEditorState (for container nodes) */
  parseNestedState(xml: string): SerializedEditorState;
}

/**
 * Writer: converts a SerializedLexicalNode to XML representation.
 * Return `false` to indicate this writer does not handle the node.
 */
export type XmlWriterFn = (
  node: SerializedLexicalNode,
  ctx: WriterContext,
) => XmlContent | XmlContent[] | false;

/**
 * Reader: converts a DOM Element to SerializedLexicalNode(s).
 * Return `false` to indicate this reader does not handle the element.
 */
export type XmlReaderFn = (
  element: Element,
  ctx: ReaderContext,
) => SerializedLexicalNode | SerializedLexicalNode[] | false;
```

- [ ] **Step 4: Create registry.ts**

```ts
// src/registry.ts
import type { XmlReaderFn, XmlWriterFn } from './types';

export class LitexmlRegistry {
  private writers = new Map<string, XmlWriterFn>();
  private readers = new Map<string, XmlReaderFn>();

  registerWriter(nodeType: string, writer: XmlWriterFn): void {
    this.writers.set(nodeType, writer);
  }

  registerReader(tagName: string, reader: XmlReaderFn): void {
    this.readers.set(tagName.toLowerCase(), reader);
  }

  getWriter(nodeType: string): XmlWriterFn | undefined {
    return this.writers.get(nodeType);
  }

  getReader(tagName: string): XmlReaderFn | undefined {
    return this.readers.get(tagName.toLowerCase());
  }
}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-litexml/tests/registry.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add packages/rich-litexml/src/types.ts packages/rich-litexml/src/registry.ts packages/rich-litexml/tests/registry.test.ts
git commit -m "feat(rich-litexml): add types and LitexmlRegistry"
```

---

### Task 3: XML Utilities & Text Format

**Files:**

- Create: `packages/rich-litexml/src/xml-utils.ts`
- Create: `packages/rich-litexml/src/text-format.ts`
- Create: `packages/rich-litexml/tests/text-format.test.ts`

- [ ] **Step 1: Write text-format tests**

```ts
// tests/text-format.test.ts
import { describe, expect, it } from 'vitest';
import { wrapWithFormatTags, FORMAT_TAG_TO_BIT } from '../src/text-format';

describe('wrapWithFormatTags', () => {
  it('returns plain text for format 0', () => {
    expect(wrapWithFormatTags('hello', 0)).toEqual(['hello']);
  });

  it('wraps bold (format=1)', () => {
    const result = wrapWithFormatTags('bold', 1);
    expect(result).toEqual([{ tag: 'b', children: ['bold'] }]);
  });

  it('wraps bold+italic (format=3)', () => {
    const result = wrapWithFormatTags('text', 3);
    // outermost bold, innermost italic
    expect(result).toEqual([{ tag: 'b', children: [{ tag: 'i', children: ['text'] }] }]);
  });

  it('wraps all format bits', () => {
    // bold(1) + italic(2) + code(16) = 19
    const result = wrapWithFormatTags('code', 19);
    expect(result).toEqual([
      { tag: 'b', children: [{ tag: 'i', children: [{ tag: 'code', children: ['code'] }] }] },
    ]);
  });
});

describe('FORMAT_TAG_TO_BIT', () => {
  it('maps tag names to bit values', () => {
    expect(FORMAT_TAG_TO_BIT.b).toBe(1);
    expect(FORMAT_TAG_TO_BIT.strong).toBe(1);
    expect(FORMAT_TAG_TO_BIT.i).toBe(2);
    expect(FORMAT_TAG_TO_BIT.em).toBe(2);
    expect(FORMAT_TAG_TO_BIT.s).toBe(4);
    expect(FORMAT_TAG_TO_BIT.u).toBe(8);
    expect(FORMAT_TAG_TO_BIT.code).toBe(16);
    expect(FORMAT_TAG_TO_BIT.sub).toBe(32);
    expect(FORMAT_TAG_TO_BIT.sup).toBe(64);
    expect(FORMAT_TAG_TO_BIT.mark).toBe(128);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-litexml/tests/text-format.test.ts`
Expected: FAIL

- [ ] **Step 3: Create text-format.ts**

```ts
// src/text-format.ts
import type { XmlContent, XmlElement } from './types';

/** Lexical text format bitmask values */
export const FORMAT_BITS = {
  bold: 1,
  italic: 2,
  strikethrough: 4,
  underline: 8,
  code: 16,
  subscript: 32,
  superscript: 64,
  highlight: 128,
} as const;

/** Ordered list: bit value → XML tag. Order determines nesting (outer→inner). */
const FORMAT_BIT_TO_TAG: [number, string][] = [
  [1, 'b'],
  [2, 'i'],
  [4, 's'],
  [8, 'u'],
  [16, 'code'],
  [32, 'sub'],
  [64, 'sup'],
  [128, 'mark'],
];

/** Reverse map: XML tag name → bit value (includes aliases) */
export const FORMAT_TAG_TO_BIT: Record<string, number> = {
  b: 1,
  strong: 1,
  i: 2,
  em: 2,
  s: 4,
  del: 4,
  strike: 4,
  u: 8,
  code: 16,
  sub: 32,
  sup: 64,
  mark: 128,
};

/** Wrap text content with nested format tags based on bitmask. */
export function wrapWithFormatTags(text: string, format: number): XmlContent[] {
  if (format === 0) return [text];

  let content: XmlContent[] = [text];
  // Wrap inside-out: last matching bit wraps first (innermost), first bit wraps last (outermost)
  for (let idx = FORMAT_BIT_TO_TAG.length - 1; idx >= 0; idx--) {
    const [bit, tag] = FORMAT_BIT_TO_TAG[idx];
    if (format & bit) {
      content = [{ tag, children: content } as XmlElement];
    }
  }
  return content;
}

/** Check if a tag name is a known text format tag. */
export function isFormatTag(tagName: string): boolean {
  return tagName.toLowerCase() in FORMAT_TAG_TO_BIT;
}

/** Get the format bit for a tag name. Returns 0 if not a format tag. */
export function getFormatBit(tagName: string): number {
  return FORMAT_TAG_TO_BIT[tagName.toLowerCase()] ?? 0;
}
```

- [ ] **Step 4: Create xml-utils.ts**

```ts
// src/xml-utils.ts
import type { XmlContent, XmlElement } from './types';

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

export function buildAttrs(attrs: Record<string, string>): string {
  const parts = Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => ` ${k}="${escapeXml(v)}"`);
  return parts.join('');
}

/** Render XmlContent tree to XML string. */
export function renderXml(content: XmlContent[], indent: number = 0): string {
  const lines: string[] = [];
  for (const item of content) {
    if (typeof item === 'string') {
      lines.push(escapeXml(item));
    } else {
      lines.push(renderElement(item, indent));
    }
  }
  return lines.join('');
}

function renderElement(el: XmlElement, indent: number): string {
  const attrs = el.attrs ? buildAttrs(el.attrs) : '';

  if (el.selfClosing) {
    return `${pad(indent)}<${el.tag}${attrs} />\n`;
  }

  if (!el.children || el.children.length === 0) {
    return `${pad(indent)}<${el.tag}${attrs} />\n`;
  }

  // Check if all children are inline (strings or inline elements)
  const allInline = el.children.every((c) => typeof c === 'string' || isInlineElement(c));

  if (allInline) {
    const inner = el.children
      .map((c) => (typeof c === 'string' ? escapeXml(c) : renderInline(c)))
      .join('');
    return `${pad(indent)}<${el.tag}${attrs}>${inner}</${el.tag}>\n`;
  }

  // Block children: each on its own line with indent
  const inner = el.children
    .map((c) => {
      if (typeof c === 'string') return `${pad(indent + 1)}${escapeXml(c)}\n`;
      return renderElement(c, indent + 1);
    })
    .join('');
  return `${pad(indent)}<${el.tag}${attrs}>\n${inner}${pad(indent)}</${el.tag}>\n`;
}

function renderInline(el: XmlElement): string {
  const attrs = el.attrs ? buildAttrs(el.attrs) : '';
  if (el.selfClosing || !el.children || el.children.length === 0) {
    return `<${el.tag}${attrs} />`;
  }
  const inner = el.children
    .map((c) => (typeof c === 'string' ? escapeXml(c) : renderInline(c)))
    .join('');
  return `<${el.tag}${attrs}>${inner}</${el.tag}>`;
}

function isInlineElement(el: XmlElement): boolean {
  // Format tags and known inline tags are inline
  const inlineTags = new Set([
    'b',
    'i',
    'u',
    's',
    'code',
    'sub',
    'sup',
    'mark',
    'strong',
    'em',
    'del',
    'a',
    'mention',
    'tag',
    'spoiler',
    'ruby',
    'math',
    'footnote',
    'comment',
  ]);
  return inlineTags.has(el.tag);
}

function pad(indent: number): string {
  return '  '.repeat(indent);
}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-litexml/tests/text-format.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/rich-litexml/src/text-format.ts packages/rich-litexml/src/xml-utils.ts packages/rich-litexml/tests/text-format.test.ts
git commit -m "feat(rich-litexml): add text format bitmask handling and XML utilities"
```

---

### Task 4: Serializer Core

**Files:**

- Create: `packages/rich-litexml/src/serializer.ts`
- Create: `packages/rich-litexml/tests/serializer.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/serializer.test.ts
import type { SerializedEditorState } from 'lexical';
import { describe, expect, it } from 'vitest';
import { LitexmlRegistry } from '../src/registry';
import { serializeToXml } from '../src/serializer';

function makeState(children: any[]): SerializedEditorState {
  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  } as SerializedEditorState;
}

describe('serializeToXml', () => {
  it('serializes empty document', () => {
    const registry = new LitexmlRegistry();
    const state = makeState([]);
    const xml = serializeToXml(state, registry);
    expect(xml).toBe('<doc>\n</doc>\n');
  });

  it('uses fallback for unregistered nodes', () => {
    const registry = new LitexmlRegistry();
    const state = makeState([
      { type: 'custom-thing', $: { blockId: 'abc' }, foo: 'bar', version: 1 },
    ]);
    const xml = serializeToXml(state, registry);
    expect(xml).toContain('<node type="custom-thing" id="abc"');
    expect(xml).toContain('data=');
  });

  it('calls registered writer', () => {
    const registry = new LitexmlRegistry();
    registry.registerWriter('paragraph', (node, ctx) => {
      const n = node as any;
      return {
        tag: 'p',
        attrs: n.$?.blockId ? { id: n.$.blockId } : {},
        children: ctx.serializeChildren(n.children ?? []),
      };
    });
    const state = makeState([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'text',
            text: 'hello',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    const xml = serializeToXml(state, registry);
    expect(xml).toContain('<p id="p1">hello</p>');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-litexml/tests/serializer.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement serializer.ts**

```ts
// src/serializer.ts
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

import type { LitexmlRegistry } from './registry';
import { wrapWithFormatTags } from './text-format';
import type { WriterContext, XmlContent } from './types';
import { escapeXml, renderXml } from './xml-utils';

export function serializeToXml(state: SerializedEditorState, registry: LitexmlRegistry): string {
  const root = state.root as any;
  const children: SerializedLexicalNode[] = root.children ?? [];

  const ctx = createWriterContext(registry);
  const content = children.map((child) => ctx.serializeNode(child)).flat();

  return `<doc>\n${renderXml(content, 1)}</doc>\n`;
}

export function serializeNodesToXml(
  nodes: SerializedLexicalNode[],
  registry: LitexmlRegistry,
): string {
  const ctx = createWriterContext(registry);
  const content = nodes.map((node) => ctx.serializeNode(node)).flat();
  return renderXml(content, 0);
}

function createWriterContext(registry: LitexmlRegistry): WriterContext {
  const ctx: WriterContext = {
    serializeChildren(children: SerializedLexicalNode[]): XmlContent[] {
      return children.map((child) => ctx.serializeNode(child)).flat();
    },

    serializeNode(node: SerializedLexicalNode): XmlContent | XmlContent[] {
      const n = node as any;

      // Text nodes: apply format wrapping
      if (n.type === 'text') {
        return wrapWithFormatTags(n.text ?? '', n.format ?? 0);
      }

      // Linebreak
      if (n.type === 'linebreak') {
        return { tag: 'br', selfClosing: true };
      }

      // Try registered writer
      const writer = registry.getWriter(n.type);
      if (writer) {
        const result = writer(node, ctx);
        if (result !== false) return result;
      }

      // Fallback: opaque <node> element
      return serializeFallback(node);
    },

    serializeNestedState(state: SerializedEditorState): XmlContent[] {
      const root = state.root as any;
      const children: SerializedLexicalNode[] = root.children ?? [];
      return children.map((child) => ctx.serializeNode(child)).flat();
    },
  };
  return ctx;
}

function serializeFallback(node: SerializedLexicalNode): XmlContent {
  const n = node as any;
  const blockId = n.$?.blockId;
  const { type, $: _meta, version: _v, ...rest } = n;
  const attrs: Record<string, string> = { type };
  if (blockId) attrs.id = blockId;

  // Store remaining fields as JSON in data attribute
  const dataKeys = Object.keys(rest);
  if (dataKeys.length > 0) {
    attrs.data = JSON.stringify(rest);
  }

  return { tag: 'node', attrs, selfClosing: true };
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run packages/rich-litexml/tests/serializer.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/rich-litexml/src/serializer.ts packages/rich-litexml/tests/serializer.test.ts
git commit -m "feat(rich-litexml): add serializer core with fallback"
```

---

### Task 5: Deserializer Core

**Files:**

- Create: `packages/rich-litexml/src/deserializer.ts`
- Create: `packages/rich-litexml/tests/deserializer.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/deserializer.test.ts
import { describe, expect, it } from 'vitest';
import { LitexmlRegistry } from '../src/registry';
import { deserializeFromXml, deserializeNodesFromXml } from '../src/deserializer';

describe('deserializeFromXml', () => {
  it('deserializes empty doc', () => {
    const registry = new LitexmlRegistry();
    const state = deserializeFromXml('<doc></doc>', registry);
    expect(state.root.type).toBe('root');
    expect((state.root as any).children).toEqual([]);
  });

  it('parses fallback <node> elements', () => {
    const registry = new LitexmlRegistry();
    const xml = `<doc><node type="custom-thing" id="abc" data='{"foo":"bar"}' /></doc>`;
    const state = deserializeFromXml(xml, registry);
    const children = (state.root as any).children;
    expect(children).toHaveLength(1);
    expect(children[0].type).toBe('custom-thing');
    expect(children[0].foo).toBe('bar');
    expect(children[0].$?.blockId).toBe('abc');
  });

  it('calls registered reader', () => {
    const registry = new LitexmlRegistry();
    registry.registerReader('p', (element, ctx) => {
      const children = ctx.parseChildren(element);
      const id = element.getAttribute('id');
      return {
        type: 'paragraph',
        ...(id ? { $: { blockId: id } } : {}),
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      } as any;
    });
    const xml = '<doc><p id="p1">hello</p></doc>';
    const state = deserializeFromXml(xml, registry);
    const children = (state.root as any).children;
    expect(children).toHaveLength(1);
    expect(children[0].type).toBe('paragraph');
    expect(children[0].$?.blockId).toBe('p1');
  });
});

describe('deserializeNodesFromXml', () => {
  it('parses xml fragment into node array', () => {
    const registry = new LitexmlRegistry();
    registry.registerReader(
      'p',
      (element, ctx) =>
        ({
          type: 'paragraph',
          children: ctx.parseChildren(element),
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        }) as any,
    );
    const nodes = deserializeNodesFromXml('<p>one</p><p>two</p>', registry);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].type).toBe('paragraph');
    expect(nodes[1].type).toBe('paragraph');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-litexml/tests/deserializer.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement deserializer.ts**

```ts
// src/deserializer.ts
import { parseHTML } from 'linkedom';
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

import type { LitexmlRegistry } from './registry';
import { getFormatBit, isFormatTag } from './text-format';
import type { ReaderContext } from './types';

function parseXml(xml: string): Document {
  // linkedom's parseHTML handles XML-like content in a Node-compatible way
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${xml}</body></html>`);
  return document;
}

export function deserializeFromXml(xml: string, registry: LitexmlRegistry): SerializedEditorState {
  const doc = parseXml(xml);
  // Find the <doc> element inside body
  const docEl = doc.querySelector('doc') ?? doc.body;

  const ctx = createReaderContext(registry);
  const children = ctx.parseChildren(docEl as unknown as Element);

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  } as SerializedEditorState;
}

export function deserializeNodesFromXml(
  xml: string,
  registry: LitexmlRegistry,
): SerializedLexicalNode[] {
  const doc = parseXml(`<fragment>${xml}</fragment>`);
  const fragment = doc.querySelector('fragment') ?? doc.body;
  const ctx = createReaderContext(registry);
  return ctx.parseChildren(fragment as unknown as Element);
}

/** Block-level tags that should ignore surrounding whitespace-only text nodes */
const BLOCK_TAGS = new Set([
  'doc',
  'fragment',
  'root',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'table',
  'tr',
  'th',
  'td',
  'hr',
  'codeblock',
  'mermaid',
  'alert',
  'banner',
  'details',
  'nesteddoc',
  'gallery',
  'codesnippet',
  'footnotesection',
  'img',
  'video',
  'linkcard',
  'embed',
  'node',
]);

function isBlockContainer(element: Element): boolean {
  return BLOCK_TAGS.has(element.tagName.toLowerCase());
}

function createReaderContext(registry: LitexmlRegistry): ReaderContext {
  const ctx: ReaderContext = {
    parseChildren(element: Element): SerializedLexicalNode[] {
      const blockLevel = isBlockContainer(element);
      const nodes: SerializedLexicalNode[] = [];
      for (const child of element.childNodes) {
        if (child.nodeType === 3 /* TEXT_NODE */) {
          const text = child.textContent ?? '';
          // Only skip whitespace-only text in block-level containers
          // In inline contexts, preserve all text including spaces
          if (blockLevel && text.trim() === '') continue;
          if (text === '') continue;
          nodes.push(makeTextNode(text, 0));
        } else if (child.nodeType === 1 /* ELEMENT_NODE */) {
          const el = child as Element;
          const parsed = parseElement(el, registry, ctx, 0);
          if (parsed) {
            if (Array.isArray(parsed)) nodes.push(...parsed);
            else nodes.push(parsed);
          }
        }
      }
      return nodes;
    },

    parseNestedState(xml: string): SerializedEditorState {
      return deserializeFromXml(xml, registry);
    },
  };
  return ctx;
}

function parseElement(
  element: Element,
  registry: LitexmlRegistry,
  ctx: ReaderContext,
  inheritedFormat: number,
): SerializedLexicalNode | SerializedLexicalNode[] | null {
  const tag = element.tagName.toLowerCase();

  // Format tags: accumulate format bits and parse children as inline
  if (isFormatTag(tag)) {
    const format = inheritedFormat | getFormatBit(tag);
    return parseInlineChildren(element, registry, ctx, format);
  }

  // <br /> → linebreak
  if (tag === 'br') {
    return { type: 'linebreak', version: 1 } as SerializedLexicalNode;
  }

  // <node> fallback elements
  if (tag === 'node') {
    return parseFallbackNode(element);
  }

  // Try registered reader
  const reader = registry.getReader(tag);
  if (reader) {
    const result = reader(element, ctx);
    if (result !== false) return result;
  }

  // Unknown tag: try parsing children as passthrough
  return ctx.parseChildren(element);
}

function parseInlineChildren(
  element: Element,
  registry: LitexmlRegistry,
  ctx: ReaderContext,
  format: number,
): SerializedLexicalNode[] {
  const nodes: SerializedLexicalNode[] = [];
  for (const child of element.childNodes) {
    if (child.nodeType === 3 /* TEXT_NODE */) {
      const text = child.textContent ?? '';
      if (text === '') continue;
      nodes.push(makeTextNode(text, format));
    } else if (child.nodeType === 1 /* ELEMENT_NODE */) {
      const el = child as Element;
      const parsed = parseElement(el, registry, ctx, format);
      if (parsed) {
        if (Array.isArray(parsed)) nodes.push(...parsed);
        else nodes.push(parsed);
      }
    }
  }
  return nodes;
}

function parseFallbackNode(element: Element): SerializedLexicalNode {
  const type = element.getAttribute('type') ?? 'unknown';
  const id = element.getAttribute('id');
  const dataStr = element.getAttribute('data');
  const data = dataStr ? JSON.parse(dataStr) : {};

  return {
    type,
    ...(id ? { $: { blockId: id } } : {}),
    ...data,
    version: 1,
  } as any;
}

function makeTextNode(text: string, format: number): SerializedLexicalNode {
  return {
    type: 'text',
    text,
    format,
    detail: 0,
    mode: 'normal',
    style: '',
    version: 1,
  } as any;
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run packages/rich-litexml/tests/deserializer.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/rich-litexml/src/deserializer.ts packages/rich-litexml/tests/deserializer.test.ts
git commit -m "feat(rich-litexml): add deserializer core with format tag and fallback handling"
```

---

### Task 6: Built-in Node Writers

**Files:**

- Create: `packages/rich-litexml/src/writers/builtin.ts`
- Create: `packages/rich-litexml/tests/writers-builtin.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/writers-builtin.test.ts
import type { SerializedEditorState } from 'lexical';
import { describe, expect, it } from 'vitest';
import { LitexmlRegistry } from '../src/registry';
import { serializeToXml } from '../src/serializer';
import { registerBuiltinWriters } from '../src/writers/builtin';

function makeState(children: any[]): SerializedEditorState {
  return {
    root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 },
  } as SerializedEditorState;
}

function serialize(children: any[]): string {
  const registry = new LitexmlRegistry();
  registerBuiltinWriters(registry);
  return serializeToXml(makeState(children), registry);
}

const TEXT = (text: string, format = 0) => ({
  type: 'text',
  text,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
});

describe('builtin writers', () => {
  it('paragraph', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [TEXT('hello')],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<p id="p1">hello</p>');
  });

  it('heading h2', () => {
    const xml = serialize([
      {
        type: 'heading',
        tag: 'h2',
        $: { blockId: 'h1' },
        children: [TEXT('Title')],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<h2 id="h1">Title</h2>');
  });

  it('paragraph with formatted text', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p2' },
        children: [TEXT('normal '), TEXT('bold', 1), TEXT(' end')],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<p id="p2">normal <b>bold</b> end</p>');
  });

  it('quote', () => {
    const xml = serialize([
      {
        type: 'quote',
        $: { blockId: 'q1' },
        children: [TEXT('quoted')],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<blockquote id="q1">quoted</blockquote>');
  });

  it('horizontal rule', () => {
    const xml = serialize([{ type: 'horizontalrule', $: { blockId: 'hr1' }, version: 1 }]);
    expect(xml).toContain('<hr id="hr1" />');
  });

  it('unordered list', () => {
    const xml = serialize([
      {
        type: 'list',
        listType: 'bullet',
        $: { blockId: 'ul1' },
        children: [
          {
            type: 'listitem',
            $: { blockId: 'li1' },
            children: [TEXT('item 1')],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
            value: 1,
          },
          {
            type: 'listitem',
            $: { blockId: 'li2' },
            children: [TEXT('item 2')],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
            value: 2,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        start: 1,
        version: 1,
        tag: 'ul',
      },
    ]);
    expect(xml).toContain('<ul id="ul1">');
    expect(xml).toContain('<li id="li1">item 1</li>');
    expect(xml).toContain('<li id="li2">item 2</li>');
    expect(xml).toContain('</ul>');
  });

  it('ordered list', () => {
    const xml = serialize([
      {
        type: 'list',
        listType: 'number',
        $: { blockId: 'ol1' },
        children: [
          {
            type: 'listitem',
            $: { blockId: 'li1' },
            children: [TEXT('first')],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
            value: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        start: 1,
        version: 1,
        tag: 'ol',
      },
    ]);
    expect(xml).toContain('<ol id="ol1">');
  });

  it('checklist', () => {
    const xml = serialize([
      {
        type: 'list',
        listType: 'check',
        $: { blockId: 'cl1' },
        children: [
          {
            type: 'listitem',
            $: { blockId: 'li1' },
            checked: true,
            children: [TEXT('done')],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
            value: 1,
          },
          {
            type: 'listitem',
            $: { blockId: 'li2' },
            checked: false,
            children: [TEXT('todo')],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
            value: 2,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        start: 1,
        version: 1,
        tag: 'ul',
      },
    ]);
    expect(xml).toContain('<ul type="check" id="cl1">');
    expect(xml).toContain('<li checked="true"');
    expect(xml).toContain('<li checked="false"');
  });

  it('link wrapping text', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'link',
            url: 'https://example.com',
            children: [TEXT('click')],
            direction: 'ltr',
            format: '',
            indent: 0,
            rel: null,
            target: null,
            title: null,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<a href="https://example.com">click</a>');
  });

  it('table', () => {
    const xml = serialize([
      {
        type: 'table',
        $: { blockId: 't1' },
        children: [
          {
            type: 'tablerow',
            children: [
              {
                type: 'tablecell',
                headerState: 1,
                children: [
                  {
                    type: 'paragraph',
                    children: [TEXT('Header')],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    textFormat: 0,
                    textStyle: '',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
              {
                type: 'tablecell',
                headerState: 0,
                children: [
                  {
                    type: 'paragraph',
                    children: [TEXT('Cell')],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    textFormat: 0,
                    textStyle: '',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    ]);
    expect(xml).toContain('<table id="t1">');
    expect(xml).toContain('<th>');
    expect(xml).toContain('<td>');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-litexml/tests/writers-builtin.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement writers/builtin.ts**

```ts
// src/writers/builtin.ts
import type { LitexmlRegistry } from '../registry';
import type { XmlContent, XmlElement } from '../types';

function blockId(node: any): Record<string, string> {
  return node.$?.blockId ? { id: node.$.blockId } : {};
}

export function registerBuiltinWriters(registry: LitexmlRegistry): void {
  // paragraph
  registry.registerWriter('paragraph', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'p',
      attrs: blockId(n),
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // heading
  registry.registerWriter('heading', (node, ctx) => {
    const n = node as any;
    const tag = n.tag ?? 'h1';
    return {
      tag,
      attrs: blockId(n),
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // quote
  registry.registerWriter('quote', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'blockquote',
      attrs: blockId(n),
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // horizontalrule
  registry.registerWriter('horizontalrule', (node) => {
    const n = node as any;
    return { tag: 'hr', attrs: blockId(n), selfClosing: true };
  });

  // list
  registry.registerWriter('list', (node, ctx) => {
    const n = node as any;
    const tag = n.listType === 'number' ? 'ol' : 'ul';
    const attrs: Record<string, string> = { ...blockId(n) };
    if (n.listType === 'check') attrs.type = 'check';
    return {
      tag,
      attrs,
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // listitem
  registry.registerWriter('listitem', (node, ctx) => {
    const n = node as any;
    const attrs: Record<string, string> = { ...blockId(n) };
    if (n.checked !== undefined) attrs.checked = String(n.checked);
    return {
      tag: 'li',
      attrs,
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // link
  registry.registerWriter('link', (node, ctx) => {
    const n = node as any;
    const attrs: Record<string, string> = { href: n.url ?? '' };
    if (n.target) attrs.target = n.target;
    if (n.title) attrs.title = n.title;
    return {
      tag: 'a',
      attrs,
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // autolink (same as link)
  registry.registerWriter('autolink', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'a',
      attrs: { href: n.url ?? '' },
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // table
  registry.registerWriter('table', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'table',
      attrs: blockId(n),
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // tablerow
  registry.registerWriter('tablerow', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'tr',
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // tablecell
  registry.registerWriter('tablecell', (node, ctx) => {
    const n = node as any;
    const tag = n.headerState === 1 ? 'th' : 'td';
    return {
      tag,
      children: ctx.serializeChildren(n.children ?? []),
    };
  });
}
```

- [ ] **Step 4: Export from index.ts**

```ts
// src/index.ts
export { LitexmlRegistry } from './registry';
export { serializeToXml, serializeNodesToXml } from './serializer';
export { deserializeFromXml, deserializeNodesFromXml } from './deserializer';
export { registerBuiltinWriters } from './writers/builtin';
export type {
  XmlWriterFn,
  XmlReaderFn,
  XmlContent,
  XmlElement,
  WriterContext,
  ReaderContext,
} from './types';
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-litexml/tests/writers-builtin.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/rich-litexml/src/writers/ packages/rich-litexml/src/index.ts packages/rich-litexml/tests/writers-builtin.test.ts
git commit -m "feat(rich-litexml): add built-in node writers (paragraph, heading, list, quote, link, table, hr)"
```

---

### Task 7: Built-in Node Readers

**Files:**

- Create: `packages/rich-litexml/src/readers/builtin.ts`
- Create: `packages/rich-litexml/tests/readers-builtin.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/readers-builtin.test.ts
import { describe, expect, it } from 'vitest';
import { deserializeFromXml } from '../src/deserializer';
import { LitexmlRegistry } from '../src/registry';
import { registerBuiltinReaders } from '../src/readers/builtin';

function parse(xml: string) {
  const registry = new LitexmlRegistry();
  registerBuiltinReaders(registry);
  const state = deserializeFromXml(`<doc>${xml}</doc>`, registry);
  return (state.root as any).children;
}

describe('builtin readers', () => {
  it('reads <p>', () => {
    const nodes = parse('<p id="p1">hello</p>');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('paragraph');
    expect(nodes[0].$?.blockId).toBe('p1');
    expect(nodes[0].children[0].type).toBe('text');
    expect(nodes[0].children[0].text).toBe('hello');
  });

  it('reads <h3>', () => {
    const nodes = parse('<h3 id="h1">Title</h3>');
    expect(nodes[0].type).toBe('heading');
    expect(nodes[0].tag).toBe('h3');
  });

  it('reads <blockquote>', () => {
    const nodes = parse('<blockquote id="q1">text</blockquote>');
    expect(nodes[0].type).toBe('quote');
  });

  it('reads <hr />', () => {
    const nodes = parse('<hr id="hr1" />');
    expect(nodes[0].type).toBe('horizontalrule');
  });

  it('reads <ul> with <li>', () => {
    const nodes = parse('<ul id="ul1"><li id="li1">item</li></ul>');
    expect(nodes[0].type).toBe('list');
    expect(nodes[0].listType).toBe('bullet');
    expect(nodes[0].children[0].type).toBe('listitem');
  });

  it('reads <ol>', () => {
    const nodes = parse('<ol id="ol1"><li id="li1">item</li></ol>');
    expect(nodes[0].listType).toBe('number');
  });

  it('reads checklist', () => {
    const nodes = parse('<ul type="check" id="cl1"><li checked="true" id="li1">done</li></ul>');
    expect(nodes[0].listType).toBe('check');
    expect(nodes[0].children[0].checked).toBe(true);
  });

  it('reads <a>', () => {
    const nodes = parse('<p id="p1"><a href="https://example.com">link</a></p>');
    const link = nodes[0].children[0];
    expect(link.type).toBe('link');
    expect(link.url).toBe('https://example.com');
    expect(link.children[0].text).toBe('link');
  });

  it('reads formatted text', () => {
    const nodes = parse('<p id="p1">plain <b>bold</b> <b><i>both</i></b></p>');
    const children = nodes[0].children;
    expect(children[0].text).toBe('plain ');
    expect(children[0].format).toBe(0);
    expect(children[1].text).toBe('bold');
    expect(children[1].format).toBe(1); // bold
    expect(children[3].text).toBe('both');
    expect(children[3].format).toBe(3); // bold + italic
  });

  it('reads table', () => {
    const nodes = parse('<table id="t1"><tr><th><p>H</p></th><td><p>C</p></td></tr></table>');
    expect(nodes[0].type).toBe('table');
    const row = nodes[0].children[0];
    expect(row.type).toBe('tablerow');
    expect(row.children[0].type).toBe('tablecell');
    expect(row.children[0].headerState).toBe(1);
    expect(row.children[1].headerState).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-litexml/tests/readers-builtin.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement readers/builtin.ts**

```ts
// src/readers/builtin.ts
import type { SerializedLexicalNode } from 'lexical';

import type { LitexmlRegistry } from '../registry';

function extractBlockId(el: Element): Record<string, any> {
  const id = el.getAttribute('id');
  return id ? { $: { blockId: id } } : {};
}

const ELEMENT_DEFAULTS = {
  direction: 'ltr' as const,
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
};

export function registerBuiltinReaders(registry: LitexmlRegistry): void {
  // paragraph
  registry.registerReader(
    'p',
    (el, ctx) =>
      ({
        type: 'paragraph',
        ...extractBlockId(el),
        children: ctx.parseChildren(el),
        ...ELEMENT_DEFAULTS,
      }) as any,
  );

  // headings h1-h6
  for (let level = 1; level <= 6; level++) {
    registry.registerReader(
      `h${level}`,
      (el, ctx) =>
        ({
          type: 'heading',
          tag: `h${level}`,
          ...extractBlockId(el),
          children: ctx.parseChildren(el),
          ...ELEMENT_DEFAULTS,
        }) as any,
    );
  }

  // blockquote
  registry.registerReader(
    'blockquote',
    (el, ctx) =>
      ({
        type: 'quote',
        ...extractBlockId(el),
        children: ctx.parseChildren(el),
        ...ELEMENT_DEFAULTS,
      }) as any,
  );

  // horizontal rule
  registry.registerReader(
    'hr',
    (el) =>
      ({
        type: 'horizontalrule',
        ...extractBlockId(el),
        version: 1,
      }) as any,
  );

  // unordered list
  registry.registerReader('ul', (el, ctx) => {
    const isCheck = el.getAttribute('type') === 'check';
    return {
      type: 'list',
      listType: isCheck ? 'check' : 'bullet',
      tag: 'ul',
      start: 1,
      ...extractBlockId(el),
      children: ctx.parseChildren(el),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any;
  });

  // ordered list
  registry.registerReader(
    'ol',
    (el, ctx) =>
      ({
        type: 'list',
        listType: 'number',
        tag: 'ol',
        start: Number(el.getAttribute('start') ?? 1),
        ...extractBlockId(el),
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  // list item
  registry.registerReader('li', (el, ctx) => {
    const checked = el.getAttribute('checked');
    return {
      type: 'listitem',
      ...extractBlockId(el),
      ...(checked !== null ? { checked: checked === 'true' } : {}),
      children: ctx.parseChildren(el),
      ...ELEMENT_DEFAULTS,
      value: 1,
    } as any;
  });

  // link
  registry.registerReader(
    'a',
    (el, ctx) =>
      ({
        type: 'link',
        url: el.getAttribute('href') ?? '',
        target: el.getAttribute('target') ?? null,
        title: el.getAttribute('title') ?? null,
        rel: null,
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  // table
  registry.registerReader(
    'table',
    (el, ctx) =>
      ({
        type: 'table',
        ...extractBlockId(el),
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  // table row
  registry.registerReader(
    'tr',
    (el, ctx) =>
      ({
        type: 'tablerow',
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  // table header cell
  registry.registerReader(
    'th',
    (el, ctx) =>
      ({
        type: 'tablecell',
        headerState: 1,
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  // table data cell
  registry.registerReader(
    'td',
    (el, ctx) =>
      ({
        type: 'tablecell',
        headerState: 0,
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );
}
```

- [ ] **Step 4: Update index.ts exports**

Add to `src/index.ts`:

```ts
export { registerBuiltinReaders } from './readers/builtin';
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-litexml/tests/readers-builtin.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/rich-litexml/src/readers/ packages/rich-litexml/src/index.ts packages/rich-litexml/tests/readers-builtin.test.ts
git commit -m "feat(rich-litexml): add built-in node readers (p, h1-h6, list, blockquote, link, table, hr)"
```

---

### Task 8: Custom Node Writers

Covers all 24 custom haklex node types. They follow 5 patterns:

**Pattern A — Simple attributes (self-closing):** image, video, link-card, embed, excalidraw (snapshot too large for XML text)
**Pattern B — Text content:** code-block, mermaid, katex-block, katex-inline
**Pattern C — Nested EditorState:** alert-quote, banner, nested-doc, grid-container
**Pattern D — Element with children:** details, spoiler, ruby
**Pattern E — Inline:** mention, tag, comment, footnote, footnote-section, code-snippet, gallery

**Files:**

- Create: `packages/rich-litexml/src/writers/custom.ts`
- Create: `packages/rich-litexml/tests/writers-custom.test.ts`

- [ ] **Step 1: Write failing test (representative nodes per pattern)**

```ts
// tests/writers-custom.test.ts
import type { SerializedEditorState } from 'lexical';
import { describe, expect, it } from 'vitest';
import { LitexmlRegistry } from '../src/registry';
import { serializeToXml } from '../src/serializer';
import { registerBuiltinWriters } from '../src/writers/builtin';
import { registerCustomWriters } from '../src/writers/custom';

function makeState(children: any[]): SerializedEditorState {
  return {
    root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 },
  } as SerializedEditorState;
}

function serialize(children: any[]): string {
  const registry = new LitexmlRegistry();
  registerBuiltinWriters(registry);
  registerCustomWriters(registry);
  return serializeToXml(makeState(children), registry);
}

describe('custom writers', () => {
  // Pattern A: simple attributes
  it('image', () => {
    const xml = serialize([
      {
        type: 'image',
        $: { blockId: 'img1' },
        src: '/photo.jpg',
        altText: 'A photo',
        width: 800,
        height: 600,
        version: 1,
      },
    ]);
    expect(xml).toContain(
      '<img id="img1" src="/photo.jpg" alt="A photo" width="800" height="600" />',
    );
  });

  it('video', () => {
    const xml = serialize([
      {
        type: 'video',
        $: { blockId: 'v1' },
        src: '/clip.mp4',
        poster: '/thumb.jpg',
        version: 1,
      },
    ]);
    expect(xml).toContain('<video id="v1" src="/clip.mp4" poster="/thumb.jpg" />');
  });

  it('link-card', () => {
    const xml = serialize([
      {
        type: 'link-card',
        $: { blockId: 'lc1' },
        url: 'https://example.com',
        title: 'Example',
        version: 1,
      },
    ]);
    expect(xml).toContain('<linkcard id="lc1" url="https://example.com" title="Example" />');
  });

  it('embed', () => {
    const xml = serialize([
      {
        type: 'embed',
        $: { blockId: 'e1' },
        url: 'https://youtube.com/watch?v=123',
        source: 'youtube',
        version: 1,
      },
    ]);
    expect(xml).toContain(
      '<embed id="e1" url="https://youtube.com/watch?v=123" source="youtube" />',
    );
  });

  // Pattern B: text content
  it('code-block', () => {
    const xml = serialize([
      {
        type: 'code-block',
        $: { blockId: 'cb1' },
        code: 'const x = 1',
        language: 'ts',
        version: 1,
      },
    ]);
    expect(xml).toContain('<codeblock id="cb1" lang="ts">const x = 1</codeblock>');
  });

  it('mermaid', () => {
    const xml = serialize([
      {
        type: 'mermaid',
        $: { blockId: 'm1' },
        diagram: 'graph LR\n  A-->B',
        version: 1,
      },
    ]);
    expect(xml).toContain('<mermaid id="m1">graph LR\n  A--&gt;B</mermaid>');
  });

  it('katex-block', () => {
    const xml = serialize([
      {
        type: 'katex-block',
        $: { blockId: 'kb1' },
        equation: 'E=mc^2',
        version: 1,
      },
    ]);
    expect(xml).toContain('<math id="kb1" display="block">E=mc^2</math>');
  });

  it('katex-inline within paragraph', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'text',
            text: 'Energy is ',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
          { type: 'katex-inline', equation: 'E=mc^2', version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('Energy is <math>E=mc^2</math>');
  });

  // Pattern C: nested EditorState
  it('alert-quote', () => {
    const xml = serialize([
      {
        type: 'alert-quote',
        $: { blockId: 'aq1' },
        alertType: 'warning',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'Be careful',
                    format: 0,
                    detail: 0,
                    mode: 'normal',
                    style: '',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                textStyle: '',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        version: 1,
      },
    ]);
    expect(xml).toContain('<alert id="aq1" type="warning">');
    expect(xml).toContain('<p>Be careful</p>');
    expect(xml).toContain('</alert>');
  });

  // Pattern D: element with children
  it('details', () => {
    const xml = serialize([
      {
        type: 'details',
        $: { blockId: 'd1' },
        summary: 'Click me',
        open: true,
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'hidden content',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    ]);
    expect(xml).toContain('<details id="d1" summary="Click me" open="true">');
    expect(xml).toContain('<p>hidden content</p>');
    expect(xml).toContain('</details>');
  });

  // Pattern E: inline
  it('mention', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'text',
            text: 'Hi ',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
          {
            type: 'mention',
            platform: 'github',
            handle: 'innei',
            displayName: 'Innei',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('Hi <mention platform="github" handle="innei">Innei</mention>');
  });

  it('tag', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          { type: 'tag', text: 'AI', format: 0, detail: 0, mode: 'normal', style: '', version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<tag>AI</tag>');
  });

  it('spoiler', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'spoiler',
            children: [
              {
                type: 'text',
                text: 'secret',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<spoiler>secret</spoiler>');
  });

  it('ruby', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'ruby',
            reading: 'きょう',
            children: [
              {
                type: 'text',
                text: '今日',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<ruby rt="きょう">今日</ruby>');
  });

  it('footnote', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'text',
            text: 'text',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
          { type: 'footnote', identifier: '1', version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('text<footnote ref="1" />');
  });

  it('footnote-section', () => {
    const xml = serialize([
      {
        type: 'footnote-section',
        $: { blockId: 'fs1' },
        definitions: { '1': 'First note', '2': 'Second note' },
        version: 1,
      },
    ]);
    expect(xml).toContain('<footnotesection id="fs1">');
    expect(xml).toContain('<def ref="1">First note</def>');
    expect(xml).toContain('<def ref="2">Second note</def>');
  });

  it('gallery', () => {
    const xml = serialize([
      {
        type: 'gallery',
        $: { blockId: 'g1' },
        images: [
          { src: '/a.jpg', alt: 'A' },
          { src: '/b.jpg', alt: 'B' },
        ],
        layout: 'grid',
        version: 1,
      },
    ]);
    expect(xml).toContain('<gallery id="g1" layout="grid">');
    expect(xml).toContain('<img src="/a.jpg" alt="A" />');
    expect(xml).toContain('<img src="/b.jpg" alt="B" />');
  });

  it('excalidraw uses fallback (snapshot too large)', () => {
    const xml = serialize([
      {
        type: 'excalidraw',
        $: { blockId: 'ex1' },
        snapshot: '{"elements":[]}',
        version: 1,
      },
    ]);
    // excalidraw should use opaque node fallback — AI should not edit these
    expect(xml).toContain('<node type="excalidraw"');
  });

  it('code-snippet', () => {
    const xml = serialize([
      {
        type: 'code-snippet',
        $: { blockId: 'cs1' },
        files: [
          { filename: 'index.ts', code: 'export {}', language: 'ts' },
          { filename: 'main.ts', code: 'console.log(1)', language: 'ts' },
        ],
        version: 1,
      },
    ]);
    expect(xml).toContain('<codesnippet id="cs1">');
    expect(xml).toContain('<file name="index.ts" lang="ts">export {}</file>');
    expect(xml).toContain('<file name="main.ts" lang="ts">console.log(1)</file>');
  });

  it('comment', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'comment',
            text: 'a comment',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<comment>a comment</comment>');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-litexml/tests/writers-custom.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement writers/custom.ts**

```ts
// src/writers/custom.ts
import type { LitexmlRegistry } from '../registry';
import type { XmlContent, XmlElement } from '../types';

function blockId(node: any): Record<string, string> {
  return node.$?.blockId ? { id: node.$.blockId } : {};
}

function optAttr(attrs: Record<string, string | undefined>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== undefined && v !== null && v !== '') result[k] = String(v);
  }
  return result;
}

export function registerCustomWriters(registry: LitexmlRegistry): void {
  // -- Pattern A: simple attributes (self-closing) --

  registry.registerWriter('image', (node) => {
    const n = node as any;
    return {
      tag: 'img',
      attrs: optAttr({
        ...blockId(n),
        src: n.src,
        alt: n.altText,
        width: n.width != null ? String(n.width) : undefined,
        height: n.height != null ? String(n.height) : undefined,
        caption: n.caption,
        thumbhash: n.thumbhash,
        accent: n.accent,
      }),
      selfClosing: true,
    };
  });

  registry.registerWriter('video', (node) => {
    const n = node as any;
    return {
      tag: 'video',
      attrs: optAttr({ ...blockId(n), src: n.src, poster: n.poster }),
      selfClosing: true,
    };
  });

  registry.registerWriter('link-card', (node) => {
    const n = node as any;
    return {
      tag: 'linkcard',
      attrs: optAttr({
        ...blockId(n),
        url: n.url,
        source: n.source,
        title: n.title,
        description: n.description,
        favicon: n.favicon,
        image: n.image,
      }),
      selfClosing: true,
    };
  });

  registry.registerWriter('embed', (node) => {
    const n = node as any;
    return {
      tag: 'embed',
      attrs: optAttr({ ...blockId(n), url: n.url, source: n.source }),
      selfClosing: true,
    };
  });

  // -- Pattern B: text content --

  registry.registerWriter('code-block', (node) => {
    const n = node as any;
    return {
      tag: 'codeblock',
      attrs: optAttr({ ...blockId(n), lang: n.language }),
      children: [n.code ?? ''],
    };
  });

  registry.registerWriter('mermaid', (node) => {
    const n = node as any;
    return {
      tag: 'mermaid',
      attrs: blockId(n),
      children: [n.diagram ?? ''],
    };
  });

  registry.registerWriter('katex-block', (node) => {
    const n = node as any;
    return {
      tag: 'math',
      attrs: { ...blockId(n), display: 'block' },
      children: [n.equation ?? ''],
    };
  });

  registry.registerWriter('katex-inline', (node) => {
    const n = node as any;
    return {
      tag: 'math',
      children: [n.equation ?? ''],
    };
  });

  // -- Pattern C: nested EditorState --

  registry.registerWriter('alert-quote', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'alert',
      attrs: optAttr({ ...blockId(n), type: n.alertType }),
      children: ctx.serializeNestedState(n.content),
    };
  });

  registry.registerWriter('banner', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'banner',
      attrs: optAttr({ ...blockId(n), type: n.bannerType }),
      children: ctx.serializeNestedState(n.content),
    };
  });

  registry.registerWriter('nested-doc', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'nesteddoc',
      attrs: blockId(n),
      children: ctx.serializeNestedState(n.content ?? n.contentState),
    };
  });

  // grid-container: complex nested cell states, use fallback
  // excalidraw: binary snapshot data, use fallback

  // -- Pattern D: element with children --

  registry.registerWriter('details', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'details',
      attrs: optAttr({
        ...blockId(n),
        summary: n.summary,
        open: n.open != null ? String(n.open) : undefined,
      }),
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  registry.registerWriter('spoiler', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'spoiler',
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  registry.registerWriter('ruby', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'ruby',
      attrs: optAttr({ rt: n.reading }),
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // -- Pattern E: inline --

  registry.registerWriter('mention', (node) => {
    const n = node as any;
    return {
      tag: 'mention',
      attrs: optAttr({ platform: n.platform, handle: n.handle }),
      children: [n.displayName ?? n.handle ?? ''],
    };
  });

  registry.registerWriter('tag', (node) => {
    const n = node as any;
    return { tag: 'tag', children: [n.text ?? ''] };
  });

  registry.registerWriter('comment', (node) => {
    const n = node as any;
    return { tag: 'comment', children: [n.text ?? ''] };
  });

  registry.registerWriter('footnote', (node) => {
    const n = node as any;
    return { tag: 'footnote', attrs: { ref: n.identifier ?? '' }, selfClosing: true };
  });

  registry.registerWriter('footnote-section', (node) => {
    const n = node as any;
    const defs = n.definitions ?? {};
    const children: XmlElement[] = Object.entries(defs).map(([ref, text]) => ({
      tag: 'def',
      attrs: { ref },
      children: [text as string],
    }));
    return { tag: 'footnotesection', attrs: blockId(n), children };
  });

  registry.registerWriter('gallery', (node) => {
    const n = node as any;
    const images: XmlElement[] = (n.images ?? []).map((img: any) => ({
      tag: 'img',
      attrs: optAttr({ src: img.src, alt: img.alt }),
      selfClosing: true,
    }));
    return {
      tag: 'gallery',
      attrs: optAttr({ ...blockId(n), layout: n.layout }),
      children: images,
    };
  });

  registry.registerWriter('code-snippet', (node) => {
    const n = node as any;
    const files: XmlElement[] = (n.files ?? []).map((f: any) => ({
      tag: 'file',
      attrs: optAttr({ name: f.filename, lang: f.language }),
      children: [f.code ?? ''],
    }));
    return { tag: 'codesnippet', attrs: blockId(n), children: files };
  });
}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-litexml/tests/writers-custom.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/rich-litexml/src/writers/custom.ts packages/rich-litexml/src/xml-utils.ts packages/rich-litexml/src/types.ts packages/rich-litexml/tests/writers-custom.test.ts
git commit -m "feat(rich-litexml): add custom node writers for all haklex node types"
```

---

### Task 9: Custom Node Readers

**Files:**

- Create: `packages/rich-litexml/src/readers/custom.ts`
- Create: `packages/rich-litexml/tests/readers-custom.test.ts`

- [ ] **Step 1: Write failing test (representative per pattern)**

```ts
// tests/readers-custom.test.ts
import { describe, expect, it } from 'vitest';
import { deserializeFromXml } from '../src/deserializer';
import { LitexmlRegistry } from '../src/registry';
import { registerBuiltinReaders } from '../src/readers/builtin';
import { registerCustomReaders } from '../src/readers/custom';

function parse(xml: string) {
  const registry = new LitexmlRegistry();
  registerBuiltinReaders(registry);
  registerCustomReaders(registry);
  const state = deserializeFromXml(`<doc>${xml}</doc>`, registry);
  return (state.root as any).children;
}

describe('custom readers', () => {
  it('reads <img />', () => {
    const nodes = parse('<img id="i1" src="/a.jpg" alt="Photo" width="800" />');
    expect(nodes[0].type).toBe('image');
    expect(nodes[0].src).toBe('/a.jpg');
    expect(nodes[0].altText).toBe('Photo');
    expect(nodes[0].width).toBe(800);
    expect(nodes[0].$?.blockId).toBe('i1');
  });

  it('reads <video />', () => {
    const nodes = parse('<video id="v1" src="/clip.mp4" poster="/thumb.jpg" />');
    expect(nodes[0].type).toBe('video');
    expect(nodes[0].src).toBe('/clip.mp4');
    expect(nodes[0].poster).toBe('/thumb.jpg');
  });

  it('reads <codeblock>', () => {
    const nodes = parse('<codeblock id="cb1" lang="ts">const x = 1</codeblock>');
    expect(nodes[0].type).toBe('code-block');
    expect(nodes[0].code).toBe('const x = 1');
    expect(nodes[0].language).toBe('ts');
  });

  it('reads <math display="block">', () => {
    const nodes = parse('<math id="kb1" display="block">E=mc^2</math>');
    expect(nodes[0].type).toBe('katex-block');
    expect(nodes[0].equation).toBe('E=mc^2');
  });

  it('reads inline <math>', () => {
    const nodes = parse('<p id="p1">Energy: <math>E=mc^2</math></p>');
    const inline = nodes[0].children[1];
    expect(inline.type).toBe('katex-inline');
    expect(inline.equation).toBe('E=mc^2');
  });

  it('reads <alert>', () => {
    const nodes = parse('<alert id="aq1" type="warning"><p>Be careful</p></alert>');
    expect(nodes[0].type).toBe('alert-quote');
    expect(nodes[0].alertType).toBe('warning');
    expect(nodes[0].content.root.children[0].type).toBe('paragraph');
  });

  it('reads <details>', () => {
    const nodes = parse('<details id="d1" summary="Click" open="true"><p>content</p></details>');
    expect(nodes[0].type).toBe('details');
    expect(nodes[0].summary).toBe('Click');
    expect(nodes[0].open).toBe(true);
    expect(nodes[0].children[0].type).toBe('paragraph');
  });

  it('reads <mention>', () => {
    const nodes = parse('<p id="p1"><mention platform="github" handle="innei">Innei</mention></p>');
    const m = nodes[0].children[0];
    expect(m.type).toBe('mention');
    expect(m.platform).toBe('github');
    expect(m.handle).toBe('innei');
    expect(m.displayName).toBe('Innei');
  });

  it('reads <tag>', () => {
    const nodes = parse('<p id="p1"><tag>AI</tag></p>');
    expect(nodes[0].children[0].type).toBe('tag');
    expect(nodes[0].children[0].text).toBe('AI');
  });

  it('reads <comment>', () => {
    const nodes = parse('<p id="p1"><comment>a comment</comment></p>');
    expect(nodes[0].children[0].type).toBe('comment');
    expect(nodes[0].children[0].text).toBe('a comment');
  });

  it('reads <spoiler>', () => {
    const nodes = parse('<p id="p1"><spoiler>hidden</spoiler></p>');
    expect(nodes[0].children[0].type).toBe('spoiler');
    expect(nodes[0].children[0].children[0].text).toBe('hidden');
  });

  it('reads <ruby>', () => {
    const nodes = parse('<p id="p1"><ruby rt="きょう">今日</ruby></p>');
    expect(nodes[0].children[0].type).toBe('ruby');
    expect(nodes[0].children[0].reading).toBe('きょう');
  });

  it('reads <footnote />', () => {
    const nodes = parse('<p id="p1">text<footnote ref="1" /></p>');
    const fn = nodes[0].children[1];
    expect(fn.type).toBe('footnote');
    expect(fn.identifier).toBe('1');
  });

  it('reads <footnotesection>', () => {
    const nodes = parse('<footnotesection id="fs1"><def ref="1">Note one</def></footnotesection>');
    expect(nodes[0].type).toBe('footnote-section');
    expect(nodes[0].definitions['1']).toBe('Note one');
  });

  it('reads <linkcard />', () => {
    const nodes = parse('<linkcard id="lc1" url="https://example.com" title="Ex" />');
    expect(nodes[0].type).toBe('link-card');
    expect(nodes[0].url).toBe('https://example.com');
  });

  it('reads <embed />', () => {
    const nodes = parse('<embed id="e1" url="https://youtube.com/123" source="youtube" />');
    expect(nodes[0].type).toBe('embed');
  });

  it('reads <mermaid>', () => {
    const nodes = parse('<mermaid id="m1">graph LR</mermaid>');
    expect(nodes[0].type).toBe('mermaid');
    expect(nodes[0].diagram).toBe('graph LR');
  });

  it('reads <gallery>', () => {
    const nodes = parse(
      '<gallery id="g1" layout="grid"><img src="/a.jpg" alt="A" /><img src="/b.jpg" alt="B" /></gallery>',
    );
    expect(nodes[0].type).toBe('gallery');
    expect(nodes[0].layout).toBe('grid');
    expect(nodes[0].images).toHaveLength(2);
    expect(nodes[0].images[0].src).toBe('/a.jpg');
  });

  it('reads <codesnippet>', () => {
    const nodes = parse(
      '<codesnippet id="cs1"><file name="index.ts" lang="ts">export {}</file></codesnippet>',
    );
    expect(nodes[0].type).toBe('code-snippet');
    expect(nodes[0].files[0].filename).toBe('index.ts');
    expect(nodes[0].files[0].code).toBe('export {}');
  });

  it('reads <banner>', () => {
    const nodes = parse('<banner id="b1" type="tip"><p>Tip content</p></banner>');
    expect(nodes[0].type).toBe('banner');
    expect(nodes[0].bannerType).toBe('tip');
    expect(nodes[0].content.root.children[0].type).toBe('paragraph');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-litexml/tests/readers-custom.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement readers/custom.ts**

```ts
// src/readers/custom.ts
import type { SerializedEditorState } from 'lexical';

import type { LitexmlRegistry } from '../registry';

function extractBlockId(el: Element): Record<string, any> {
  const id = el.getAttribute('id');
  return id ? { $: { blockId: id } } : {};
}

function numAttr(el: Element, name: string): number | undefined {
  const v = el.getAttribute(name);
  return v !== null ? Number(v) : undefined;
}

export function registerCustomReaders(registry: LitexmlRegistry): void {
  // -- Pattern A: simple attributes --

  registry.registerReader('img', (el) => {
    // Standalone image block (not inside gallery)
    if (el.parentElement?.tagName.toLowerCase() === 'gallery') return false;
    return {
      type: 'image',
      ...extractBlockId(el),
      src: el.getAttribute('src') ?? '',
      altText: el.getAttribute('alt') ?? '',
      width: numAttr(el, 'width'),
      height: numAttr(el, 'height'),
      caption: el.getAttribute('caption') ?? undefined,
      thumbhash: el.getAttribute('thumbhash') ?? undefined,
      accent: el.getAttribute('accent') ?? undefined,
      version: 1,
    } as any;
  });

  registry.registerReader(
    'video',
    (el) =>
      ({
        type: 'video',
        ...extractBlockId(el),
        src: el.getAttribute('src') ?? '',
        poster: el.getAttribute('poster') ?? undefined,
        width: numAttr(el, 'width'),
        height: numAttr(el, 'height'),
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'linkcard',
    (el) =>
      ({
        type: 'link-card',
        ...extractBlockId(el),
        url: el.getAttribute('url') ?? '',
        source: el.getAttribute('source') ?? undefined,
        title: el.getAttribute('title') ?? undefined,
        description: el.getAttribute('description') ?? undefined,
        favicon: el.getAttribute('favicon') ?? undefined,
        image: el.getAttribute('image') ?? undefined,
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'embed',
    (el) =>
      ({
        type: 'embed',
        ...extractBlockId(el),
        url: el.getAttribute('url') ?? '',
        source: el.getAttribute('source') ?? null,
        version: 1,
      }) as any,
  );

  // -- Pattern B: text content --

  registry.registerReader(
    'codeblock',
    (el) =>
      ({
        type: 'code-block',
        ...extractBlockId(el),
        code: el.textContent ?? '',
        language: el.getAttribute('lang') ?? '',
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'mermaid',
    (el) =>
      ({
        type: 'mermaid',
        ...extractBlockId(el),
        diagram: el.textContent ?? '',
        version: 1,
      }) as any,
  );

  // math: block or inline depending on display attribute
  registry.registerReader('math', (el) => {
    const display = el.getAttribute('display');
    if (display === 'block') {
      return {
        type: 'katex-block',
        ...extractBlockId(el),
        equation: el.textContent ?? '',
        version: 1,
      } as any;
    }
    return {
      type: 'katex-inline',
      equation: el.textContent ?? '',
      version: 1,
    } as any;
  });

  // -- Pattern C: nested EditorState --

  registry.registerReader('alert', (el, ctx) => {
    const children = ctx.parseChildren(el);
    const content: SerializedEditorState = {
      root: {
        type: 'root',
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as SerializedEditorState;
    return {
      type: 'alert-quote',
      ...extractBlockId(el),
      alertType: el.getAttribute('type') ?? 'note',
      content,
      version: 1,
    } as any;
  });

  registry.registerReader('banner', (el, ctx) => {
    const children = ctx.parseChildren(el);
    const content: SerializedEditorState = {
      root: {
        type: 'root',
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as SerializedEditorState;
    return {
      type: 'banner',
      ...extractBlockId(el),
      bannerType: el.getAttribute('type') ?? 'note',
      content,
      version: 1,
    } as any;
  });

  registry.registerReader('nesteddoc', (el, ctx) => {
    const children = ctx.parseChildren(el);
    const content: SerializedEditorState = {
      root: {
        type: 'root',
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as SerializedEditorState;
    return {
      type: 'nested-doc',
      ...extractBlockId(el),
      content,
      version: 1,
    } as any;
  });

  // -- Pattern D: element with children --

  registry.registerReader(
    'details',
    (el, ctx) =>
      ({
        type: 'details',
        ...extractBlockId(el),
        summary: el.getAttribute('summary') ?? '',
        open: el.getAttribute('open') === 'true',
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'spoiler',
    (el, ctx) =>
      ({
        type: 'spoiler',
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'ruby',
    (el, ctx) =>
      ({
        type: 'ruby',
        reading: el.getAttribute('rt') ?? '',
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      }) as any,
  );

  // -- Pattern E: inline --

  registry.registerReader(
    'mention',
    (el) =>
      ({
        type: 'mention',
        platform: el.getAttribute('platform') ?? '',
        handle: el.getAttribute('handle') ?? '',
        displayName: el.textContent || undefined,
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'tag',
    (el) =>
      ({
        type: 'tag',
        text: el.textContent ?? '',
        format: 0,
        detail: 0,
        mode: 'normal',
        style: '',
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'comment',
    (el) =>
      ({
        type: 'comment',
        text: el.textContent ?? '',
        format: 0,
        detail: 0,
        mode: 'normal',
        style: '',
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'footnote',
    (el) =>
      ({
        type: 'footnote',
        identifier: el.getAttribute('ref') ?? '',
        version: 1,
      }) as any,
  );

  registry.registerReader('footnotesection', (el) => {
    const definitions: Record<string, string> = {};
    for (const child of el.children) {
      if (child.tagName.toLowerCase() === 'def') {
        const ref = child.getAttribute('ref') ?? '';
        definitions[ref] = child.textContent ?? '';
      }
    }
    return {
      type: 'footnote-section',
      ...extractBlockId(el),
      definitions,
      version: 1,
    } as any;
  });

  registry.registerReader('gallery', (el) => {
    const images: Array<{ src: string; alt?: string }> = [];
    for (const child of el.children) {
      if (child.tagName.toLowerCase() === 'img') {
        images.push({
          src: child.getAttribute('src') ?? '',
          alt: child.getAttribute('alt') ?? undefined,
        });
      }
    }
    return {
      type: 'gallery',
      ...extractBlockId(el),
      images,
      layout: el.getAttribute('layout') ?? 'grid',
      version: 1,
    } as any;
  });

  registry.registerReader('codesnippet', (el) => {
    const files: Array<{ filename: string; code: string; language: string }> = [];
    for (const child of el.children) {
      if (child.tagName.toLowerCase() === 'file') {
        files.push({
          filename: child.getAttribute('name') ?? '',
          code: child.textContent ?? '',
          language: child.getAttribute('lang') ?? '',
        });
      }
    }
    return {
      type: 'code-snippet',
      ...extractBlockId(el),
      files,
      version: 1,
    } as any;
  });
}
```

- [ ] **Step 4: Update index.ts**

Add to `src/index.ts`:

```ts
export { registerCustomWriters } from './writers/custom';
export { registerCustomReaders } from './readers/custom';
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-litexml/tests/readers-custom.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/rich-litexml/src/readers/custom.ts packages/rich-litexml/src/index.ts packages/rich-litexml/tests/readers-custom.test.ts
git commit -m "feat(rich-litexml): add custom node readers for all haklex node types"
```

---

### Task 10: Default Registry & Roundtrip Tests

**Files:**

- Create: `packages/rich-litexml/src/default-registry.ts`
- Create: `packages/rich-litexml/tests/roundtrip.test.ts`

- [ ] **Step 1: Create default-registry.ts**

```ts
// src/default-registry.ts
import { registerBuiltinReaders } from './readers/builtin';
import { registerCustomReaders } from './readers/custom';
import { LitexmlRegistry } from './registry';
import { registerBuiltinWriters } from './writers/builtin';
import { registerCustomWriters } from './writers/custom';

export function createDefaultRegistry(): LitexmlRegistry {
  const registry = new LitexmlRegistry();
  registerBuiltinWriters(registry);
  registerBuiltinReaders(registry);
  registerCustomWriters(registry);
  registerCustomReaders(registry);
  return registry;
}
```

- [ ] **Step 2: Write roundtrip test**

```ts
// tests/roundtrip.test.ts
import type { SerializedEditorState } from 'lexical';
import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../src/default-registry';
import { deserializeFromXml } from '../src/deserializer';
import { serializeToXml } from '../src/serializer';

const registry = createDefaultRegistry();

function roundtrip(xml: string) {
  const state = deserializeFromXml(`<doc>${xml}</doc>`, registry);
  const output = serializeToXml(state, registry);
  // Strip <doc> wrapper for comparison
  return output
    .replace(/^<doc>\n/, '')
    .replace(/<\/doc>\n$/, '')
    .trim();
}

describe('roundtrip', () => {
  it('paragraph with plain text', () => {
    expect(roundtrip('<p id="p1">hello world</p>')).toBe('<p id="p1">hello world</p>');
  });

  it('paragraph with formatted text', () => {
    expect(roundtrip('<p id="p1">normal <b>bold</b> <i>italic</i></p>')).toBe(
      '<p id="p1">normal <b>bold</b> <i>italic</i></p>',
    );
  });

  it('heading', () => {
    expect(roundtrip('<h2 id="h1">Title</h2>')).toBe('<h2 id="h1">Title</h2>');
  });

  it('unordered list', () => {
    const input = '<ul id="u1">\n  <li id="l1">A</li>\n  <li id="l2">B</li>\n</ul>';
    const result = roundtrip(input);
    expect(result).toContain('<ul id="u1">');
    expect(result).toContain('<li id="l1">A</li>');
    expect(result).toContain('<li id="l2">B</li>');
  });

  it('code-block', () => {
    expect(roundtrip('<codeblock id="c1" lang="ts">const x = 1</codeblock>')).toBe(
      '<codeblock id="c1" lang="ts">const x = 1</codeblock>',
    );
  });

  it('image', () => {
    expect(roundtrip('<img id="i1" src="/a.jpg" alt="Photo" />')).toContain('src="/a.jpg"');
  });

  it('link inside paragraph', () => {
    const result = roundtrip('<p id="p1">See <a href="https://x.com">link</a></p>');
    expect(result).toContain('<a href="https://x.com">link</a>');
  });

  it('new XML without ids (AI-generated content)', () => {
    // AI-generated XML won't have ids — should still roundtrip structurally
    const state = deserializeFromXml('<doc><p>new para</p><h2>new heading</h2></doc>', registry);
    const children = (state.root as any).children;
    expect(children).toHaveLength(2);
    expect(children[0].type).toBe('paragraph');
    expect(children[1].type).toBe('heading');
    expect(children[1].tag).toBe('h2');
  });
});
```

- [ ] **Step 3: Update index.ts to export createDefaultRegistry**

Add to `src/index.ts`:

```ts
export { createDefaultRegistry } from './default-registry';
```

- [ ] **Step 4: Run all tests**

Run: `npx vitest run packages/rich-litexml/tests/`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add packages/rich-litexml/src/default-registry.ts packages/rich-litexml/src/index.ts packages/rich-litexml/tests/roundtrip.test.ts
git commit -m "feat(rich-litexml): add createDefaultRegistry and roundtrip tests"
```

---

### Task 11: Agent-Core — Pipeline XML Integration

Replace JSON document context with XML in the message pipeline.

**Files:**

- Modify: `packages/rich-agent-core/src/pipeline.ts`
- Modify: `packages/rich-agent-core/package.json` (add dep on rich-litexml)
- Modify: `packages/rich-agent-core/tests/pipeline.test.ts`

- [ ] **Step 1: Add rich-litexml dependency**

In `packages/rich-agent-core/package.json`, add to `dependencies`:

```json
"@haklex/rich-litexml": "workspace:*"
```

Run: `pnpm install`

- [ ] **Step 2: Update pipeline.test.ts**

```ts
// Update existing tests to expect XML output instead of the old [blockId] (type) format.
// Add new test:
it('buildDocumentContext returns XML format', () => {
  const state = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          $: { blockId: 'p1' },
          children: [
            {
              type: 'text',
              text: 'Hello',
              format: 0,
              detail: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        },
        {
          type: 'heading',
          tag: 'h2',
          $: { blockId: 'h1' },
          children: [
            {
              type: 'text',
              text: 'Title',
              format: 0,
              detail: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  } as any;

  const xml = buildDocumentContext(state, { mode: 'full' });
  expect(xml).toContain('<p id="p1">Hello</p>');
  expect(xml).toContain('<h2 id="h1">Title</h2>');
});
```

- [ ] **Step 3: Rewrite pipeline.ts**

```ts
// src/pipeline.ts
import type { SerializedEditorState } from 'lexical';

import type { ChatMessage, DocumentContextOptions, MessagePipeline } from './protocol';

import { createDefaultRegistry, serializeToXml } from '@haklex/rich-litexml';

export function buildMessages(pipeline: MessagePipeline): ChatMessage[] {
  return [...pipeline.systemMessages, pipeline.actionPrompt, ...pipeline.turns];
}

export function buildDocumentContext(
  editorState: SerializedEditorState,
  _options: DocumentContextOptions,
): string {
  const registry = createDefaultRegistry();
  return serializeToXml(editorState, registry);
}
```

Note: The `mode` and `anchorBlockId` parameters from `DocumentContextOptions` become less relevant with XML format since XML is inherently structured. For now keep the parameter but always output full XML. Selection windowing can be re-added later if needed.

- [ ] **Step 4: Run pipeline tests**

Run: `npx vitest run packages/rich-agent-core/tests/pipeline.test.ts`
Expected: PASS (update existing tests that check old format)

- [ ] **Step 5: Commit**

```bash
git add packages/rich-agent-core/package.json packages/rich-agent-core/src/pipeline.ts packages/rich-agent-core/tests/pipeline.test.ts
git commit -m "refactor(agent-core): replace JSON document context with XML via rich-litexml"
```

---

### Task 12: Agent-Core — Document Tools Refactor

Remove `read_selection`, change `insert_node` and `replace_node` to accept XML strings.

**Files:**

- Modify: `packages/rich-agent-core/src/document-tools.ts`
- Modify: `packages/rich-agent-core/src/types.ts`
- Modify: `packages/rich-agent-core/src/agent-executor.ts`
- Modify: `packages/rich-agent-core/tests/document-tools.test.ts`
- Modify: `packages/rich-agent-core/tests/agent-executor.test.ts`

- [ ] **Step 1: Update document-tools tests**

```ts
// In tests/document-tools.test.ts, update tests:

// Remove all read_selection tests.

// Update insert_node tests to use xml parameter:
it('insert_node accepts XML and creates operation', async () => {
  const tools = createDocumentTools(snapshot, operations);
  const insertTool = tools.find((t) => t.name === 'insert_node')!;
  const result = await insertTool.execute({
    position: { type: 'after', blockId: 'block1' },
    xml: '<p>New paragraph</p>',
  });
  expect((result as any).ok).toBe(true);
  expect(operations).toHaveLength(1);
  expect(operations[0].op).toBe('insert');
  expect((operations[0] as any).node.type).toBe('paragraph');
});

it('insert_node with multiple XML elements creates multiple operations', async () => {
  const tools = createDocumentTools(snapshot, operations);
  const insertTool = tools.find((t) => t.name === 'insert_node')!;
  const result = await insertTool.execute({
    position: { type: 'after', blockId: 'block1' },
    xml: '<h2>Title</h2><p>Content</p>',
  });
  expect((result as any).ok).toBe(true);
  expect(operations).toHaveLength(2);
});

// Update replace_node tests:
it('replace_node accepts XML', async () => {
  const tools = createDocumentTools(snapshot, operations);
  const replaceTool = tools.find((t) => t.name === 'replace_node')!;
  const result = await replaceTool.execute({
    blockId: 'block1',
    xml: '<p>Replaced content</p>',
  });
  expect((result as any).ok).toBe(true);
  expect(operations[0].op).toBe('replace');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run packages/rich-agent-core/tests/document-tools.test.ts`
Expected: FAIL

- [ ] **Step 3: Rewrite document-tools.ts**

```ts
// src/document-tools.ts
import { createDefaultRegistry, deserializeNodesFromXml } from '@haklex/rich-litexml';
import type { SerializedLexicalNode } from 'lexical';

import type { AgentToolConfig, AgentToolResult } from './protocol';
import type { EditorSnapshot } from './snapshot';
import type { AgentOperation } from './types';

function extractText(node: SerializedLexicalNode): string {
  const n = node as any;
  if (n.text) return n.text;
  if (n.children) return n.children.map(extractText).join('');
  return '';
}

export function createDocumentTools(
  snapshot: EditorSnapshot,
  operations: AgentOperation[],
): AgentToolConfig[] {
  const registry = createDefaultRegistry();

  const insertNodeTool: AgentToolConfig = {
    name: 'insert_node',
    description:
      'Insert one or more block nodes at a position relative to an existing block. The xml parameter should contain XML elements like <p>, <h2>, <ul>, <codeblock>, <img />, etc.',
    parameters: {
      type: 'object',
      properties: {
        position: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['after', 'before', 'root'] },
            blockId: { type: 'string' },
            index: { type: 'number' },
          },
          required: ['type'],
        },
        xml: { type: 'string', description: 'XML string containing block elements to insert' },
      },
      required: ['position', 'xml'],
    },
    describeCall: (params: unknown) => {
      const p = params as { position?: { type?: string; blockId?: string } };
      const pos = p.position;
      return pos?.blockId ? `inserting ${pos.type} block "${pos.blockId}"` : 'inserting node';
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { position, xml } = params as { position: any; xml: string };
      if (!xml || typeof xml !== 'string') {
        return {
          ok: false,
          error: {
            error: 'invalid_xml',
            message: 'Missing or invalid "xml" parameter. Must be an XML string.',
          },
        };
      }
      if (position.type !== 'root' && !snapshot.getBlock(position.blockId)) {
        return {
          ok: false,
          error: {
            error: 'block_not_found',
            blockId: position.blockId,
            message: `Block "${position.blockId}" not found.`,
          },
        };
      }

      let nodes: SerializedLexicalNode[];
      try {
        nodes = deserializeNodesFromXml(xml, registry);
      } catch {
        return {
          ok: false,
          error: { error: 'xml_parse_error', message: 'Failed to parse XML string.' },
        };
      }

      if (nodes.length === 0) {
        return { ok: false, error: { error: 'empty_xml', message: 'XML produced no nodes.' } };
      }

      // For multi-node insert: use a single operation with an array of nodes.
      // The apply layer processes them in order relative to the anchor.
      for (let i = 0; i < nodes.length; i++) {
        // First node at the specified position, subsequent nodes use 'after' with
        // a generated sequential key so the apply layer preserves order.
        const pos = i === 0 ? position : { ...position, _insertIndex: i };
        operations.push({ op: 'insert', position: pos, node: nodes[i] });
      }

      return {
        ok: true,
        content: `Inserted ${nodes.length} node(s) ${position.type} block "${position.blockId ?? 'root'}"`,
      };
    },
  };

  const replaceNodeTool: AgentToolConfig = {
    name: 'replace_node',
    description:
      'Replace an existing block node by its blockId with new XML content. The xml should contain exactly one block element.',
    parameters: {
      type: 'object',
      properties: {
        blockId: { type: 'string' },
        xml: { type: 'string', description: 'XML string containing one block element' },
      },
      required: ['blockId', 'xml'],
    },
    describeCall: (params: unknown) => {
      const p = params as { blockId?: string };
      return p.blockId ? `replacing block "${p.blockId}"` : 'replacing node';
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { blockId, xml } = params as { blockId: string; xml: string };
      if (!xml || typeof xml !== 'string') {
        return {
          ok: false,
          error: { error: 'invalid_xml', message: 'Missing or invalid "xml" parameter.' },
        };
      }
      const existing = snapshot.getBlock(blockId);
      if (!existing) {
        return {
          ok: false,
          error: { error: 'block_not_found', blockId, message: `Block "${blockId}" not found.` },
        };
      }

      let nodes: SerializedLexicalNode[];
      try {
        nodes = deserializeNodesFromXml(xml, registry);
      } catch {
        return {
          ok: false,
          error: { error: 'xml_parse_error', message: 'Failed to parse XML string.' },
        };
      }

      if (nodes.length === 0) {
        return { ok: false, error: { error: 'empty_xml', message: 'XML produced no nodes.' } };
      }

      // Inject the original blockId into the replacement node so identity is preserved
      // for the review/apply pipeline
      const primaryNode = { ...nodes[0], $: { ...(nodes[0] as any).$, blockId } } as any;
      operations.push({ op: 'replace', blockId, node: primaryNode });

      // Additional nodes insert after the replaced block
      for (let i = 1; i < nodes.length; i++) {
        operations.push({ op: 'insert', position: { type: 'after', blockId }, node: nodes[i] });
      }

      return { ok: true, content: `Replaced block "${blockId}" (${nodes.length} node(s))` };
    },
  };

  const deleteNodeTool: AgentToolConfig = {
    name: 'delete_node',
    description: 'Delete an existing block node by its blockId',
    parameters: {
      type: 'object',
      properties: { blockId: { type: 'string' } },
      required: ['blockId'],
    },
    describeCall: (params: unknown) => {
      const p = params as { blockId?: string };
      return p.blockId ? `deleting block "${p.blockId}"` : 'deleting node';
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { blockId } = params as { blockId: string };
      if (!snapshot.getBlock(blockId)) {
        return {
          ok: false,
          error: { error: 'block_not_found', blockId, message: `Block "${blockId}" not found.` },
        };
      }
      operations.push({ op: 'delete', blockId });
      return { ok: true, content: `Deleted block "${blockId}"` };
    },
  };

  const searchDocumentTool: AgentToolConfig = {
    name: 'search_document',
    description: 'Search for blocks in the document by text content or block type',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        blockType: { type: 'string' },
      },
      required: ['query'],
    },
    describeCall: (params: unknown) => {
      const p = params as { query?: string; blockType?: string };
      const parts: string[] = [];
      if (p.query) parts.push(`"${p.query}"`);
      if (p.blockType) parts.push(`type=${p.blockType}`);
      return `searching ${parts.join(', ') || 'document'}`;
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { query, blockType } = params as { query: string; blockType?: string };
      const matches: Array<{ blockId: string; nodeType: string; textContent: string }> = [];
      for (const blockId of snapshot.blockIds) {
        const block = snapshot.getBlock(blockId)!;
        const nodeType = (block as any).type ?? 'unknown';
        if (blockType && nodeType !== blockType) continue;
        const text = extractText(block);
        if (query && !text.toLowerCase().includes(query.toLowerCase())) continue;
        matches.push({ blockId, nodeType, textContent: text });
      }
      return { ok: true, content: JSON.stringify(matches) };
    },
  };

  return [insertNodeTool, replaceNodeTool, deleteNodeTool, searchDocumentTool];
}
```

- [ ] **Step 4: Remove readSelection from agent-executor.ts**

In `agent-executor.ts`, remove the `readSelection` field from `AgentExecutorConfig` and remove the line that passes it to `createDocumentTools`:

```ts
// Before: createDocumentTools(snapshot, operations, config.readSelection)
// After:  createDocumentTools(snapshot, operations)
```

- [ ] **Step 5: Run document-tools and agent-executor tests**

Run: `npx vitest run packages/rich-agent-core/tests/`
Expected: PASS (after updating tests)

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-core/src/document-tools.ts packages/rich-agent-core/src/agent-executor.ts packages/rich-agent-core/tests/
git commit -m "refactor(agent-core): XML-based tools, remove read_selection"
```

---

### Task 13: System Prompt

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts`

- [ ] **Step 1: Update useAgentLoop.ts default system message**

Replace the minimal system message (line 62-65) with a comprehensive prompt:

```ts
systemMessages: options.systemMessages ?? [
  {
    role: 'system',
    content: `You are an AI editor agent that modifies a rich-text document using structured XML tools.

## Document Format

The document is provided as XML. Each block element has an \`id\` attribute you use to reference it.

### Block elements
- \`<p>\` paragraph
- \`<h1>\` to \`<h6>\` headings
- \`<blockquote>\` block quote
- \`<ul>\` / \`<ol>\` lists with \`<li>\` items. Checklists: \`<ul type="check"><li checked="true">...\`
- \`<hr />\` horizontal rule
- \`<table>\` with \`<tr>\`, \`<th>\`, \`<td>\`
- \`<codeblock lang="...">\` code block
- \`<img src="..." alt="..." />\` image
- \`<video src="..." />\` video
- \`<math display="block">\` block equation (KaTeX)
- \`<mermaid>\` mermaid diagram
- \`<alert type="note|tip|important|warning|caution">\` alert/callout
- \`<banner type="...">\` banner
- \`<details summary="...">\` collapsible section
- \`<linkcard url="..." />\` link card
- \`<embed url="..." />\` embed
- \`<gallery layout="grid|masonry|carousel">\` image gallery with \`<img>\` children
- \`<codesnippet>\` multi-file code with \`<file name="..." lang="...">\` children
- \`<footnotesection>\` with \`<def ref="...">\` children

### Inline elements (inside block elements)
- \`<b>\` bold, \`<i>\` italic, \`<u>\` underline, \`<s>\` strikethrough
- \`<code>\` inline code, \`<mark>\` highlight, \`<sub>\` subscript, \`<sup>\` superscript
- \`<a href="...">\` link
- \`<math>\` inline equation
- \`<mention platform="..." handle="...">\` mention
- \`<tag>\` tag
- \`<comment>\` HTML comment node
- \`<spoiler>\` spoiler text
- \`<ruby rt="...">\` ruby annotation
- \`<footnote ref="..." />\` footnote reference

### Opaque elements
\`<node type="..." data="..." />\` — unrecognized or complex nodes. Do NOT modify these.

## Tool Usage Rules

1. **Use the XML format** for insert_node and replace_node. Write proper block elements, not raw text with \\n.
2. **One block per replace_node call.** If replacing one block with multiple, the first replaces and extras insert after.
3. **insert_node supports multiple blocks** in one call. Write multiple XML elements in the xml parameter.
4. **Preserve document structure.** Don't merge separate paragraphs into one unless explicitly asked.
5. **Keep existing block IDs.** When modifying content within a block, use replace_node with the block's id.
6. **Do not invent block IDs** in your XML output — the system assigns them automatically.
7. **For bulk edits** (e.g. polishing an article), work block-by-block: replace each block that needs changes, delete blocks to remove, insert new blocks where needed.
8. **search_document** finds blocks by text content or type. Use it to locate blocks before modifying.
`,
    cacheBreakpoint: true,
  },
],
```

- [ ] **Step 2: Update document message format**

In the same file, change the document message (line 52-54):

```ts
// Before:
const documentMessage: ChatMessage = {
  role: 'user',
  content: `## Document\n${JSON.stringify(serialized)}`,
};

// After:
import { buildDocumentContext } from '@haklex/rich-agent-core';

const documentMessage: ChatMessage = {
  role: 'user',
  content: `<document>\n${buildDocumentContext(serialized, { mode: 'full' })}</document>`,
};
```

- [ ] **Step 3: Run lint on changed files**

Run: `npx eslint packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts
git commit -m "feat(agent): comprehensive system prompt with XML format documentation"
```

---

### Task 14: CLAUDE.md Files & Documentation

**Files:**

- Modify: `CLAUDE.md` (root)
- Create: `packages/rich-agent-core/CLAUDE.md`
- Already created: `packages/rich-litexml/CLAUDE.md` (Task 1)

- [ ] **Step 1: Add checklist to root CLAUDE.md**

Append to the end of `CLAUDE.md`:

```markdown
## Adding New Nodes Checklist

When creating a new Lexical node type:

- Node class in `packages/rich-editor/src/nodes/`
- Static renderer in `packages/rich-renderers/`
- Edit renderer in `packages/rich-renderers-edit/` (if edit UI needed)
- Register in `config.ts` (static) and `config-edit.ts` (edit)
- **XML writer in `packages/rich-litexml/src/writers/`** (required for AI agent)
- **XML reader in `packages/rich-litexml/src/readers/`** (required for AI agent)
- **Register in `packages/rich-litexml/src/default-registry.ts`**
- Update `packages/rich-ext-ai-agent` system prompt if the node is agent-creatable
```

- [ ] **Step 2: Create packages/rich-agent-core/CLAUDE.md**

```markdown
# @haklex/rich-agent-core

AI agent execution engine for the rich editor. Provides tool definitions, message pipeline, and executor loop.

## Dependencies

- `@haklex/rich-litexml` — XML serialization for document context and tool parameters
- When adding new node types, they MUST also be registered in `rich-litexml`

## Architecture

- `agent-executor.ts` — Main loop: sends messages to LLM, executes tool calls, collects operations
- `document-tools.ts` — Built-in tools (insert_node, replace_node, delete_node, search_document)
- `pipeline.ts` — Builds document context as XML via rich-litexml
- `snapshot.ts` — Immutable snapshot of editor state for tool validation

## Tool Parameters

- `insert_node` and `replace_node` accept an `xml` string parameter (not raw Lexical JSON)
- The XML is deserialized via `@haklex/rich-litexml` into SerializedLexicalNode(s)
- `delete_node` and `search_document` operate by blockId

## System Prompt

The default system prompt lives in `packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts`.
When new XML tags are added to rich-litexml, update the system prompt's element reference list.
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md packages/rich-agent-core/CLAUDE.md
git commit -m "docs: add CLAUDE.md for rich-agent-core, add new-node checklist to root"
```

---

## Self-Review

**Spec coverage:**

- [x] New `@haklex/rich-litexml` package with registration system
- [x] Writers for all custom node types + Lexical builtins
- [x] Readers for all registered writers (including `comment` via `<comment>` tag)
- [x] Fallback for unregistered nodes (`<node type="..." data="..." />`)
- [x] `read_selection` removed from document-tools
- [x] Tools accept XML string instead of raw JSON
- [x] Document context serialized as XML
- [x] System prompt comprehensive with all element types
- [x] CLAUDE.md files for enforcement
- [x] Selection injection via message pipeline (XML `<document>` wrapper)

**Codex review fixes applied:**

- [x] `linkedom` instead of browser-native `DOMParser` (headless compatibility)
- [x] `replace_node` preserves original `$.blockId` in replacement node
- [x] Multi-node insert uses `_insertIndex` for ordering
- [x] `comment` writer/reader uses `<comment>` tag (not XML comment which DOMParser drops)
- [x] Whitespace-only text nodes only skipped in block containers, preserved inline
- [x] `serializeNestedState` returns `XmlContent[]` (no `RawXml` hack)
- [x] Missing JSON fields added: image `thumbhash`/`accent`, link-card `source`/`favicon`/`image`

**Placeholder scan:** No TBDs, TODOs, or vague steps found.

**Type consistency:** `XmlWriterFn`, `XmlReaderFn`, `LitexmlRegistry`, `WriterContext`, `ReaderContext` used consistently across all tasks. `deserializeNodesFromXml` name consistent between serializer export and document-tools import.
