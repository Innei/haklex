import { ActionButton, TooltipContent, TooltipRoot, TooltipTrigger } from '@haklex/rich-editor-ui';
import type { ReactElement, ReactNode } from 'react';

interface LinkIconButtonProps {
  action?: string;
  children: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}

export function LinkIconButton({
  action,
  children,
  danger,
  disabled,
  label,
  onClick,
}: LinkIconButtonProps): ReactElement {
  return (
    <TooltipRoot>
      <TooltipTrigger
        render={
          <ActionButton
            icon
            aria-label={label}
            danger={danger}
            data-link-action={action}
            disabled={disabled}
            size="md"
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </TooltipRoot>
  );
}
