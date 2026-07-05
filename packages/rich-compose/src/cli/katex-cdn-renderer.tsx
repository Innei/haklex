import { useEffect, useState } from 'react';

export interface KaTeXRendererProps {
  displayMode: boolean;
  equation: string;
}

interface KaTeXLike {
  renderToString: (
    equation: string,
    options: { displayMode: boolean; throwOnError: boolean },
  ) => string;
}

interface KaTeXModuleLike {
  default?: KaTeXLike;
  renderToString?: KaTeXLike['renderToString'];
}

const KATEX_CDN_URL = 'https://esm.sh/katex@0.17.0?bundle';

let katexPromise: Promise<KaTeXLike> | null = null;

const loadKaTeX = async (): Promise<KaTeXLike> => {
  katexPromise ??= import(/* @vite-ignore */ KATEX_CDN_URL).then((mod: KaTeXModuleLike) => {
    const katex = mod.default ?? mod;
    if (!katex.renderToString) {
      throw new Error('KaTeX CDN module does not export renderToString.');
    }
    return katex as KaTeXLike;
  });

  return katexPromise;
};

export function KaTeXRenderer({ equation, displayMode }: KaTeXRendererProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setError(false);
    setHtml(null);

    loadKaTeX()
      .then((katex) => {
        if (cancelled) return;
        setHtml(
          katex.renderToString(equation, {
            displayMode,
            throwOnError: false,
          }),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [displayMode, equation]);

  if (html && !error) {
    return (
      <span
        className={displayMode ? 'rich-katex-block' : 'rich-katex-inline'}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return <code className="rich-katex-fallback">{equation}</code>;
}
