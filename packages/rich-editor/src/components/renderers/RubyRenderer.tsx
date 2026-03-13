import type { ReactNode } from 'react';

import { semanticClassNames, sharedStyles } from '../../styles/shared.css';
import { clsx } from '../utils';

export interface RubyRendererProps {
  children?: ReactNode;
  reading: string;
}

export function RubyRenderer({ reading, children }: RubyRendererProps) {
  if (!reading) {
    return <>{children}</>;
  }

  return (
    <ruby className={clsx(semanticClassNames.ruby, sharedStyles.ruby)}>
      {children}
      <rt className={clsx(semanticClassNames.rubyRt, sharedStyles.rubyRt)}>{reading}</rt>
    </ruby>
  );
}
