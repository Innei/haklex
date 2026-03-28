import * as CollapsiblePrimitive from '@base-ui/react/collapsible';
import { ChevronRight } from 'lucide-react';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { chevron, panel, trigger } from './styles.css';

export type CollapsibleProps = ComponentProps<typeof CollapsiblePrimitive.Root>;
export function Collapsible(props: CollapsibleProps): ReactElement {
  return <CollapsiblePrimitive.Root {...props} />;
}

export type CollapsibleTriggerProps = Omit<
  ComponentProps<typeof CollapsiblePrimitive.Trigger>,
  'render'
> & {
  children?: ReactNode;
  className?: string;
  hideChevron?: boolean;
};
export function CollapsibleTrigger({
  children,
  className,
  hideChevron,
  ...props
}: CollapsibleTriggerProps): ReactElement {
  return (
    <CollapsiblePrimitive.Trigger
      {...props}
      className={`${trigger}${className ? ` ${className}` : ''}`}
    >
      {!hideChevron && <ChevronRight className={chevron} />}
      {children}
    </CollapsiblePrimitive.Trigger>
  );
}

export type CollapsiblePanelProps = Omit<
  ComponentProps<typeof CollapsiblePrimitive.Panel>,
  'render'
> & {
  children?: ReactNode;
  className?: string;
};
export function CollapsiblePanel({
  children,
  className,
  ...props
}: CollapsiblePanelProps): ReactElement {
  return (
    <CollapsiblePrimitive.Panel
      {...props}
      className={`${panel}${className ? ` ${className}` : ''}`}
    >
      {children}
    </CollapsiblePrimitive.Panel>
  );
}
