import type { FC } from 'react';
import { use, useId } from 'react';

import { SceneDarkContext } from './context';
import { fontFamilyToCss } from './fonts';
import { freedrawOutline } from './freedraw';
import { RichTextBody } from './richtext/RichTextBody';
import {
  curve,
  diamond,
  drawableToOpSets,
  ellipse,
  getCornerRadius,
  linearPath,
  path,
  rectangle,
  roughOptionsForElement,
  roundedRectPath,
} from './rough';
import { SvgRender } from './svg-element';
import type {
  BinaryFiles,
  EllipseElement,
  ExcalidrawElement,
  FreedrawElement,
  ImageElement,
  LinearElement,
  RectangleElement,
  TextElement,
} from './types';

export const ElementContent: FC<{ el: ExcalidrawElement; files?: BinaryFiles }> = ({
  el,
  files,
}) => {
  switch (el.type) {
    case 'rectangle': {
      return <RectangleRender el={el} />;
    }
    case 'ellipse': {
      return <EllipseRender el={el} />;
    }
    case 'diamond': {
      return <DiamondRender el={el} />;
    }
    case 'line':
    case 'arrow': {
      return <LinearRender el={el} />;
    }
    case 'freedraw': {
      return <FreedrawRender el={el} />;
    }
    case 'text': {
      return <TextRender el={el} />;
    }
    case 'image': {
      return <ImageRender el={el} files={files} />;
    }
    case 'svg': {
      return <SvgRender el={el} />;
    }
    case 'richtext': {
      return (
        <>
          <RectangleRender el={el as unknown as RectangleElement} />
          <RichTextBody el={el} />
        </>
      );
    }
    case 'frame':
    case 'magicframe': {
      return <FrameRender el={el} />;
    }
    case 'embeddable':
    case 'iframe': {
      return <EmbedPlaceholder el={el} />;
    }
    default: {
      return null;
    }
  }
};

const EVENODD_SHAPES = new Set(['curve', 'polygon']);

const PathSet: FC<{
  drawable: ReturnType<typeof rectangle>;
  fillColor?: string;
  strokeColor: string;
  strokeWidth: number;
}> = ({ drawable, fillColor, strokeColor, strokeWidth }) => {
  const opSets = drawableToOpSets(drawable);
  return (
    <>
      {opSets.map((set, i) => {
        if (set.type === 'path') {
          return (
            <path
              d={set.d}
              fill="none"
              key={i}
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
          );
        }
        if (set.type === 'fillPath') {
          return (
            <path
              d={set.d}
              fill={fillColor || 'none'}
              fillRule={EVENODD_SHAPES.has(drawable.shape) ? 'evenodd' : undefined}
              key={i}
              stroke="none"
            />
          );
        }
        // fillSketch — hachure lines drawn as strokes in fill color
        return (
          <path
            d={set.d}
            fill="none"
            key={i}
            stroke={fillColor || strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={drawable.options.fillWeight ?? strokeWidth / 2}
          />
        );
      })}
    </>
  );
};

const RectangleRender: FC<{ el: RectangleElement }> = ({ el }) => {
  const radius = getCornerRadius(el);
  const opts = roughOptionsForElement(el);
  const drawable =
    radius > 0 ? path(roundedRectPath(el.width, el.height, radius), opts) : rectangle(el);
  return (
    <PathSet
      drawable={drawable}
      fillColor={el.backgroundColor !== 'transparent' ? el.backgroundColor : undefined}
      strokeColor={el.strokeColor}
      strokeWidth={el.strokeWidth}
    />
  );
};

const EllipseRender: FC<{ el: EllipseElement }> = ({ el }) => {
  const drawable = ellipse(el);
  return (
    <PathSet
      drawable={drawable}
      fillColor={el.backgroundColor !== 'transparent' ? el.backgroundColor : undefined}
      strokeColor={el.strokeColor}
      strokeWidth={el.strokeWidth}
    />
  );
};

const DiamondRender: FC<{ el: ExcalidrawElement & { type: 'diamond' } }> = ({ el }) => {
  const drawable = diamond(el);
  return (
    <PathSet
      drawable={drawable}
      fillColor={el.backgroundColor !== 'transparent' ? el.backgroundColor : undefined}
      strokeColor={el.strokeColor}
      strokeWidth={el.strokeWidth}
    />
  );
};

const ARROWHEAD_LENGTH = 18;

function arrowheadAngle(
  points: Array<[number, number]>,
  end: 'start' | 'end',
): {
  angle: number;
  x: number;
  y: number;
} {
  if (points.length < 2) return { x: 0, y: 0, angle: 0 };
  const idx = end === 'end' ? points.length - 1 : 0;
  const next = end === 'end' ? points.length - 2 : 1;
  const [x, y] = points[idx];
  const [px, py] = points[next];
  return { x, y, angle: Math.atan2(y - py, x - px) };
}

const Arrowhead: FC<{
  angle: number;
  color: string;
  shape: NonNullable<LinearElement['endArrowhead']>;
  strokeWidth: number;
  x: number;
  y: number;
}> = ({ angle, color, shape, strokeWidth, x, y }) => {
  if (!shape) return null;
  if (shape === 'arrow' || shape === 'triangle' || shape === 'triangle_outline') {
    const len = ARROWHEAD_LENGTH;
    const a1 = angle + Math.PI - Math.PI / 7;
    const a2 = angle + Math.PI + Math.PI / 7;
    const x1 = x + Math.cos(a1) * len;
    const y1 = y + Math.sin(a1) * len;
    const x2 = x + Math.cos(a2) * len;
    const y2 = y + Math.sin(a2) * len;
    if (shape === 'arrow') {
      return (
        <g>
          <line
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            x1={x}
            x2={x1}
            y1={y}
            y2={y1}
          />
          <line
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            x1={x}
            x2={x2}
            y1={y}
            y2={y2}
          />
        </g>
      );
    }
    const fill = shape === 'triangle' ? color : 'none';
    return (
      <polygon
        fill={fill}
        points={`${x},${y} ${x1},${y1} ${x2},${y2}`}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    );
  }
  if (shape === 'dot' || shape === 'circle' || shape === 'circle_outline') {
    const r = ARROWHEAD_LENGTH / 3;
    return (
      <circle
        cx={x}
        cy={y}
        fill={shape === 'circle_outline' ? 'none' : color}
        r={r}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    );
  }
  if (shape === 'bar') {
    const len = ARROWHEAD_LENGTH / 1.5;
    const perp = angle + Math.PI / 2;
    return (
      <line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        x1={x + Math.cos(perp) * len}
        x2={x - Math.cos(perp) * len}
        y1={y + Math.sin(perp) * len}
        y2={y - Math.sin(perp) * len}
      />
    );
  }
  return null;
};

const LinearRender: FC<{ el: LinearElement }> = ({ el }) => {
  const points =
    el.points && el.points.length > 0
      ? el.points
      : [[0, 0] as [number, number], [el.width, el.height] as [number, number]];
  const isCurved = el.roundness?.type === 2;
  const opts = roughOptionsForElement(el, {
    fill: undefined,
    fillStyle: undefined,
  });
  const drawable = isCurved && points.length > 2 ? curve(points, opts) : linearPath(points, opts);
  const startHead = el.startArrowhead;
  const endHead = el.type === 'arrow' ? (el.endArrowhead ?? 'arrow') : el.endArrowhead;

  const startInfo = startHead ? arrowheadAngle(points, 'start') : null;
  const endInfo = endHead ? arrowheadAngle(points, 'end') : null;

  return (
    <>
      <PathSet drawable={drawable} strokeColor={el.strokeColor} strokeWidth={el.strokeWidth} />
      {startHead && startInfo && (
        <Arrowhead
          angle={startInfo.angle + Math.PI}
          color={el.strokeColor}
          shape={startHead}
          strokeWidth={el.strokeWidth}
          x={startInfo.x}
          y={startInfo.y}
        />
      )}
      {endHead && endInfo && (
        <Arrowhead
          angle={endInfo.angle}
          color={el.strokeColor}
          shape={endHead}
          strokeWidth={el.strokeWidth}
          x={endInfo.x}
          y={endInfo.y}
        />
      )}
    </>
  );
};

const FreedrawRender: FC<{ el: FreedrawElement }> = ({ el }) => {
  if (!el.points || el.points.length === 0) return null;
  if (el.points.length === 1) {
    const [x, y] = el.points[0];
    return <circle cx={x} cy={y} fill={el.strokeColor} r={el.strokeWidth} />;
  }
  return <path d={freedrawOutline(el)} fill={el.strokeColor} stroke="none" />;
};

const DEFAULT_LINE_HEIGHT = 1.25;

const TextRender: FC<{ el: TextElement }> = ({ el }) => {
  const lineHeight = el.lineHeight ?? DEFAULT_LINE_HEIGHT;
  const lines = el.text.split('\n');
  const fontSize = el.fontSize;
  const family = fontFamilyToCss(el.fontFamily);
  const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
  const ax = el.textAlign === 'center' ? el.width / 2 : el.textAlign === 'right' ? el.width : 0;
  const dy = fontSize * lineHeight;
  const baseline = fontSize * 0.82;

  return (
    <text
      dominantBaseline="alphabetic"
      fill={el.strokeColor}
      fontFamily={family}
      fontSize={fontSize}
      style={{ whiteSpace: 'pre' }}
      textAnchor={anchor}
      x={ax}
      y={baseline}
    >
      {lines.map((line, i) => (
        <tspan dy={i === 0 ? 0 : dy} key={i} x={ax}>
          {line || ' '}
        </tspan>
      ))}
    </text>
  );
};

const ImageRender: FC<{ el: ImageElement; files?: BinaryFiles }> = ({ el, files }) => {
  const darkFilter = use(SceneDarkContext);
  const clipId = `rich-excalidraw-crop-${useId().replaceAll(/[^\w-]/g, '')}`;
  const file = el.fileId && files ? files[el.fileId] : undefined;
  if (!file?.dataURL) {
    return <ImagePlaceholder el={el} label="Image" />;
  }
  const scaleX = el.scale?.[0] ?? 1;
  const scaleY = el.scale?.[1] ?? 1;
  const flip =
    scaleX !== 1 || scaleY !== 1
      ? `translate(${scaleX < 0 ? el.width : 0} ${scaleY < 0 ? el.height : 0}) scale(${scaleX} ${scaleY})`
      : undefined;
  const filter = darkFilter ? `url(#${darkFilter.filterId})` : undefined;
  const crop = el.crop;
  if (crop && crop.width > 0 && crop.height > 0) {
    const sx = el.width / crop.width;
    const sy = el.height / crop.height;
    const naturalWidth = crop.naturalWidth ?? crop.x + crop.width;
    const naturalHeight = crop.naturalHeight ?? crop.y + crop.height;
    return (
      <g transform={flip}>
        <clipPath id={clipId}>
          <rect height={el.height} width={el.width} />
        </clipPath>
        <image
          clipPath={`url(#${clipId})`}
          filter={filter}
          height={naturalHeight * sy}
          href={file.dataURL}
          preserveAspectRatio="none"
          width={naturalWidth * sx}
          x={-crop.x * sx}
          y={-crop.y * sy}
        />
      </g>
    );
  }
  return (
    <image
      filter={filter}
      height={el.height}
      href={file.dataURL}
      preserveAspectRatio="none"
      transform={flip}
      width={el.width}
    />
  );
};

const ImagePlaceholder: FC<{ el: ExcalidrawElement; label: string }> = ({ el, label }) => {
  return (
    <g>
      <rect
        fill="none"
        height={el.height}
        stroke={el.strokeColor || '#888'}
        strokeDasharray="4 4"
        strokeWidth={1}
        width={el.width}
      />
      <text
        dominantBaseline="middle"
        fill={el.strokeColor || '#888'}
        fontFamily={fontFamilyToCss(1)}
        fontSize={Math.min(16, el.height / 4)}
        textAnchor="middle"
        x={el.width / 2}
        y={el.height / 2}
      >
        {label}
      </text>
    </g>
  );
};

const FrameRender: FC<{
  el: ExcalidrawElement & { type: 'frame' | 'magicframe' };
}> = ({ el }) => {
  const name =
    (el as { name?: string | null }).name || (el.type === 'magicframe' ? 'Magic frame' : 'Frame');
  return (
    <>
      <rect
        fill="none"
        height={el.height}
        rx={4}
        stroke="#bbb"
        strokeWidth={1.5}
        width={el.width}
      />
      <text fill="#999" fontFamily={fontFamilyToCss(2)} fontSize={12} x={4} y={-4}>
        {name}
      </text>
    </>
  );
};

const EmbedPlaceholder: FC<{ el: ExcalidrawElement }> = ({ el }) => (
  <ImagePlaceholder el={el} label="Embed" />
);
