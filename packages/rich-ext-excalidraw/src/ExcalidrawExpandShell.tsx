import { X } from 'lucide-react';
import type { FC, ReactNode } from 'react';

import * as css from './styles.css';

export interface ExcalidrawExpandShellProps {
  children: ReactNode;
  dismiss: () => void;
  meta?: ReactNode;
  title?: ReactNode;
}

export const ExcalidrawExpandShell: FC<ExcalidrawExpandShellProps> = ({
  children,
  dismiss,
  meta = 'excalidraw',
  title = 'Whiteboard',
}) => (
  <>
    <div className={css.excalidrawDialogHeader}>
      <div className={css.excalidrawDialogHeaderTitle}>
        <span className={css.excalidrawDialogTitle}>{title}</span>
        {meta != null && <span className={css.excalidrawDialogMeta}>{meta}</span>}
      </div>
      <button className={css.excalidrawHeaderClose} type="button" onClick={dismiss}>
        <X size={18} />
      </button>
    </div>
    <div className={css.excalidrawDialogCanvas}>{children}</div>
  </>
);
