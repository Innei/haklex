// @vitest-environment happy-dom
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import * as editor from '../src/editor-entry';
import * as scene from '../src/scene-entry';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const IMPORT =
  /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function resolveLocal(from: string, spec: string): string | null {
  const base = path.resolve(path.dirname(from), spec);
  for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function walk(entry: string) {
  const files = new Set<string>();
  const packages = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (files.has(file)) continue;
    files.add(file);
    for (const match of readFileSync(file, 'utf8').matchAll(IMPORT)) {
      const spec = match[1] ?? match[2];
      if (!spec.startsWith('.')) {
        packages.add(spec);
        continue;
      }
      const next = resolveLocal(file, spec);
      if (next) queue.push(next);
    }
  }
  return { files: [...files].map((f) => path.relative(SRC, f)), packages: [...packages] };
}

describe('editor entry', () => {
  it('exposes what a host needs to embed the editor', () => {
    const names = [
      'WhiteboardEditor',
      'createWhiteboardStore',
      'useStore',
      'applyStyle',
      'getApplicableProps',
      'getCommonValue',
      'bringForward',
      'bringToFront',
      'sendBackward',
      'sendToBack',
      'duplicateSelection',
      'deleteSelection',
      'groupSelection',
      'ungroupSelection',
      'selectAll',
      'copySelection',
      'cutSelection',
      'pasteFromClipboard',
      'placeCard',
      'setTool',
      'focusElements',
      'screenToScene',
      'sceneToScreen',
      'zoomAt',
      'fitToContent',
      'getSelectedElements',
      'convertSkeletons',
      'reconcileElements',
      'orderByIndex',
      'restoreElements',
      'FontLoadError',
      'getCommonBounds',
      'getElementBounds',
      'exportToSvg',
      'exportToBlob',
      'setFontFamilyStack',
      'CHROME_ATTR',
    ] as const;
    for (const name of names) expect(editor[name], name).toBeDefined();
  });
});

describe('scene entry', () => {
  it('exposes the read-only renderer and export', () => {
    const names = [
      'Scene',
      'SceneContent',
      'InteractiveScene',
      'computeSceneBounds',
      'DARK_SCENE_FILTER',
      'fontFamilyToCss',
      'setFontFamilyStack',
      'WHITEBOARD_FONT_STACK',
      'restoreElements',
      'FontLoadError',
      'getCommonBounds',
      'orderByIndex',
      'viewportFor',
      'exportToSvg',
      'exportToBlob',
    ] as const;
    for (const name of names) expect(scene[name], name).toBeDefined();
  });

  it('never reaches the editor or the editor UI kit', () => {
    const { files, packages } = walk(path.join(SRC, 'scene-entry.ts'));
    expect(files.filter((f) => f.startsWith('editor/'))).toEqual([]);
    expect(packages.filter((name) => name.startsWith('@haklex/rich-editor'))).toEqual([]);
    expect(packages.filter((name) => name.startsWith('@lexical') || name === 'lexical')).toEqual(
      [],
    );
  });
});

describe('package manifest', () => {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

  it('maps both entries for the workspace and for the published package', () => {
    expect(pkg.exports['./editor']).toBe('./src/editor-entry.ts');
    expect(pkg.exports['./scene']).toBe('./src/scene-entry.ts');
    expect(pkg.publishConfig.exports['./editor']).toEqual({
      import: './dist/editor.mjs',
      types: './dist/editor-entry.d.ts',
    });
    expect(pkg.publishConfig.exports['./scene']).toEqual({
      import: './dist/scene.mjs',
      types: './dist/scene-entry.d.ts',
    });
  });
});
