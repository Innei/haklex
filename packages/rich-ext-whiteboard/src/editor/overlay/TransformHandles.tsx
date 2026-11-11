import type { FC } from 'react';

import * as css from '../editor.css';
import type { WhiteboardStore } from '../store';
import { useStore } from '../store';
import { getActiveHandles } from '../tools/transform-gesture';
import { sceneToScreen } from '../viewport';

const HANDLE_RADIUS = 4.5;
const ROTATION_RADIUS = 5;

export const TransformHandles: FC<{ store: WhiteboardStore }> = ({ store }) => {
  const state = useStore(store, (s) => s);
  if (state.selectionBox || state.editingTextId) return null;
  const handles = getActiveHandles(state);
  if (!handles) return null;
  return (
    <g data-transform-handles>
      {Object.entries(handles).map(([name, point]) => {
        const [x, y] = sceneToScreen(point, state.viewport);
        return (
          <circle
            cx={x}
            cy={y}
            data-handle={name}
            fill="#fff"
            key={name}
            r={name === 'rotation' ? ROTATION_RADIUS : HANDLE_RADIUS}
            stroke={css.accentStroke}
            strokeWidth={1.5}
          />
        );
      })}
    </g>
  );
};
