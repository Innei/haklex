import { allEditNodes } from '../config-edit';
import { ExtraNodesProvider } from '../context/ExtraNodesContext';
import { ImageUploadProvider } from '../context/ImageUploadContext';
import { VideoUploadProvider } from '../context/VideoUploadContext';
import { AlertPlugin } from '../plugins/AlertPlugin';
import { BlockIdPlugin } from '../plugins/BlockIdPlugin';
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
  children,
  ...shellProps
}: RichEditorProps) {
  const nodes = extraNodes ? [...allEditNodes, ...extraNodes] : allEditNodes;
  const resolvedImageUpload = imageUpload ?? defaultImageUpload;

  return (
    <ImageUploadProvider upload={resolvedImageUpload}>
      <VideoUploadProvider upload={videoUpload ?? null}>
        <ExtraNodesProvider extraNodes={extraNodes}>
          <RichEditorShell nodes={nodes} {...shellProps}>
            <CorePlugins />
            <ImagePlugin />
            <ImageUploadPlugin onUpload={resolvedImageUpload} />
            {videoUpload ? <VideoUploadPlugin onUpload={videoUpload} /> : null}
            <KaTeXPlugin />
            <AlertPlugin />
            <MermaidPlugin />
            <LinkFaviconPlugin />
            <BlockIdPlugin />
            <TextSelectionPlugin />
            {children}
          </RichEditorShell>
        </ExtraNodesProvider>
      </VideoUploadProvider>
    </ImageUploadProvider>
  );
}
