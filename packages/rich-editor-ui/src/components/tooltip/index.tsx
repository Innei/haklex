import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { PortalThemeWrapper } from '@haklex/rich-style-token';
import type { ComponentProps, ReactNode } from 'react';

import * as css from './styles.css';

// -- Provider (shared delay for multiple tooltips) --

type TooltipProviderProps = ComponentProps<typeof TooltipPrimitive.Provider>;

export function TooltipProvider(props: TooltipProviderProps) {
  return <TooltipPrimitive.Provider {...props} />;
}

// -- Root --

type TooltipRootProps = ComponentProps<typeof TooltipPrimitive.Root>;

export function TooltipRoot(props: TooltipRootProps) {
  return <TooltipPrimitive.Root {...props} />;
}

// -- Trigger --

type TooltipTriggerProps = ComponentProps<typeof TooltipPrimitive.Trigger>;

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger {...props} />;
}

// -- Portal --

type TooltipPortalProps = ComponentProps<typeof TooltipPrimitive.Portal>;

export function TooltipPortal({ children, ...props }: TooltipPortalProps) {
  return (
    <TooltipPrimitive.Portal {...props}>
      <PortalThemeWrapper>{children}</PortalThemeWrapper>
    </TooltipPrimitive.Portal>
  );
}

// -- Positioner --

type TooltipPositionerProps = ComponentProps<typeof TooltipPrimitive.Positioner>;

export function TooltipPositioner(props: TooltipPositionerProps) {
  return <TooltipPrimitive.Positioner {...props} />;
}

// -- Popup --

type TooltipPopupProps = Omit<ComponentProps<typeof TooltipPrimitive.Popup>, 'render'> & {
  className?: string;
  children?: ReactNode;
};

export function TooltipPopup({ className, children, ...props }: TooltipPopupProps) {
  return (
    <TooltipPrimitive.Popup
      className={`${css.popup}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </TooltipPrimitive.Popup>
  );
}

// -- Content (Positioner + Popup convenience) --

type TooltipContentProps = TooltipPopupProps & {
  side?: TooltipPositionerProps['side'];
  sideOffset?: TooltipPositionerProps['sideOffset'];
  align?: TooltipPositionerProps['align'];
};

export function TooltipContent({
  side = 'top',
  sideOffset = 6,
  align = 'center',
  className,
  children,
  ...popupProps
}: TooltipContentProps) {
  return (
    <TooltipPortal>
      <TooltipPositioner
        align={align}
        className={css.positioner}
        side={side}
        sideOffset={sideOffset}
      >
        <TooltipPopup className={className} {...popupProps}>
          {children}
        </TooltipPopup>
      </TooltipPositioner>
    </TooltipPortal>
  );
}

// -- Shared handle (single tooltip instance across multiple triggers) --

export const createTooltipHandle: typeof TooltipPrimitive.createHandle =
  TooltipPrimitive.createHandle;

export type {
  TooltipContentProps,
  TooltipPopupProps,
  TooltipPortalProps,
  TooltipPositionerProps,
  TooltipProviderProps,
  TooltipRootProps,
  TooltipTriggerProps,
};
