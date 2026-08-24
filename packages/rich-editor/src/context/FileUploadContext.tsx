import type { ReactNode } from 'react';
import { createContext, use } from 'react';

import type { FileUploadFn } from '../plugins/FileUploadPlugin';

const FileUploadContext = createContext<FileUploadFn | null>(null);

export function FileUploadProvider({
  upload,
  children,
}: {
  upload: FileUploadFn | null;
  children: ReactNode;
}) {
  return <FileUploadContext.Provider value={upload}>{children}</FileUploadContext.Provider>;
}

export function useFileUpload(): FileUploadFn | null {
  return use(FileUploadContext);
}
