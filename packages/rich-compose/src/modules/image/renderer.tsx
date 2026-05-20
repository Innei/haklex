import type { ImageRendererProps } from '@haklex/rich-editor/renderers';
import { ImageRenderer } from '@haklex/rich-renderer-image/static';
import { type ComponentType, useRef } from 'react';

import { useImageConfig } from './module-config';
import { useImageRegistry, useRegisterImage } from './registry';
import type { OnImageClick, RichImageInfo } from './types';

export { ImageRenderer };

function toImageInfo(props: ImageRendererProps): RichImageInfo {
  return {
    src: props.src,
    alt: props.altText || undefined,
    width: props.width,
    height: props.height,
    caption: props.caption,
    thumbhash: props.thumbhash,
  };
}

function InteractiveImageRenderer({
  onImageClick,
  ...props
}: ImageRendererProps & { onImageClick: OnImageClick }) {
  const figureRef = useRef<HTMLElement>(null);
  const registry = useImageRegistry();
  const info = toImageInfo(props);
  useRegisterImage(figureRef, info);

  const handleActivate = (target: HTMLElement) => {
    if (!registry) {
      onImageClick({ current: info, images: [info], index: 0, target });
      return;
    }
    const { images, index } = registry.resolve(target);
    onImageClick({ current: images[index] ?? info, images, index, target });
  };

  return <ImageRenderer {...props} ref={figureRef} onActivate={handleActivate} />;
}

export const ComposedImageRenderer: ComponentType<ImageRendererProps> = (props) => {
  const { onImageClick } = useImageConfig();
  if (!onImageClick) return <ImageRenderer {...props} />;
  return <InteractiveImageRenderer {...props} onImageClick={onImageClick} />;
};
