import type { SerializedEditorState } from 'lexical';

import { useNestedContentRenderer } from '../../context/NestedContentRendererContext';
import { gridClassNames, gridStyles } from '../../styles/grid.css';
import { clsx } from '../utils';

interface GridStaticDecoratorProps {
  cellStates: SerializedEditorState[];
  cols: number;
  gap: string;
}

export function GridStaticDecorator({ cols, gap, cellStates }: GridStaticDecoratorProps) {
  const renderContent = useNestedContentRenderer();

  return (
    <div
      className={clsx(gridClassNames.inner, gridStyles.inner)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
      }}
    >
      {cellStates.map((state, i) => (
        <div className={clsx(gridClassNames.cell, gridStyles.cell)} key={i}>
          {renderContent(state)}
        </div>
      ))}
    </div>
  );
}
