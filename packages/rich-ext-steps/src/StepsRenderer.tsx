import { useOptionalNestedContentRenderer, useVariant } from '@haklex/rich-editor/static';
import type { FC } from 'react';

import * as styles from './styles.css';
import type { StepsRendererProps } from './types';

export const StepsRenderer: FC<StepsRendererProps> = ({ steps }) => {
  const renderNestedContent = useOptionalNestedContentRenderer();
  const variant = useVariant();

  if (steps.length === 0) return null;

  return (
    <ol className={`${styles.root} ${styles.semanticClassNames.root}`}>
      {steps.map((step, index) => (
        <li className={`${styles.item} ${styles.semanticClassNames.item}`} key={step.id}>
          <span
            aria-hidden="true"
            className={`${styles.marker} ${styles.semanticClassNames.marker}`}
          >
            {index + 1}
          </span>
          {step.title && (
            <div className={`${styles.title} ${styles.semanticClassNames.title}`}>{step.title}</div>
          )}
          {renderNestedContent && (
            <div className={`${styles.content} ${styles.semanticClassNames.content}`}>
              {renderNestedContent(step.content, variant)}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
};
