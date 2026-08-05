let highlighterPromise: Promise<any> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki/bundle/full').then((mod) =>
      mod.createHighlighter({
        langs: [],
        themes: ['github-light', 'github-dark'],
      }),
    );
  }
  return highlighterPromise;
}

export async function getHighlighterWithLang(language: string) {
  const highlighter = await getHighlighter();

  if (language && language !== 'text' && language !== 'plaintext') {
    const loaded: string[] = highlighter.getLoadedLanguages();
    if (!loaded.includes(language)) {
      try {
        await highlighter.loadLanguage(language);
      } catch {
        // Language not available in the bundle.
      }
    }
  }

  return highlighter;
}

export const SHIKI_DUAL_THEMES = {
  light: 'github-light',
  dark: 'github-dark',
} as const;
