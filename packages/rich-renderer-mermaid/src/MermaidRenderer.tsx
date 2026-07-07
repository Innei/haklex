import type { MermaidRendererProps } from '@haklex/rich-editor/renderers';
import type { ColorScheme } from '@haklex/rich-editor/static';
import type { FC } from 'react';

import { estimateMermaidHeight } from './estimate-height';
import * as css from './styles.css';
import { useMermaidRender } from './useMermaidRender';

export const MermaidRenderer: FC<MermaidRendererProps & { colorScheme?: ColorScheme }> = ({
  content,
  colorScheme,
}) => {
  const { error, imgSrc, width, height } = useMermaidRender(content, colorScheme);

  if (!imgSrc) {
    // Estimated height only stabilizes the placeholder; the rendered image
    // carries its intrinsic dimensions and must not be padded by the estimate.
    return (
      <div className={css.mermaidError} style={{ minHeight: estimateMermaidHeight(content) }}>
        {error || 'Render failed'}
      </div>
    );
  }

  return (
    <div className={css.mermaidContainer} style={{ cursor: 'default' }}>
      <img alt="Mermaid diagram" height={height} src={imgSrc} width={width} />
    </div>
  );
};

export default MermaidRenderer;
