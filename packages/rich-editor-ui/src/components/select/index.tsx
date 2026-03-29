import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { PortalThemeWrapper } from '../../index';
import {
  group,
  groupLabel,
  item,
  itemIndicator,
  popup,
  positioner,
  scrollButton,
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
        <ChevronDown size={16} />
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
  alignItemWithTrigger?: ComponentProps<typeof SelectPrimitive.Positioner>['alignItemWithTrigger'];
  children?: ReactNode;
  className?: string;
  side?: ComponentProps<typeof SelectPrimitive.Positioner>['side'];
  sideOffset?: ComponentProps<typeof SelectPrimitive.Positioner>['sideOffset'];
};
export function SelectContent({
  children,
  className,
  align = 'center',
  alignItemWithTrigger = true,
  side = 'bottom',
  sideOffset = 4,
  ...props
}: SelectContentProps): ReactElement {
  return (
    <SelectPrimitive.Portal>
      <PortalThemeWrapper>
        <SelectPrimitive.Positioner
          align={align}
          alignItemWithTrigger={alignItemWithTrigger}
          className={positioner}
          side={side}
          sideOffset={sideOffset}
        >
          <SelectPrimitive.Popup
            {...props}
            className={`${popup}${className ? ` ${className}` : ''}`}
          >
            <SelectPrimitive.ScrollUpArrow className={scrollButton}>
              <ChevronUp size={16} />
            </SelectPrimitive.ScrollUpArrow>
            <SelectPrimitive.List>{children}</SelectPrimitive.List>
            <SelectPrimitive.ScrollDownArrow className={scrollButton}>
              <ChevronDown size={16} />
            </SelectPrimitive.ScrollDownArrow>
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
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className={itemIndicator}>
        <Check size={16} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export type SelectGroupProps = ComponentProps<typeof SelectPrimitive.Group> & {
  className?: string;
};
export function SelectGroup({ className, ...props }: SelectGroupProps): ReactElement {
  return (
    <SelectPrimitive.Group {...props} className={`${group}${className ? ` ${className}` : ''}`} />
  );
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
