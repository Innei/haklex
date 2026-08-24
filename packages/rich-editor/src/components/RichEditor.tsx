import { allEditNodes } from '../config-edit';
import { ExtraNodesProvider } from '../context/ExtraNodesContext';
import { FileUploadProvider } from '../context/FileUploadContext';
import { ImagePreprocessProvider } from '../context/ImagePreprocessContext';
import { ImageUploadProvider } from '../context/ImageUploadContext';
import { VideoUploadProvider } from '../context/VideoUploadContext';
import { AlertPlugin } from '../plugins/AlertPlugin';
import { BlockIdPlugin } from '../plugins/BlockIdPlugin';
import { FileUploadPlugin } from '../plugins/FileUploadPlugin';
import { ImagePlugin } from '../plugins/ImagePlugin';
import { defaultImageUpload, ImageUploadPlugin } from '../plugins/ImageUploadPlugin';
import { KaTeXPlugin } from '../plugins/KaTeXPlugin';
import { LinkFaviconPlugin } from '../plugins/LinkFaviconPlugin';
import { MermaidPlugin } from '../plugins/MermaidPlugin';
import { TextSelectionPlugin } from '../plugins/TextSelectionPlugin';
import { VideoUploadPlugin } from '../plugins/VideoUploadPlugin';
import type { RichEditorProps } from '../types';
import { CorePlugins } from './CorePlugins';
import { RichEditorShell } from './RichEditorShell';

export function RichEditor({
  extraNodes,
  imageUpload,
  videoUpload,
  fileUpload,
  children,
  ...shellProps
}: RichEditorProps) {
  const nodes = extraNodes ? [...allEditNodes, ...extraNodes] : allEditNodes;
  const resolvedImageUpload = imageUpload ?? defaultImageUpload;

  return (
    <ImagePreprocessProvider>
      <ImageUploadProvider upload={resolvedImageUpload}>
        <VideoUploadProvider upload={videoUpload ?? null}>
          <FileUploadProvider upload={fileUpload ?? null}>
            <ExtraNodesProvider extraNodes={extraNodes}>
              <RichEditorShell nodes={nodes} {...shellProps}>
                <CorePlugins />
                <ImagePlugin />
                <ImageUploadPlugin onUpload={resolvedImageUpload} />
                {videoUpload ? <VideoUploadPlugin onUpload={videoUpload} /> : null}
                {fileUpload ? <FileUploadPlugin onUpload={fileUpload} /> : null}
                <KaTeXPlugin />
                <AlertPlugin />
                <MermaidPlugin />
                <LinkFaviconPlugin />
                <BlockIdPlugin />
                <TextSelectionPlugin />
                {children}
              </RichEditorShell>
            </ExtraNodesProvider>
          </FileUploadProvider>
        </VideoUploadProvider>
      </ImageUploadProvider>
    </ImagePreprocessProvider>
  );
}
