import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      // resolve workspace packages to their source
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
    minify: true,
    sourcemap: false,
  },
});
