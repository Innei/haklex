import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import type { Alias, Plugin } from 'vite';
import { defineConfig } from 'vite';

// Dev-only: resolve workspace style entry to source instead of dist output.
// - Prefer src/style.css for plain CSS packages.
// - Fall back to src/styles.css.ts for VE packages when imported from JS.
// - If imported from CSS (@import), VE entries resolve to empty CSS.
function watchWorkspacePlugin(): Plugin {
  const packagesDir = path.resolve(__dirname, '../packages');
  const srcDirs: string[] = [];
  for (const entry of readdirSync(packagesDir)) {
    if (entry.startsWith('rich-')) {
      const srcDir = path.resolve(packagesDir, entry, 'src');
      if (existsSync(srcDir)) {
        srcDirs.push(srcDir);
      }
    }
  }

  return {
    name: 'watch-workspace-packages',
    apply: 'serve',
    configureServer(server) {
      for (const dir of srcDirs) {
        server.watcher.add(dir);
      }
      server.watcher.on('change', (file) => {
        if (!srcDirs.some((dir) => file.startsWith(dir))) return;
        const mods = server.moduleGraph.getModulesByFile(file);
        if (mods?.size) {
          for (const mod of mods) server.moduleGraph.invalidateModule(mod);
        }
        server.hot.send({ type: 'full-reload' });
      });
    },
  };
}

function workspaceCssPlugin(): Plugin {
  const scopes = new Set(['@haklex', '@shiro']);
  const EMPTY_PREFIX = '\0empty-css:';
  const VE_PREFIX = '\0ve-css:';
  const RENDERER_STYLE_PREFIX = '\0renderer-style:';

  return {
    name: 'workspace-css-dev',
    enforce: 'pre',
    resolveId(id, importer) {
      // style-renderer.css: plain CSS @import breaks HMR for upstream VE packages.
      // Resolve to style-renderer.ts so each pkg/style.css gets proper VE resolution.
      const rendererStyleMatch = id.match(/^@([\w-]+)\/([\w-]+)\/style-renderer\.css$/);
      if (rendererStyleMatch) {
        const scope = `@${rendererStyleMatch[1]}`;
        const pkgDir = rendererStyleMatch[2];
        if (scopes.has(scope)) {
          const srcRendererTs = path.resolve(
            __dirname,
            `../packages/${pkgDir}/src/style-renderer.ts`,
          );
          if (existsSync(srcRendererTs)) {
            return `${RENDERER_STYLE_PREFIX}${srcRendererTs}`;
          }
        }
      }

      const m = id.match(/^@([\w-]+)\/([\w-]+)\/style\.css$/);
      if (!m) return null;

      const scope = `@${m[1]}`;
      if (!scopes.has(scope)) return null;

      const pkgDir = m[2];
      const srcIndex = path.resolve(__dirname, `../packages/${pkgDir}/src/index.ts`);
      const srcCss = path.resolve(__dirname, `../packages/${pkgDir}/src/style.css`);
      const srcVeCss = path.resolve(__dirname, `../packages/${pkgDir}/src/styles.css.ts`);

      if (existsSync(srcIndex)) {
        if (importer?.endsWith('.css')) {
          // Keep CSS graph valid; JS graph will import source modules and emit VE CSS.
          return existsSync(srcCss) ? srcCss : `${EMPTY_PREFIX}${id}`;
        }
        return `${VE_PREFIX}${srcIndex}`;
      }

      if (existsSync(srcCss)) {
        return srcCss;
      }

      if (!existsSync(srcVeCss)) {
        return null;
      }

      // For CSS @import, VE source cannot be parsed as CSS.
      if (importer?.endsWith('.css')) {
        return `${EMPTY_PREFIX}${id}`;
      }

      // For JS imports, route style.css to VE source for real-time compilation.
      return `${VE_PREFIX}${srcVeCss}`;
    },
    load(id) {
      if (id.startsWith(EMPTY_PREFIX)) return '';
      if (id.startsWith(VE_PREFIX)) {
        const sourcePath = id.slice(VE_PREFIX.length);
        return `import ${JSON.stringify(sourcePath)}`;
      }
      if (id.startsWith(RENDERER_STYLE_PREFIX)) {
        const sourcePath = id.slice(RENDERER_STYLE_PREFIX.length);
        return `import ${JSON.stringify(sourcePath)}`;
      }
    },
  };
}

function workspaceBuildStyleAliases(): Alias[] {
  const packagesDir = path.resolve(__dirname, '../packages');
  const aliases: Alias[] = [];

  for (const entry of readdirSync(packagesDir)) {
    const pkgDir = path.resolve(packagesDir, entry);
    const styleEntryCandidates = [
      path.resolve(pkgDir, 'src/style.ts'),
      path.resolve(pkgDir, 'src/styles-entry.ts'),
      path.resolve(pkgDir, 'src/index.ts'),
      path.resolve(pkgDir, 'src/index.tsx'),
    ];
    const styleEntry = styleEntryCandidates.find((candidate) => existsSync(candidate));
    if (styleEntry) {
      aliases.push({
        find: `@haklex/${entry}/style.css`,
        replacement: styleEntry,
      });
    }

    const rendererStyleEntry = path.resolve(pkgDir, 'src/style-renderer.ts');
    if (existsSync(rendererStyleEntry)) {
      aliases.push({
        find: `@haklex/${entry}/style-renderer.css`,
        replacement: rendererStyleEntry,
      });
    }
  }

  return aliases;
}

export default defineConfig(({ command }) => ({
  plugins: [
    watchWorkspacePlugin(),
    workspaceCssPlugin(),
    vanillaExtractPlugin(),
    codeInspectorPlugin({ bundler: 'vite', hotKeys: ['altKey'] }),
    react(),
  ],
  server: {
    port: 5188,
    open: true,
  },

  define: {
    'process.env.IS_PREACT': '"false"',
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  optimizeDeps: {
    include: ['react-intersection-observer', 'react-photo-view', '@excalidraw/excalidraw'],
  },
  resolve: {
    alias: command === 'build' ? workspaceBuildStyleAliases() : [],
    dedupe: [
      'lexical',
      '@lexical/code-core',
      '@lexical/link',
      '@lexical/list',
      '@lexical/markdown',
      '@lexical/react',
      '@lexical/rich-text',
      '@lexical/table',
      'react',
      'react-dom',
      'react/jsx-runtime',

      'react-intersection-observer',
      'react-photo-view',
      '@excalidraw/excalidraw',
    ],
  },
}));
