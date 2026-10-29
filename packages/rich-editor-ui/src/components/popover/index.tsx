import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { PortalThemeWrapper } from '@haklex/rich-style-token';
import type { chromeWidth } from '@haklex/rich-style-token/styles';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { getStrictContext } from '../../lib/get-strict-context';
import * as css from './styles.css';

// -- Context --

type PopoverContextType = {
  isOpen: boolean;
};

const [PopoverProvider, usePopover] = getStrictContext<PopoverContextType>('PopoverContext');

export { usePopover };

// -- Root --

type PopoverProps = ComponentProps<typeof PopoverPrimitive.Root>;

export function Popover(props: PopoverProps) {
  const [isOpen, setIsOpen] = useState(props?.defaultOpen ?? false);

  useEffect(() => {
    if (props.open !== undefined) setIsOpen(props.open);
  }, [props.open]);

  const handleOpenChange: PopoverProps['onOpenChange'] = (open, details) => {
    setIsOpen(open);
    props.onOpenChange?.(open, details);
  };

  return (
    <PopoverProvider value={{ isOpen }}>
      <PopoverPrimitive.Root {...props} onOpenChange={handleOpenChange} />
    </PopoverProvider>
  );
}

// -- Trigger --

type PopoverTriggerProps = ComponentProps<typeof PopoverPrimitive.Trigger>;

export function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger {...props} />;
}

// -- Portal --

type PopoverPortalProps = ComponentProps<typeof PopoverPrimitive.Portal>;

export function PopoverPortal({ children, ...props }: PopoverPortalProps) {
  return (
    <PopoverPrimitive.Portal {...props}>
      <PortalThemeWrapper>{children}</PortalThemeWrapper>
    </PopoverPrimitive.Portal>
  );
}

// -- Positioner --

type PopoverPositionerProps = ComponentProps<typeof PopoverPrimitive.Positioner>;

export function PopoverPositioner(props: PopoverPositionerProps) {
  return <PopoverPrimitive.Positioner {...props} />;
}

// -- Popup (panel) --

type PopoverPopupProps = Omit<ComponentProps<typeof PopoverPrimitive.Popup>, 'render'> & {
  className?: string;
  children?: ReactNode;
  /** Drops the panel padding so PopoverHeader / PopoverBody / PopoverFooter can reach the edges. */
  flush?: boolean;
  size?: keyof typeof chromeWidth;
};

export function PopoverPopup({ className, children, flush, size, ...props }: PopoverPopupProps) {
  const classes = [css.popup];
  if (size) classes.push(css.size[size]);
  if (flush) classes.push(css.flush);
  if (className) classes.push(className);
  return (
    <PopoverPrimitive.Popup className={classes.join(' ')} {...props}>
      {children}
    </PopoverPrimitive.Popup>
  );
}

// -- Panel (= Positioner + Popup convenience wrapper) --

type PopoverPanelProps = PopoverPopupProps & {
  align?: PopoverPositionerProps['align'];
  side?: PopoverPositionerProps['side'];
  sideOffset?: PopoverPositionerProps['sideOffset'];
};

export function PopoverPanel({
  align = 'center',
  side,
  sideOffset = 8,
  className,
  children,
  ...popupProps
}: PopoverPanelProps) {
  return (
    <PopoverPortal>
      <PopoverPositioner align={align} side={side} sideOffset={sideOffset}>
        <PopoverPopup className={className} {...popupProps}>
          {children}
        </PopoverPopup>
      </PopoverPositioner>
    </PopoverPortal>
  );
}

// -- Arrow --

type PopoverArrowProps = ComponentProps<typeof PopoverPrimitive.Arrow>;

export function PopoverArrow({ className, ...props }: PopoverArrowProps) {
  return (
    <PopoverPrimitive.Arrow
      className={`${css.arrow}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
}

// -- Close --

type PopoverCloseProps = ComponentProps<typeof PopoverPrimitive.Close>;

export function PopoverClose(props: PopoverCloseProps) {
  return <PopoverPrimitive.Close {...props} />;
}

// -- Title / Description --

type PopoverTitleProps = ComponentProps<typeof PopoverPrimitive.Title>;

export function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <PopoverPrimitive.Title
      className={`${css.title}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
}

type PopoverDescriptionProps = ComponentProps<typeof PopoverPrimitive.Description>;

export function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return (
    <PopoverPrimitive.Description
      className={`${css.description}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
}

type PopoverHeaderProps = {
  actions?: ReactNode;
  className?: string;
  icon?: ReactNode;
  title: ReactNode;
};

export function PopoverHeader({ actions, className, icon, title }: PopoverHeaderProps) {
  return (
    <div className={`${css.header}${className ? ` ${className}` : ''}`}>
      {icon && <span className={css.headerIcon}>{icon}</span>}
      <span className={css.headerTitle}>{title}</span>
      {actions && <span className={css.headerActions}>{actions}</span>}
    </div>
  );
}

type PopoverSectionProps = {
  children?: ReactNode;
  className?: string;
};

export function PopoverBody({ children, className }: PopoverSectionProps) {
  return <div className={`${css.body}${className ? ` ${className}` : ''}`}>{children}</div>;
}

type PopoverFooterProps = PopoverSectionProps & {
  hint?: ReactNode;
};

export function PopoverFooter({ children, className, hint }: PopoverFooterProps) {
  return (
    <div className={`${css.footer}${className ? ` ${className}` : ''}`}>
      {hint && <span className={css.footerHint}>{hint}</span>}
      {children}
    </div>
  );
}

export type {
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverDescriptionProps,
  PopoverFooterProps,
  PopoverHeaderProps,
  PopoverPanelProps,
  PopoverPopupProps,
  PopoverPortalProps,
  PopoverPositionerProps,
  PopoverProps,
  PopoverSectionProps,
  PopoverTitleProps,
  PopoverTriggerProps,
};
