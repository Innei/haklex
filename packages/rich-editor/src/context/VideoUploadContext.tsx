import type { ReactNode } from 'react';
import { createContext, use } from 'react';

import type { VideoUploadFn } from '../plugins/VideoUploadPlugin';

const VideoUploadContext = createContext<VideoUploadFn | null>(null);

export function VideoUploadProvider({
  upload,
  children,
}: {
  upload: VideoUploadFn | null;
  children: ReactNode;
}) {
  return <VideoUploadContext.Provider value={upload}>{children}</VideoUploadContext.Provider>;
}

export function useVideoUpload(): VideoUploadFn | null {
  return use(VideoUploadContext);
}
