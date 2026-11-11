import type { FC } from 'react';

import { getCommonBounds, getElementAbsoluteCorners, isLinear } from '../../model/bounds';
import type { Point } from '../../model/geometry';
import type { ExcalidrawElement } from '../../scene/types';
import * as css from '../editor.css';
import { getSelectedElements } from '../selection-utils';
import type { WhiteboardStore } from '../store';
import { useStore } from '../store';
import { sceneToScreen } from '../viewport';
import { LinearHandles } from './LinearHandles';
import { TransformHandles } from './TransformHandles';

export const SELECTION_PADDING = 8;

function outline(el: ExcalidrawElement): Point[] {
  if (isLinear(el)) {
    const [minX, minY, maxX, maxY] = getCommonBounds([el]);
    return [
      [minX, minY],
      [maxX, minY],
      [maxX, maxY],
      [minX, maxY],
    ];
  }
  return getElementAbsoluteCorners(el);
}

const toPoints = (points: Point[]) => points.map(([x, y]) => `${x},${y}`).join(' ');

export const SelectionOverlay: FC<{ store: WhiteboardStore }> = ({ store }) => {
  const state = useStore(store, (s) => s);
  const { viewport, selectionBox } = state;
  const selected = getSelectedElements(state).filter(
    (el) => !(el.type === 'text' && el.containerId),
  );

  const suggested = state.suggestedBindingId
    ? state.elements.find((el) => el.id === state.suggestedBindingId && !el.isDeleted)
    : undefined;

  const box = selectionBox
    ? [
        sceneToScreen([selectionBox[0], selectionBox[1]], viewport),
        sceneToScreen([selectionBox[2], selectionBox[3]], viewport),
      ]
    : null;

  return (
    <svg data-whiteboard-overlay className={css.layer}>
      {suggested && (
        <polygon
          data-binding-highlight={suggested.id}
          fill="none"
          opacity={0.6}
          points={toPoints(outline(suggested).map((p) => sceneToScreen(p, viewport)))}
          stroke={css.accentStroke}
          strokeWidth={3}
        />
      )}
      {selected.length > 1 &&
        selected.map((el) => (
          <polygon
            fill="none"
            key={el.id}
            opacity={0.5}
            points={toPoints(outline(el).map((p) => sceneToScreen(p, viewport)))}
            stroke={css.accentStroke}
            strokeWidth={1}
          />
        ))}
      {selected.length === 1 && (
        <polygon
          data-selection-frame
          fill="none"
          points={toPoints(outline(selected[0]).map((p) => sceneToScreen(p, viewport)))}
          stroke={css.accentStroke}
          strokeWidth={1}
        />
      )}
      <TransformHandles store={store} />
      <LinearHandles store={store} />
      {box && (
        <rect
          data-selection-box
          fill={css.accentStroke}
          fillOpacity={0.08}
          height={box[1][1] - box[0][1]}
          stroke={css.accentStroke}
          strokeWidth={1}
          width={box[1][0] - box[0][0]}
          x={box[0][0]}
          y={box[0][1]}
        />
      )}
    </svg>
  );
};
