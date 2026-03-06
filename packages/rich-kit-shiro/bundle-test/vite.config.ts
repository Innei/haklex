import { resolve } from 'node:path'

import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      // resolve workspace packages to their source
    },
  },
  plugins: [
    visualizer({
      filename: resolve(__dirname, 'stats.html'),
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
    minify: true,
    sourcemap: false,
  },
})
