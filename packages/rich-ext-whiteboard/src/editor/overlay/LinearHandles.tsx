import type { FC } from 'react';

import { getLinearAbsolutePoints } from '../../model/bounds';
import * as css from '../editor.css';
import { getEditedLinear, getElbowSegmentHandles, getMidpoints } from '../linear-editor';
import type { WhiteboardStore } from '../store';
import { useStore } from '../store';
import { sceneToScreen } from '../viewport';

export const LinearHandles: FC<{ store: WhiteboardStore }> = ({ store }) => {
  const state = useStore(store, (s) => s);
  if (state.selectionBox || state.editingTextId || state.tool !== 'selection') return null;
  const el = getEditedLinear(state);
  if (!el) return null;
  const points = getLinearAbsolutePoints(el)
    .map((p, i, all) => ({
      i,
      p: sceneToScreen(p, state.viewport),
      end: i === 0 || i === all.length - 1,
    }))
    .filter(({ end }) => end || !el.elbowed);
  const mids = el.elbowed ? [] : getMidpoints(el).map((p) => sceneToScreen(p, state.viewport));
  const segments = el.elbowed
    ? getElbowSegmentHandles(el).map((h) => ({
        ...h,
        point: sceneToScreen(h.point, state.viewport),
      }))
    : [];
  return (
    <g data-linear-handles>
      {mids.map(([x, y], i) => (
        <circle
          cx={x}
          cy={y}
          data-midpoint={i}
          fill={css.accentStroke}
          fillOpacity={0.25}
          key={`m${i}`}
          r={3.5}
        />
      ))}
      {segments.map(({ index, point: [x, y] }) => (
        <rect
          data-segment={index}
          fill="#fff"
          height={6}
          key={`s${index}`}
          rx={3}
          stroke={css.accentStroke}
          strokeWidth={1.5}
          width={12}
          x={x - 6}
          y={y - 3}
        />
      ))}
      {points.map(({ i, p: [x, y] }) => (
        <circle
          cx={x}
          cy={y}
          data-point={i}
          fill={state.selectedPointIndex === i ? css.accentStroke : '#fff'}
          key={`p${i}`}
          r={5}
          stroke={css.accentStroke}
          strokeWidth={1.5}
        />
      ))}
    </g>
  );
};
