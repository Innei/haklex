import { createViteConfig } from '../vite.shared';

export default createViteConfig({
  entry: {
    index: 'src/index.ts',
    editor: 'src/editor-entry.ts',
    scene: 'src/scene-entry.ts',
    static: 'src/static.ts',
  },
});
