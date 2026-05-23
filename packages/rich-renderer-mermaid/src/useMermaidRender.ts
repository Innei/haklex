import type { ColorScheme } from '@haklex/rich-editor/static';
import { useColorScheme } from '@haklex/rich-editor/static';
import { renderMermaidSVG } from 'beautiful-mermaid';
import { useMemo } from 'react';

const LIGHT_PALETTE = { bg: '#ffffff', fg: '#262626' } as const;
const DARK_PALETTE = { bg: '#171717', fg: '#fafafa' } as const;

function svgToDataUrl(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = '';
  for (const byte of bytes) binary += String.fromCodePoint(byte);
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

function readDimensions(svg: string): { width?: number; height?: number } {
  const match = svg.match(/viewBox="\s*(?:[\d.-]+\s+){2}([\d.]+)\s+([\d.]+)/);
  if (!match) return {};
  return {
    width: Number.parseFloat(match[1]),
    height: Number.parseFloat(match[2]),
  };
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
      const palette = effectiveColorScheme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
      const svg = renderMermaidSVG(content, {
        bg: palette.bg,
        fg: palette.fg,
      });
      const { width, height } = readDimensions(svg);
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
