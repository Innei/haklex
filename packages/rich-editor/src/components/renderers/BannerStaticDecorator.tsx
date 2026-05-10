import type { SerializedEditorState } from 'lexical';

import { useNestedContentRenderer } from '../../context/NestedContentRendererContext';
import type { BannerType } from '../../nodes/BannerNode';
import { BANNER_NODE_KEY } from '../../types/renderer-keys';
import { RendererWrapper } from '../RendererWrapper';
import { BannerRenderer } from './BannerRenderer';

interface BannerStaticDecoratorProps {
  bannerType: BannerType;
  contentState: SerializedEditorState;
}

export function BannerStaticDecorator({ bannerType, contentState }: BannerStaticDecoratorProps) {
  const renderContent = useNestedContentRenderer();

  return (
    <div className="rich-banner-inner">
      <RendererWrapper
        defaultRenderer={BannerRenderer}
        props={{ type: bannerType }}
        rendererKey={BANNER_NODE_KEY}
      />
      <div className="rich-banner-content">{renderContent(contentState)}</div>
    </div>
  );
}
