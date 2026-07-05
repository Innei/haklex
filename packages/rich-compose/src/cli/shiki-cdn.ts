const SHIKI_CDN_URL = 'https://esm.sh/shiki@4.3.0/bundle/web?bundle';

interface HighlighterLike {
  codeToHtml: (code: string, options?: unknown) => string;
  codeToTokens?: (code: string, options?: unknown) => unknown;
  getLoadedLanguages?: () => string[];
  loadLanguage?: (...languages: unknown[]) => Promise<void>;
}

interface ShikiBundleLike {
  createHighlighter: (options: unknown) => Promise<HighlighterLike>;
}

let shikiBundlePromise: Promise<ShikiBundleLike> | null = null;

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const createPlainHighlighter = () => ({
  codeToTokens(code: string) {
    return {
      bg: 'transparent',
      fg: 'inherit',
      rootStyle: '',
      tokens: code.split('\n').map((line) => [
        {
          bgColor: 'transparent',
          color: 'inherit',
          content: line,
          htmlAttrs: {},
          htmlStyle: {},
          offset: 0,
        },
      ]),
    };
  },
  codeToHtml(code: string) {
    const lines = escapeHtml(code)
      .split('\n')
      .map((line) => `<span class="line">${line}</span>`)
      .join('\n');

    return `<pre class="shiki shiki-themes"><code>${lines}</code></pre>`;
  },
  getLoadedLanguages: () => ['text', 'plaintext'],
  loadLanguage: async () => {},
});

const loadShikiBundle = async () => {
  shikiBundlePromise ??= import(/* @vite-ignore */ SHIKI_CDN_URL) as Promise<ShikiBundleLike>;
  return shikiBundlePromise;
};

export const bundledLanguagesInfo = [];
export const bundledLanguages = {};

export async function createHighlighter(options: unknown) {
  try {
    const mod = await loadShikiBundle();
    return await mod.createHighlighter(options);
  } catch {
    return createPlainHighlighter();
  }
}

export async function codeToHtml(
  code: string,
  options: { lang?: string; theme?: string; themes?: Record<string, string> },
) {
  const highlighter = await createHighlighter({
    langs: [options.lang ?? 'text'],
    themes: options.themes ? Object.values(options.themes) : [options.theme ?? 'github-light'],
  });

  return highlighter.codeToHtml(code, options);
}
