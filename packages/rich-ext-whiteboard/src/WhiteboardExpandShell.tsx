import { X } from 'lucide-react';
import type { FC, ReactNode } from 'react';

import * as css from './styles.css';

export interface WhiteboardExpandShellProps {
  children: ReactNode;
  dismiss: () => void;
  meta?: ReactNode;
  title?: ReactNode;
}

export const WhiteboardExpandShell: FC<WhiteboardExpandShellProps> = ({
  children,
  dismiss,
  meta = 'excalidraw',
  title = 'Whiteboard',
}) => (
  <>
    <div className={css.whiteboardDialogHeader}>
      <div className={css.whiteboardDialogHeaderTitle}>
        <span className={css.whiteboardDialogTitle}>{title}</span>
        {meta != null && <span className={css.whiteboardDialogMeta}>{meta}</span>}
      </div>
      <button className={css.whiteboardHeaderClose} type="button" onClick={dismiss}>
        <X size={18} />
      </button>
    </div>
    <div className={css.whiteboardDialogCanvas}>{children}</div>
  </>
);
