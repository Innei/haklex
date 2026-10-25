import type { FC, ReactNode } from 'react';

import type { FrameTheme } from '../../site/tokens';

export interface ComponentDemo {
  keyboard?: [keys: string, action: string][];
  note?: ReactNode;
  Preview: FC<{ theme: FrameTheme }>;
  stageClassName?: string;
  States?: FC;
  statesNote?: ReactNode;
}
