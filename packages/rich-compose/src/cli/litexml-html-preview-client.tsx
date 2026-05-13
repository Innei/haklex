import { createDefaultRegistry, deserializeFromXml } from '@haklex/rich-litexml';
import { createRoot } from 'react-dom/client';

import { composeRenderer } from '../core/compose';
import type { RichRendererModule } from '../core/types';
import { ChatRenderer } from '../modules/chat/renderer';
import { CodeBlockRenderer } from '../modules/code-block/renderer';
import { CodeSnippetRenderer } from '../modules/code-snippet/renderer';
import { GalleryRenderer } from '../modules/gallery/renderer';
import { MermaidRenderer } from '../modules/mermaid/renderer';
import { PollRenderer } from '../modules/poll/renderer';
import { allRendererModules } from '../renderer';

type Theme = 'light' | 'dark';
type Variant = 'article' | 'note' | 'comment';

interface LiteXmlPreviewPayload {
  theme?: Theme;
  variant?: Variant;
  xml?: string;
}

declare global {
  interface Window {
    __HAKLEX_LITEXML_PREVIEW_ERROR__?: string;
    __HAKLEX_LITEXML_PREVIEW_READY__?: boolean;
  }
}

const syncRendererMap: Record<string, NonNullable<RichRendererModule['renderers']>> = {
  'chat': { Chat: ChatRenderer },
  'code-block': { CodeBlock: CodeBlockRenderer },
  'code-snippet': { CodeSnippet: CodeSnippetRenderer },
  'gallery': { Gallery: GalleryRenderer },
  'mermaid': { Mermaid: MermaidRenderer },
  'poll': { Poll: PollRenderer },
};

const htmlRendererModules: RichRendererModule[] = allRendererModules.map((module) => {
  const renderers = syncRendererMap[module.name];
  if (!renderers) return module;

  return {
    ...module,
    lazyRenderers: undefined,
    renderers: {
      ...module.renderers,
      ...renderers,
    },
    ssrFallback: undefined,
  };
});

const HtmlRenderer = composeRenderer({ modules: htmlRendererModules });

function readPayload(): Required<LiteXmlPreviewPayload> {
  const payloadElement = document.getElementById('haklex-litexml-payload');
  if (!payloadElement?.textContent) {
    throw new Error('Missing LiteXML preview payload.');
  }

  const parsed = JSON.parse(payloadElement.textContent) as LiteXmlPreviewPayload;
  if (!parsed.xml) {
    throw new Error('LiteXML preview payload is empty.');
  }

  return {
    theme: parsed.theme === 'dark' ? 'dark' : 'light',
    variant: parsed.variant === 'note' || parsed.variant === 'comment' ? parsed.variant : 'article',
    xml: parsed.xml,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function showError(rootElement: HTMLElement, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  window.__HAKLEX_LITEXML_PREVIEW_ERROR__ = message;
  rootElement.innerHTML = `<pre class="haklex-html-error">${escapeHtml(message)}</pre>`;
}

function main(): void {
  const rootElement = document.getElementById('haklex-litexml-root');
  if (!rootElement) {
    throw new Error('Missing LiteXML preview root.');
  }

  try {
    const payload = readPayload();
    const registry = createDefaultRegistry();
    const editorState = deserializeFromXml(payload.xml, registry);
    const root = createRoot(rootElement);
    root.render(
      <HtmlRenderer theme={payload.theme} value={editorState} variant={payload.variant} />,
    );
    window.__HAKLEX_LITEXML_PREVIEW_READY__ = true;
  } catch (error) {
    showError(rootElement, error);
  }
}

main();
