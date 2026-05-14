import { builtinModules } from 'node:module';
import path from 'node:path';

import { defineConfig } from 'vite';

const NODE_BUILTINS = new Set(builtinModules);

function isExternal(id: string): boolean {
  if (id.startsWith('node:')) return true;
  return NODE_BUILTINS.has(id);
}

export default defineConfig({
  build: {
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      external: isExternal,
      output: {
        dir: 'dist',
        entryFileNames: 'cli.mjs',
        format: 'es',
        banner: '#!/usr/bin/env node',
        preserveModules: false,
      },
    },
    ssr: path.resolve(process.cwd(), 'src/cli.ts'),
    target: 'es2020',
  },
  ssr: {
    noExternal: true,
  },
});
