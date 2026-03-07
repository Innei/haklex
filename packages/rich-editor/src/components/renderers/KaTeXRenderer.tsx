import { useEffect, useState } from 'react';

export interface KaTeXRendererProps {
  displayMode: boolean;
  equation: string;
}

type KaTeXModule = {
  default: {
    renderToString: (eq: string, opts: { displayMode: boolean; throwOnError: boolean }) => string;
  };
};
let katexModule: KaTeXModule | null = null;
let katexLoadPromise: Promise<KaTeXModule> | null = null;

function loadKaTeX(): Promise<KaTeXModule> {
  if (katexModule) return Promise.resolve(katexModule);
  if (!katexLoadPromise) {
    katexLoadPromise = import('katex').then((mod) => {
      katexModule = mod as unknown as KaTeXModule;
      return katexModule;
    });
  }
  return katexLoadPromise;
}

export function KaTeXRenderer({ equation, displayMode }: KaTeXRendererProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadKaTeX()
      .then((katex) => {
        if (cancelled) return;
        const rendered = katex.default.renderToString(equation, {
          displayMode,
          throwOnError: false,
        });
        setHtml(rendered);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setHtml(null);
        setError('KaTeX is not available');
      });

    return () => {
      cancelled = true;
    };
  }, [equation, displayMode]);

  if (error) {
    return <code className="rich-katex-fallback">{equation}</code>;
  }

  if (html) {
    return (
      <span
        className={displayMode ? 'rich-katex-block' : 'rich-katex-inline'}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return <code className="rich-katex-fallback">{equation}</code>;
}
