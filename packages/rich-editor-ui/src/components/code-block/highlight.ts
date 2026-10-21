import type { Lang, ThemedToken, TokensResult } from '@pierre/highlights';

export type HighlightColorScheme = 'dark' | 'light';

export type HighlightsRuntime = Awaited<ReturnType<typeof loadRuntime>>;

const fallbackLanguages: Record<string, Lang> = {
  ini: 'toml',
  plaintext: 'text',
  properties: 'toml',
};

let runtimePromise: Promise<HighlightsRuntime> | null = null;
let loadedRuntime: HighlightsRuntime | null = null;

async function loadRuntime() {
  const [core, light, dark] = await Promise.all([
    import('@pierre/highlights'),
    import('@pierre/highlights/themes/github-light'),
    import('@pierre/highlights/themes/github-dark'),
  ]);
  return { core, dark: dark.default, light: light.default };
}

export function loadHighlighter(): Promise<HighlightsRuntime> {
  runtimePromise ??= loadRuntime().then(
    (runtime) => {
      loadedRuntime = runtime;
      return runtime;
    },
    (error: unknown) => {
      runtimePromise = null;
      throw error;
    },
  );
  return runtimePromise;
}

export function getLoadedHighlighter(): HighlightsRuntime | null {
  return loadedRuntime;
}

export function tokenizeCode(
  runtime: HighlightsRuntime,
  code: string,
  language: string | undefined,
  cssVariablePrefix?: string,
): TokensResult {
  const { core, dark, light } = runtime;
  const lang = resolveHighlightLanguage(language, core.isSupportedLanguage);
  return core.codeToTokens(code, { cssVariablePrefix, lang, themes: { light, dark } });
}

function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function tokenStyle(token: ThemedToken): string {
  if (token.htmlStyle) {
    return Object.entries(token.htmlStyle)
      .map(([property, value]) => `${property}:${value}`)
      .join(';');
  }
  const declarations = token.color ? [`color:${token.color}`] : [];
  const flags = token.fontStyle ?? 0;
  if (flags & 1) declarations.push('font-style:italic');
  if (flags & 2) declarations.push('font-weight:bold');
  if (flags & 4) declarations.push('text-decoration:underline');
  return declarations.join(';');
}

function renderToken(token: ThemedToken): string {
  const style = tokenStyle(token);
  const attr = style ? ` style="${escapeHtml(style).replaceAll('"', '&quot;')}"` : '';
  return `<span${attr}>${escapeHtml(token.content)}</span>`;
}

export function resolveHighlightLanguage(
  language: string | undefined,
  isSupported: (lang: string) => boolean,
): Lang {
  const id = language?.trim().toLowerCase() || 'text';
  const lang = fallbackLanguages[id] ?? id;
  return (isSupported(lang) ? lang : 'text') as Lang;
}

export async function highlightCode(
  code: string,
  language: string | undefined,
  colorScheme?: HighlightColorScheme,
): Promise<string> {
  const runtime = await loadHighlighter();
  const { core, dark, light } = runtime;
  const { tokens, fg, bg } = colorScheme
    ? core.codeToTokens(code, {
        lang: resolveHighlightLanguage(language, core.isSupportedLanguage),
        theme: colorScheme === 'dark' ? dark : light,
      })
    : tokenizeCode(runtime, code, language);

  const preClass = colorScheme ? 'highlights' : 'highlights highlights-themes';
  const lines = tokens
    .map((line) => `<span class="line">${line.map(renderToken).join('')}</span>`)
    .join('\n');
  return `<pre class="${preClass}" style="background-color:${bg};color:${fg}"><code>${lines}</code></pre>`;
}
