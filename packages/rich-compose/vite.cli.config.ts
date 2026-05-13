import { builtinModules } from 'node:module';
import path from 'node:path';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { type ConfigEnv, defineConfig, type UserConfig } from 'vite';

function isExternal(id: string): boolean {
  return id.startsWith('node:') || builtinModules.includes(id);
}

const nodeCliConfig: UserConfig = {
  plugins: [vanillaExtractPlugin()],
  build: {
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      external: isExternal,
      output: {
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: 'litexml-to-html.mjs',
        preserveModules: false,
      },
    },
    ssr: path.resolve(process.cwd(), 'src/cli/litexml-to-html.ts'),
    target: 'es2020',
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
};

const browserPreviewConfig: UserConfig = {
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [vanillaExtractPlugin()],
  build: {
    emptyOutDir: false,
    lib: {
      cssFileName: 'litexml-html-preview-client',
      entry: path.resolve(process.cwd(), 'src/cli/litexml-html-preview-client.tsx'),
      fileName: () => 'litexml-html-preview-client.js',
      formats: ['iife'],
      name: 'HaklexLiteXmlPreview',
    },
    minify: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    target: 'es2020',
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
};

export default defineConfig((env: ConfigEnv) => {
  if (env.mode === 'browser-preview') {
    return browserPreviewConfig;
  }

  return nodeCliConfig;
});
