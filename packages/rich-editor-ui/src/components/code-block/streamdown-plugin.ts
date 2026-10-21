import type { TokensResult } from '@pierre/highlights';

import { getLoadedHighlighter, loadHighlighter, tokenizeCode } from './highlight';
import { codeLanguages } from './languages';

interface StreamdownHighlightOptions {
  code: string;
  isIncomplete?: boolean;
  language: string;
}

const CACHE_LIMIT = 200;
const cache = new Map<string, TokensResult>();

// Streamdown's renderer reads Shiki's variable names for the dark theme.
const STREAMDOWN_VARIABLE_PREFIX = '--shiki-';

function tokenize(code: string, language: string, isIncomplete: boolean) {
  const runtime = getLoadedHighlighter();
  if (!runtime) return null;

  const key = `${language}\n${code}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const result = tokenizeCode(runtime, code, language, STREAMDOWN_VARIABLE_PREFIX);
  if (!isIncomplete) {
    cache.set(key, result);
    if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  }
  return result;
}

export const streamdownCodePlugin = {
  name: 'shiki' as const,
  type: 'code-highlighter' as const,
  getSupportedLanguages: () => codeLanguages.map((language) => language.id),
  getThemes: () => ['github-light', 'github-dark'] as [string, string],
  supportsLanguage: () => true,
  highlight(
    { code, isIncomplete = false, language }: StreamdownHighlightOptions,
    callback?: (result: TokensResult) => void,
  ): TokensResult | null {
    const ready = tokenize(code, language, isIncomplete);
    if (ready) return ready;

    loadHighlighter()
      .then(() => {
        const result = tokenize(code, language, isIncomplete);
        if (result) callback?.(result);
      })
      .catch(() => {});
    return null;
  },
};
