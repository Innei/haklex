import { ActionButton, TooltipContent, TooltipRoot, TooltipTrigger } from '@haklex/rich-editor-ui';
import type { ReactElement, ReactNode } from 'react';

interface LinkIconButtonProps {
  children: ReactNode;
  danger?: boolean;
  label: string;
  onClick: () => void;
}

export function LinkIconButton({
  children,
  danger,
  label,
  onClick,
}: LinkIconButtonProps): ReactElement {
  return (
    <TooltipRoot>
      <TooltipTrigger
        render={
          <ActionButton icon aria-label={label} danger={danger} size="md" onClick={onClick} />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </TooltipRoot>
  );
}
