import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { getCommonBounds } from '../model/bounds';
import { richTextPlainText } from '../model/richtext';
import { resolveRichTextHeights } from '../model/richtext-layout';
import { SceneExportContext } from '../scene/context';
import { fontFamilyToCss, isHandFontFamily, SANS_FONT_STACK } from '../scene/fonts';
import { SceneContent } from '../scene/Scene';
import type { BinaryFiles, ExcalidrawElement, ExcalidrawScene } from '../scene/types';
import type { FontUsage } from './fonts';
import { embeddedFontCss, familiesOf, toDataUrl } from './fonts';

export interface ExportScene {
  elements: readonly ExcalidrawElement[];
  files?: BinaryFiles;
}

export interface ExportSvgOptions {
  background?: string | null;
  embedFonts?: boolean;
  handFontOverride?: string;
  padding?: number;
}

export interface RenderedSvg {
  height: number;
  svg: string;
  width: number;
}

const DEFAULT_PADDING = 16;
const EMPTY_SIZE = 100;

function fontUsage(elements: readonly ExcalidrawElement[], handFontOverride?: string): FontUsage {
  const families = new Set<string>();
  let text = '';
  for (const el of elements) {
    if (el.type === 'text') {
      const stack =
        handFontOverride && isHandFontFamily(el.fontFamily)
          ? handFontOverride
          : fontFamilyToCss(el.fontFamily);
      for (const family of familiesOf(stack)) families.add(family);
      text += el.text;
    } else if (el.type === 'richtext') {
      for (const family of familiesOf(SANS_FONT_STACK)) families.add(family);
      text += richTextPlainText((el as { content?: { root?: unknown } }).content?.root as never);
    }
  }
  return { families, text };
}

async function inlineFiles(files: BinaryFiles | undefined): Promise<BinaryFiles | undefined> {
  if (!files) return files;
  const entries = await Promise.all(
    Object.entries(files).map(async ([id, file]) => {
      if (!/^https?:/i.test(file.dataURL)) return [id, file] as const;
      try {
        return [id, { ...file, dataURL: await toDataUrl(file.dataURL) }] as const;
      } catch {
        return [id, file] as const;
      }
    }),
  );
  return Object.fromEntries(entries) as BinaryFiles;
}

export async function renderSvg(
  scene: ExportScene,
  options: ExportSvgOptions = {},
): Promise<RenderedSvg> {
  const { background = '#ffffff', embedFonts = true, handFontOverride } = options;
  const padding = options.padding ?? DEFAULT_PADDING;
  const elements = resolveRichTextHeights(scene.elements.filter((el) => !el.isDeleted));
  const [minX, minY, maxX, maxY] =
    elements.length > 0 ? getCommonBounds(elements) : [0, 0, EMPTY_SIZE, EMPTY_SIZE];
  const x = minX - padding;
  const y = minY - padding;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  const [fontCss, files] = await Promise.all([
    embedFonts ? embeddedFontCss(fontUsage(elements, handFontOverride)) : '',
    inlineFiles(scene.files),
  ]);

  const host = document.createElement('div');
  const root = createRoot(host);
  flushSync(() => {
    root.render(
      <svg
        height={height}
        viewBox={`${x} ${y} ${width} ${height}`}
        width={width}
        xmlns="http://www.w3.org/2000/svg"
      >
        {fontCss && <style>{fontCss}</style>}
        {background && (
          <rect
            data-export-background=""
            fill={background}
            height={height}
            width={width}
            x={x}
            y={y}
          />
        )}
        <SceneExportContext value>
          <SceneContent
            files={files}
            handFontOverride={handFontOverride}
            scene={{ elements, files } as unknown as ExcalidrawScene}
          />
        </SceneExportContext>
      </svg>,
    );
  });
  const svg = new XMLSerializer().serializeToString(host.firstElementChild!);
  root.unmount();
  return { height, svg, width };
}

export async function exportToSvg(scene: ExportScene, options?: ExportSvgOptions): Promise<string> {
  return (await renderSvg(scene, options)).svg;
}
