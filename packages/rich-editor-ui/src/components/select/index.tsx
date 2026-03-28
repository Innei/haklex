import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { PortalThemeWrapper } from '../../index';
import {
  groupLabel,
  item,
  itemIndicator,
  popup,
  positioner,
  separator,
  triggerButton,
  triggerIcon,
} from './styles.css';

export type SelectProps = ComponentProps<typeof SelectPrimitive.Root>;
export function Select(props: SelectProps): ReactElement {
  return <SelectPrimitive.Root {...props} />;
}

export type SelectTriggerProps = Omit<ComponentProps<typeof SelectPrimitive.Trigger>, 'render'> & {
  children?: ReactNode;
  className?: string;
};
export function SelectTrigger({ children, className, ...props }: SelectTriggerProps): ReactElement {
  return (
    <SelectPrimitive.Trigger
      {...props}
      className={`${triggerButton}${className ? ` ${className}` : ''}`}
    >
      {children}
      <SelectPrimitive.Icon className={triggerIcon}>
        <ChevronDown />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export type SelectValueProps = ComponentProps<typeof SelectPrimitive.Value>;
export function SelectValue(props: SelectValueProps): ReactElement {
  return <SelectPrimitive.Value {...props} />;
}

export type SelectContentProps = Omit<ComponentProps<typeof SelectPrimitive.Popup>, 'render'> & {
  align?: ComponentProps<typeof SelectPrimitive.Positioner>['align'];
  children?: ReactNode;
  className?: string;
  side?: ComponentProps<typeof SelectPrimitive.Positioner>['side'];
  sideOffset?: ComponentProps<typeof SelectPrimitive.Positioner>['sideOffset'];
};
export function SelectContent({
  children,
  className,
  align,
  side,
  sideOffset = 4,
  ...props
}: SelectContentProps): ReactElement {
  return (
    <SelectPrimitive.Portal>
      <PortalThemeWrapper>
        <SelectPrimitive.Positioner
          align={align}
          className={positioner}
          side={side}
          sideOffset={sideOffset}
        >
          <SelectPrimitive.Popup
            {...props}
            className={`${popup}${className ? ` ${className}` : ''}`}
          >
            {children}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </PortalThemeWrapper>
    </SelectPrimitive.Portal>
  );
}

export type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item> & {
  className?: string;
};
export function SelectItem({ className, children, ...props }: SelectItemProps): ReactElement {
  return (
    <SelectPrimitive.Item {...props} className={`${item}${className ? ` ${className}` : ''}`}>
      <SelectPrimitive.ItemIndicator className={itemIndicator}>
        <Check />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export type SelectGroupProps = ComponentProps<typeof SelectPrimitive.Group>;
export function SelectGroup(props: SelectGroupProps): ReactElement {
  return <SelectPrimitive.Group {...props} />;
}

export type SelectGroupLabelProps = ComponentProps<typeof SelectPrimitive.GroupLabel> & {
  className?: string;
};
export function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps): ReactElement {
  return (
    <SelectPrimitive.GroupLabel
      {...props}
      className={`${groupLabel}${className ? ` ${className}` : ''}`}
    />
  );
}

export type SelectSeparatorProps = { className?: string };
export function SelectSeparator({ className }: SelectSeparatorProps): ReactElement {
  return <div className={`${separator}${className ? ` ${className}` : ''}`} />;
}
