import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import react from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

// Dev-only: resolve workspace style entry to source instead of dist output.
// - Prefer src/style.css for plain CSS packages.
// - Fall back to src/styles.css.ts for VE packages when imported from JS.
// - If imported from CSS (@import), VE entries resolve to empty CSS.
function watchWorkspacePlugin(): Plugin {
  const packagesDir = resolve(__dirname, '..')
  const srcDirs: string[] = []
  for (const entry of readdirSync(packagesDir)) {
    if (entry.startsWith('rich-') && entry !== 'rich-editor-demo') {
      const srcDir = resolve(packagesDir, entry, 'src')
      if (existsSync(srcDir)) {
        srcDirs.push(srcDir)
      }
    }
  }

  return {
    name: 'watch-workspace-packages',
    apply: 'serve',
    configureServer(server) {
      for (const dir of srcDirs) {
        server.watcher.add(dir)
      }
      server.watcher.on('change', (file) => {
        if (!srcDirs.some((dir) => file.startsWith(dir))) return
        const mods = server.moduleGraph.getModulesByFile(file)
        if (mods?.size) {
          for (const mod of mods) server.moduleGraph.invalidateModule(mod)
        }
        server.hot.send({ type: 'full-reload' })
      })
    },
  }
}

function workspaceCssPlugin(): Plugin {
  const scopes = new Set(['@haklex', '@shiro'])
  const EMPTY_PREFIX = '\0empty-css:'
  const VE_PREFIX = '\0ve-css:'
  const RENDERER_STYLE_PREFIX = '\0renderer-style:'

  return {
    name: 'workspace-css-dev',
    apply: 'serve',
    enforce: 'pre',
    resolveId(id, importer) {
      // style-renderer.css: plain CSS @import breaks HMR for upstream VE packages.
      // Resolve to style-renderer.ts so each pkg/style.css gets proper VE resolution.
      const rendererStyleMatch = id.match(
        /^@([\w-]+)\/([\w-]+)\/style-renderer\.css$/,
      )
      if (rendererStyleMatch) {
        const scope = `@${rendererStyleMatch[1]}`
        const pkgDir = rendererStyleMatch[2]
        if (scopes.has(scope)) {
          const srcRendererTs = resolve(
            __dirname,
            `../${pkgDir}/src/style-renderer.ts`,
          )
          if (existsSync(srcRendererTs)) {
            return `${RENDERER_STYLE_PREFIX}${srcRendererTs}`
          }
        }
      }

      const m = id.match(/^@([\w-]+)\/([\w-]+)\/style\.css$/)
      if (!m) return null

      const scope = `@${m[1]}`
      if (!scopes.has(scope)) return null

      const pkgDir = m[2]
      const srcIndex = resolve(__dirname, `../${pkgDir}/src/index.ts`)
      const srcCss = resolve(__dirname, `../${pkgDir}/src/style.css`)
      const srcVeCss = resolve(__dirname, `../${pkgDir}/src/styles.css.ts`)

      if (existsSync(srcIndex)) {
        if (importer?.endsWith('.css')) {
          // Keep CSS graph valid; JS graph will import source modules and emit VE CSS.
          return existsSync(srcCss) ? srcCss : `${EMPTY_PREFIX}${id}`
        }
        return `${VE_PREFIX}${srcIndex}`
      }

      if (existsSync(srcCss)) {
        return srcCss
      }

      if (!existsSync(srcVeCss)) {
        return null
      }

      // For CSS @import, VE source cannot be parsed as CSS.
      if (importer?.endsWith('.css')) {
        return `${EMPTY_PREFIX}${id}`
      }

      // For JS imports, route style.css to VE source for real-time compilation.
      return `${VE_PREFIX}${srcVeCss}`
    },
    load(id) {
      if (id.startsWith(EMPTY_PREFIX)) return ''
      if (id.startsWith(VE_PREFIX)) {
        const sourcePath = id.slice(VE_PREFIX.length)
        return `import ${JSON.stringify(sourcePath)}`
      }
      if (id.startsWith(RENDERER_STYLE_PREFIX)) {
        const sourcePath = id.slice(RENDERER_STYLE_PREFIX.length)
        return `import ${JSON.stringify(sourcePath)}`
      }
    },
  }
}

export default defineConfig({
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
    include: [
      'react-intersection-observer',
      'react-photo-view',
      '@excalidraw/excalidraw',
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

      'react-intersection-observer',
      'react-photo-view',
      '@excalidraw/excalidraw',
    ],
  },
})
