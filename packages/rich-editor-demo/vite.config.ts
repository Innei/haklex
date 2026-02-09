import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5188,
    open: true,
  },
  optimizeDeps: {
    include: [
      '@emotion/is-prop-valid',
      'react-intersection-observer',
      'react-photo-view',
      'motion',
    ],
  },
  resolve: {
    dedupe: [
      'lexical',
      '@lexical/code',
      '@lexical/link',
      '@lexical/list',
      '@lexical/markdown',
      '@lexical/react',
      '@lexical/rich-text',
      '@lexical/table',
      'react',
      'react-dom',
      'react/jsx-runtime',
      'motion',
      'react-intersection-observer',
      'react-photo-view',
    ],
  },
})
