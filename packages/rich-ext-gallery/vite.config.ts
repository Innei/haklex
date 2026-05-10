import { createViteConfig } from '../vite.shared';

export default createViteConfig({
  entry: {
    index: 'src/index.ts',
    node: 'src/node.ts',
    renderer: 'src/renderer.ts',
    edit: 'src/edit.ts',
    static: 'src/static.ts',
  },
});
