import { ActionButton, TooltipContent, TooltipRoot, TooltipTrigger } from '@haklex/rich-editor-ui';
import type { ComponentProps, MouseEvent, ReactNode } from 'react';

type ToolbarButtonProps = Omit<ComponentProps<typeof ActionButton>, 'title'> & {
  children: ReactNode;
  label: string;
};

export const stopMouseDown = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

export function ToolbarButton({ children, label, icon = true, ...props }: ToolbarButtonProps) {
  return (
    <TooltipRoot>
      <TooltipTrigger
        render={
          <ActionButton
            aria-label={label}
            icon={icon}
            size="md"
            onMouseDown={stopMouseDown}
            {...props}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </TooltipRoot>
  );
}
