import type { SerializedEditorState } from 'lexical';

import { useNestedContentRenderer } from '../../context/NestedContentRendererContext';

interface GridStaticDecoratorProps {
  cellStates: SerializedEditorState[];
  cols: number;
  gap: string;
}

export function GridStaticDecorator({ cols, gap, cellStates }: GridStaticDecoratorProps) {
  const renderContent = useNestedContentRenderer();

  return (
    <div
      className="rich-grid-inner"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
      }}
    >
      {cellStates.map((state, i) => (
        <div className="rich-grid-cell" key={i}>
          {renderContent(state)}
        </div>
      ))}
    </div>
  );
}
