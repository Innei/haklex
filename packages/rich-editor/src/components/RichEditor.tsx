import { allEditNodes } from '../config-edit';
import { ImageUploadProvider } from '../context/ImageUploadContext';
import { AlertPlugin } from '../plugins/AlertPlugin';
import { BlockIdPlugin } from '../plugins/BlockIdPlugin';
import { ImagePlugin } from '../plugins/ImagePlugin';
import { defaultImageUpload, ImageUploadPlugin } from '../plugins/ImageUploadPlugin';
import { KaTeXPlugin } from '../plugins/KaTeXPlugin';
import { LinkFaviconPlugin } from '../plugins/LinkFaviconPlugin';
import { MermaidPlugin } from '../plugins/MermaidPlugin';
import type { RichEditorProps } from '../types';
import { CorePlugins } from './CorePlugins';
import { RichEditorShell } from './RichEditorShell';

export function RichEditor({ extraNodes, imageUpload, children, ...shellProps }: RichEditorProps) {
  const nodes = extraNodes ? [...allEditNodes, ...extraNodes] : allEditNodes;
  const resolvedImageUpload = imageUpload ?? defaultImageUpload;

  return (
    <ImageUploadProvider upload={resolvedImageUpload}>
      <RichEditorShell nodes={nodes} {...shellProps}>
        <CorePlugins />
        <ImagePlugin />
        <ImageUploadPlugin onUpload={resolvedImageUpload} />
        <KaTeXPlugin />
        <AlertPlugin />
        <MermaidPlugin />
        <LinkFaviconPlugin />
        <BlockIdPlugin />
        {children}
      </RichEditorShell>
    </ImageUploadProvider>
  );
}
