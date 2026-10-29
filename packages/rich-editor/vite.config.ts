import { createViteConfig } from '../vite.shared';

export default createViteConfig({
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  entry: {
    'index': 'src/index.ts',
    'recycler-entry': 'src/recycler-entry.ts',
    'static-entry': 'src/static-entry.ts',
    'styles-entry': 'src/styles-entry.ts',
    'nodes-entry': 'src/nodes-entry.ts',
    'plugins-entry': 'src/plugins-entry.ts',
    'commands-entry': 'src/commands-entry.ts',
    'command-registry-entry': 'src/command-registry-entry.ts',
    'renderers-entry': 'src/renderers-entry.ts',
    'virtualization-entry': 'src/virtualization-entry.ts',
  },
});
