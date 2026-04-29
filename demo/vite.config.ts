import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import type { Alias, Plugin } from 'vite';
import { defineConfig } from 'vite';

import { apiProxyPlugin } from './server/proxy';

const packagesDir = path.resolve(__dirname, '../packages');

type WorkspaceExportTarget = string | { import?: string; types?: string };

function readWorkspacePackages() {
  return readdirSync(packagesDir)
    .map((entry) => {
      const pkgDir = path.resolve(packagesDir, entry);
      const pkgJsonPath = path.resolve(pkgDir, 'package.json');
      if (!existsSync(pkgJsonPath)) return null;

      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as {
        exports?: Record<string, WorkspaceExportTarget> | WorkspaceExportTarget;
        main?: string;
        name?: string;
      };

      if (!pkg.name?.startsWith('@haklex/')) return null;

      return { entry, pkg, pkgDir };
    })
    .filter((pkg): pkg is NonNullable<typeof pkg> => Boolean(pkg));
}

function resolveWorkspaceExportTarget(target: WorkspaceExportTarget | undefined) {
  if (typeof target === 'string') return target;
  return target?.import;
}

function workspacePackageAliases(): Alias[] {
  const aliases: Alias[] = [];

  for (const { pkg, pkgDir } of readWorkspacePackages()) {
    const exports = pkg.exports;
    const exportEntries =
      exports && !Array.isArray(exports) && typeof exports === 'object' && !('import' in exports)
        ? Object.entries(exports)
        : [['.', exports ?? pkg.main]];

    for (const [exportPath, target] of exportEntries) {
      if (exportPath.endsWith('.css')) continue;

      const resolvedTarget = resolveWorkspaceExportTarget(target);
      if (!resolvedTarget?.startsWith('./src/')) continue;

      const suffix = exportPath === '.' ? '' : exportPath.slice(1);
      aliases.push({
        find: new RegExp(`^${pkg.name.replaceAll('/', '\\/')}${suffix.replaceAll('/', '\\/')}$`),
        replacement: path.resolve(pkgDir, resolvedTarget),
      });
    }
  }

  return aliases;
}

function workspaceOptimizeDepsExcludes() {
  const excludes: string[] = [];

  for (const { pkg } of readWorkspacePackages()) {
    excludes.push(pkg.name);

    const exports = pkg.exports;
    if (!exports || typeof exports !== 'object' || Array.isArray(exports) || 'import' in exports) {
      continue;
    }

    for (const exportPath of Object.keys(exports)) {
      if (exportPath === '.' || exportPath.endsWith('.css')) continue;
      excludes.push(`${pkg.name}${exportPath.slice(1)}`);
    }
  }

  return excludes;
}

// Dev-only: resolve workspace style entry to source instead of dist output.
// - Prefer src/style.css for plain CSS packages.
// - Fall back to src/styles.css.ts for VE packages when imported from JS.
// - If imported from CSS (@import), VE entries resolve to empty CSS.
function watchWorkspacePlugin(): Plugin {
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
      const srcStyleEntry = path.resolve(__dirname, `../packages/${pkgDir}/src/style.ts`);
      const srcStylesEntry = path.resolve(__dirname, `../packages/${pkgDir}/src/styles-entry.ts`);
      const srcCss = path.resolve(__dirname, `../packages/${pkgDir}/src/style.css`);
      const srcVeCss = path.resolve(__dirname, `../packages/${pkgDir}/src/styles.css.ts`);

      // For CSS @import, VE source cannot be parsed as CSS.
      if (importer?.endsWith('.css')) {
        return existsSync(srcCss) ? srcCss : `${EMPTY_PREFIX}${id}`;
      }

      const styleEntry = [srcStyleEntry, srcStylesEntry, srcCss, srcVeCss, srcIndex].find(
        (candidate) => existsSync(candidate),
      );

      if (!styleEntry) return null;
      if (styleEntry === srcCss) return srcCss;

      // For JS imports, route style.css to the real source module for VE compilation.
      return styleEntry;
    },
    load(id) {
      if (id.startsWith(EMPTY_PREFIX)) return '';
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
    apiProxyPlugin(),
    watchWorkspacePlugin(),
    workspaceCssPlugin(),
    vanillaExtractPlugin(),
    codeInspectorPlugin({ bundler: 'vite', hotKeys: ['altKey'] }),
    react(),
  ],
  server: {
    port: 5188,
    open: true,
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },

  define: {
    'process.env.IS_PREACT': '"false"',
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  optimizeDeps: {
    exclude: workspaceOptimizeDepsExcludes(),
    include: ['react-intersection-observer', 'react-photo-view', '@excalidraw/excalidraw'],
  },
  resolve: {
    alias: command === 'build' ? workspaceBuildStyleAliases() : workspacePackageAliases(),
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
