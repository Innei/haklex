import type { ReactNode } from 'react';
import { createContext, use } from 'react';

import type { ImageUploadFn } from '../plugins/ImageUploadPlugin';

const ImageUploadContext = createContext<ImageUploadFn | null>(null);

export function ImageUploadProvider({
  upload,
  children,
}: {
  upload: ImageUploadFn;
  children: ReactNode;
}) {
  return <ImageUploadContext.Provider value={upload}>{children}</ImageUploadContext.Provider>;
}

export function useImageUpload(): ImageUploadFn | null {
  return use(ImageUploadContext);
}
