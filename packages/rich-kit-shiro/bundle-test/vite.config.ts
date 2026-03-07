import path from 'node:path';

import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      // resolve workspace packages to their source
    },
  },
  plugins: [
    visualizer({
      filename: path.resolve(__dirname, 'stats.html'),
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
    minify: true,
    sourcemap: false,
  },
});
