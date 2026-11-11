import type { CSSProperties, FC } from 'react';
import { memo, useId } from 'react';

import { getElementCenter } from '../model/bounds';
import { angleOf } from '../model/geometry';
import { resolveRichTextHeights } from '../model/richtext-layout';
import { hasShadow } from '../model/shadow';
import { SceneDarkContext } from './context';
import { ElementContent } from './elements';
import { ShadowFilter } from './shadow';
import type { BinaryFiles, ExcalidrawElement, ExcalidrawScene } from './types';

const SVG_PADDING = 32;

export interface SceneBounds {
  height: number;
  minX: number;
  minY: number;
  width: number;
}

export function computeSceneBounds(input: ExcalidrawElement[]): SceneBounds {
  const elements = resolveRichTextHeights(input);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of elements) {
    if (el.isDeleted) continue;
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, width: 100, height: 100 };
  return {
    minX: minX - SVG_PADDING,
    minY: minY - SVG_PADDING,
    width: maxX - minX + SVG_PADDING * 2,
    height: maxY - minY + SVG_PADDING * 2,
  };
}

export const DARK_SCENE_FILTER = 'invert(93%) hue-rotate(180deg)';

// Exact inverse of DARK_SCENE_FILTER, applied to embedded images so photos keep
// their colours while the drawing around them is inverted. CSS filters run in
// sRGB, so the SVG filter must too.
const CounterInvertFilter: FC<{ id: string }> = ({ id }) => (
  <filter colorInterpolationFilters="sRGB" id={id}>
    <feColorMatrix type="hueRotate" values="180" />
    <feColorMatrix
      type="matrix"
      values="-1.16279 0 0 0 1.081395 0 -1.16279 0 0 1.081395 0 0 -1.16279 0 1.081395 0 0 0 1 0"
    />
  </filter>
);

export type ElementPropsFn = (el: ExcalidrawElement) => Record<string, unknown> | undefined;

export interface SceneContentProps {
  dark?: boolean;
  elementProps?: ElementPropsFn;
  files?: BinaryFiles;
  hiddenIds?: ReadonlySet<string>;
  scene: ExcalidrawScene;
}

const isFrame = (el: ExcalidrawElement) => el.type === 'frame' || el.type === 'magicframe';

export const SceneContent: FC<SceneContentProps> = memo(
  ({ dark = false, elementProps, files, hiddenIds, scene }) => {
    const elements = resolveRichTextHeights(scene.elements.filter((el) => !el.isDeleted));
    const uid = useId().replaceAll(/[^\w-]/g, '');
    // One filter per scene: `url(#id)` resolves to the first match in the page, and
    // a match inside a hidden subtree may not render in every engine.
    const filterId = `rich-excalidraw-counter-invert-${uid}`;
    const frames = new Map(elements.filter(isFrame).map((f) => [f.id, f]));
    const usedFrames = new Set(
      elements.map((el) => el.frameId).filter((id): id is string => !!id && frames.has(id)),
    );
    const clipId = (frameId: string) =>
      `rich-excalidraw-frame-${uid}-${frameId.replaceAll(/[^\w-]/g, '')}`;
    const shadowId = `rich-excalidraw-shadow-${uid}`;
    const anyShadow = elements.some(hasShadow);
    const hasDefs = dark || usedFrames.size > 0 || anyShadow;

    return (
      <SceneDarkContext value={dark ? { filterId } : null}>
        {hasDefs && (
          <defs>
            {dark && <CounterInvertFilter id={filterId} />}
            {anyShadow && <ShadowFilter dark={dark} id={shadowId} />}
            {[...usedFrames].map((id) => {
              const f = frames.get(id)!;
              return (
                <clipPath id={clipId(id)} key={id}>
                  <rect height={f.height} width={f.width} x={f.x} y={f.y} />
                </clipPath>
              );
            })}
          </defs>
        )}
        {elements.map((el) => {
          if (hiddenIds?.has(el.id)) return null;
          const element = (
            <ElementGroup el={el} extra={elementProps?.(el)} files={files} key={el.id} />
          );
          const group = hasShadow(el) ? (
            <g filter={`url(#${shadowId})`} key={el.id}>
              {element}
            </g>
          ) : (
            element
          );
          if (el.frameId && usedFrames.has(el.frameId)) {
            return (
              <g clipPath={`url(#${clipId(el.frameId)})`} key={el.id}>
                {group}
              </g>
            );
          }
          return group;
        })}
      </SceneDarkContext>
    );
  },
);
SceneContent.displayName = 'SceneContent';

interface SceneProps extends SceneContentProps {
  className?: string;
  style?: CSSProperties;
  theme?: 'light' | 'dark';
}

export const Scene: FC<SceneProps> = ({ className, files, scene, style, theme = 'light' }) => {
  const elements = scene.elements.filter((el) => !el.isDeleted);
  const bounds = computeSceneBounds(elements);
  const isDark = theme === 'dark';

  return (
    <svg
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        ...(isDark ? { filter: DARK_SCENE_FILTER } : null),
        ...style,
      }}
    >
      <SceneContent dark={isDark} files={files ?? scene.files} scene={scene} />
    </svg>
  );
};

const ElementGroup: FC<{
  el: ExcalidrawElement;
  extra?: Record<string, unknown>;
  files?: BinaryFiles;
}> = ({ el, extra, files }) => {
  const angleDeg = (angleOf(el) * 180) / Math.PI;
  const [cx, cy] = getElementCenter(el);
  const transform = `translate(${el.x} ${el.y}) rotate(${angleDeg} ${cx - el.x} ${cy - el.y})`;

  return (
    <g
      data-cx={cx}
      data-cy={cy}
      data-id={el.id}
      data-type={el.type}
      opacity={el.opacity != null ? el.opacity / 100 : 1}
      transform={transform}
      {...extra}
    >
      <ElementContent el={el} files={files} />
    </g>
  );
};
