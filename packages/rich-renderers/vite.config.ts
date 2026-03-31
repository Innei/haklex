import { createViteConfig } from '../vite.shared';

export default createViteConfig({
  vanillaExtract: false,
  entry: {
    'index': 'src/index.ts',
    'config': 'src/config.ts',
    'alert': 'src/alert.ts',
    'banner': 'src/banner.ts',
    'codeblock': 'src/codeblock.ts',
    'gallery': 'src/gallery.ts',
    'image': 'src/image.ts',
    'linkcard': 'src/linkcard.ts',
    'mention': 'src/mention.ts',
    'mermaid': 'src/mermaid-entry.ts',
    'video': 'src/video.ts',
    'excalidraw': 'src/excalidraw.ts',
    'embed': 'src/embed.ts',
    'code-snippet': 'src/code-snippet.ts',
  },
});
