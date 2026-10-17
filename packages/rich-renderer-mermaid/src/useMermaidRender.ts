import type { ColorScheme } from '@haklex/rich-editor/static';
import { useColorScheme } from '@haklex/rich-editor/static';
import { useMemo } from 'react';

import { renderMermaid } from './utils';

function svgToDataUrl(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = '';
  for (const byte of bytes) binary += String.fromCodePoint(byte);
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

export function useMermaidRender(content: string, preferredColorScheme?: ColorScheme) {
  const colorScheme = useColorScheme();
  const effectiveColorScheme = preferredColorScheme ?? colorScheme;

  return useMemo(() => {
    if (!content) {
      return {
        loading: false,
        error: '',
        svg: '',
        imgSrc: '',
        width: undefined as number | undefined,
        height: undefined as number | undefined,
      };
    }

    try {
      const { svg, width, height } = renderMermaid(content, effectiveColorScheme);
      return {
        loading: false,
        error: '',
        svg,
        imgSrc: svgToDataUrl(svg),
        width,
        height,
      };
    } catch (err) {
      return {
        loading: false,
        error: err instanceof Error ? err.message : String(err),
        svg: '',
        imgSrc: '',
        width: undefined as number | undefined,
        height: undefined as number | undefined,
      };
    }
  }, [content, effectiveColorScheme]);
}
