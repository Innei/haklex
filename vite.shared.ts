import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { UserConfig } from 'vite'

export interface SharedViteOptions {
  entry?: string | Record<string, string>
  vanillaExtract?: boolean
  esbuild?: { jsx: string; jsxImportSource: string }
}

const BASE_EXTERNALS = ['react', 'react-dom', 'react/jsx-runtime']

export async function createViteConfig(
  options: SharedViteOptions = {},
): Promise<UserConfig> {
  const { entry = 'src/index.ts', vanillaExtract = true, esbuild } = options

  const dts = (await import('vite-plugin-dts')).default
  const plugins: UserConfig['plugins'] = []

  if (vanillaExtract) {
    const { vanillaExtractPlugin } =
      await import('@vanilla-extract/vite-plugin')
    plugins.push(vanillaExtractPlugin())
  }

  plugins.push(
    dts({ entryRoot: 'src', outDir: 'dist', tsconfigPath: './tsconfig.json' }),
  )

  const cwd = process.cwd()
  const isMap = typeof entry !== 'string'
  const libEntry = isMap
    ? Object.fromEntries(
        Object.entries(entry).map(([k, v]) => [k, resolve(cwd, v)]),
      )
    : resolve(cwd, entry)

  const fileName = isMap
    ? (_: string, name: string) => `${name}.mjs`
    : () => 'index.mjs'

  const pkg = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf-8'))
  const depNames = new Set([
    ...BASE_EXTERNALS,
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ])

  const rollupExternal = (id: string) => {
    if (id[0] === '.' || id[0] === '/' || id[0] === '\0') return false
    if (depNames.has(id)) return true
    const slashIdx = id.indexOf('/')
    if (slashIdx > 0) {
      const pkgName =
        id[0] === '@'
          ? id.slice(0, id.indexOf('/', slashIdx + 1))
          : id.slice(0, slashIdx)
      return pkgName ? depNames.has(pkgName) : false
    }
    return false
  }

  return {
    plugins,
    ...(esbuild && { esbuild }),
    build: {
      lib: { entry: libEntry, formats: ['es'], fileName },
      rollupOptions: {
        external: rollupExternal,
        output: { preserveModules: false },
      },
      cssCodeSplit: false,
      minify: false,
      cssMinify: true,
      target: 'es2020',
    },
  }
}
