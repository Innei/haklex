import { ViewportGate } from '@haklex/rich-editor-ui';
import type { FC } from 'react';

import type { DynamicHostRendererProps } from './DynamicHostRenderer';
import { DynamicHostRenderer } from './DynamicHostRenderer';
import * as css from './styles.css';

export type DynamicSSRRendererProps = DynamicHostRendererProps;

const DynamicPlaceholder: FC<{ initialHeight: number }> = ({ initialHeight }) => (
  <div
    aria-label="Interactive component"
    className={`${css.root} ${css.semanticClassNames.root}`}
    style={{ minHeight: initialHeight }}
  >
    <div className={`${css.overlay} ${css.semanticClassNames.placeholder}`}>
      <span>Interactive component</span>
    </div>
  </div>
);

export const DynamicSSRRenderer: FC<DynamicSSRRendererProps> = (props) => {
  return (
    <ViewportGate fallback={<DynamicPlaceholder initialHeight={props.initialHeight} />}>
      <DynamicHostRenderer {...props} />
    </ViewportGate>
  );
};
