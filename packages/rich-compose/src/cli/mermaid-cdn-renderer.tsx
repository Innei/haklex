import type { ColorScheme } from '@haklex/rich-editor/static';
import { useColorScheme } from '@haklex/rich-editor/static';
import { useEffect, useId, useState } from 'react';

import { initialize, render } from './mermaid-cdn';

export interface MermaidRendererProps {
  content: string;
  onContentChange?: (content: string) => void;
}

interface RenderState {
  error: string;
  height?: number;
  imgSrc: string;
  loading: boolean;
  width?: number;
}

function svgToDataUrl(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = '';
  for (const byte of bytes) binary += String.fromCodePoint(byte);
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

function readDimensions(svg: string): { height?: number; width?: number } {
  const match = svg.match(/viewBox="\s*(?:[\d.-]+\s+){2}([\d.]+)\s+([\d.]+)/);
  if (!match) return {};

  return {
    height: Number.parseFloat(match[2]),
    width: Number.parseFloat(match[1]),
  };
}

function buildRenderId(reactId: string): string {
  return `haklex-mermaid-${reactId.replaceAll(/[^\w-]/g, '')}`;
}

export function MermaidRenderer({
  content,
  colorScheme: preferredColorScheme,
}: MermaidRendererProps & { colorScheme?: ColorScheme }) {
  const colorScheme = useColorScheme();
  const effectiveColorScheme = preferredColorScheme ?? colorScheme;
  const reactId = useId();
  const renderId = buildRenderId(reactId);
  const [state, setState] = useState<RenderState>({
    error: '',
    imgSrc: '',
    loading: Boolean(content),
  });

  useEffect(() => {
    let cancelled = false;

    if (!content) {
      setState({ error: '', imgSrc: '', loading: false });
      return;
    }

    setState((current) => ({ ...current, error: '', loading: true }));

    Promise.resolve()
      .then(async () => {
        const theme = effectiveColorScheme === 'dark' ? 'dark' : 'default';
        initialize({
          securityLevel: 'strict',
          startOnLoad: false,
          theme,
        });

        const { svg } = await render(renderId, content);
        const { height, width } = readDimensions(svg);

        if (cancelled) return;
        setState({
          error: '',
          height,
          imgSrc: svgToDataUrl(svg),
          loading: false,
          width,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          error: error instanceof Error ? error.message : String(error),
          imgSrc: '',
          loading: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [content, effectiveColorScheme, renderId]);

  if (state.imgSrc) {
    return (
      <div className="rich-mermaid-container">
        <img alt="Mermaid diagram" height={state.height} src={state.imgSrc} width={state.width} />
      </div>
    );
  }

  return (
    <div className="rich-mermaid-error">
      {state.loading ? 'Rendering diagram...' : state.error || 'Render failed'}
    </div>
  );
}
