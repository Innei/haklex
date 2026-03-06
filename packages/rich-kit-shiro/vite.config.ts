import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  entry: {
    index: 'src/index.ts',
    editor: 'src/editor.tsx',
    renderer: 'src/renderer.tsx',
    'exports/nodes': 'src/exports/nodes.ts',
    'exports/renderers': 'src/exports/renderers.ts',
    'exports/renderers-edit': 'src/exports/renderers-edit.ts',
    'exports/plugins': 'src/exports/plugins.ts',
    'exports/editor-core': 'src/exports/editor-core.ts',
    'exports/excalidraw': 'src/exports/excalidraw.ts',
    'exports/style': 'src/exports/style.ts',
    'exports/markdown': 'src/exports/markdown.ts',
  },
}).then((config) => ({
  ...config,
  build: {
    ...config.build,
    cssCodeSplit: true,
  },
}))
