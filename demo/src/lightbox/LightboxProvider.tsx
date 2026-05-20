import 'react-photo-view/dist/react-photo-view.css';

import type { ImageClickPayload, RichImageInfo } from '@haklex/rich-compose';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { PhotoSlider } from 'react-photo-view';

import { subscribeLightbox } from './lightbox-store';

interface LightboxState {
  images: RichImageInfo[];
  index: number;
  visible: boolean;
}

const CLOSED: LightboxState = { images: [], index: 0, visible: false };

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState>(CLOSED);
  const originRef = useRef<HTMLElement | null>(null);

  useEffect(
    () =>
      subscribeLightbox((payload: ImageClickPayload) => {
        originRef.current = payload.target;
        setState({ images: payload.images, index: payload.index, visible: true });
      }),
    [],
  );

  const sliderImages = state.images.map((image, i) => ({
    key: `${image.src}#${i}`,
    src: image.src,
    originRef: i === state.index ? originRef : undefined,
  }));

  return (
    <>
      {children}
      <PhotoSlider
        images={sliderImages}
        index={state.index}
        visible={state.visible}
        onClose={() => setState((prev) => ({ ...prev, visible: false }))}
        onIndexChange={(index) => setState((prev) => ({ ...prev, index }))}
      />
    </>
  );
}
