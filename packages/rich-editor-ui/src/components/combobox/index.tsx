import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { PortalThemeWrapper } from '@haklex/rich-style-token'
import type { ComponentProps, ReactNode } from 'react'

import * as css from './styles.css'

// -- Root --

export function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: ComponentProps<typeof ComboboxPrimitive.Root<Value, Multiple>>,
) {
  return <ComboboxPrimitive.Root {...props} />
}

// -- Input --

type ComboboxInputProps = ComponentProps<typeof ComboboxPrimitive.Input> & {
  className?: string
}

export function ComboboxInput({ className, ...props }: ComboboxInputProps) {
  return <ComboboxPrimitive.Input className={className} {...props} />
}

// -- Portal --

function ComboboxPortal({ children }: { children: ReactNode }) {
  return (
    <ComboboxPrimitive.Portal>
      <PortalThemeWrapper>{children}</PortalThemeWrapper>
    </ComboboxPrimitive.Portal>
  )
}

// -- Content (Portal + Positioner + Popup) --

type ComboboxContentProps = Omit<
  ComponentProps<typeof ComboboxPrimitive.Popup>,
  'render'
> & {
  align?: ComponentProps<typeof ComboboxPrimitive.Positioner>['align']
  alignOffset?: ComponentProps<
    typeof ComboboxPrimitive.Positioner
  >['alignOffset']
  side?: ComponentProps<typeof ComboboxPrimitive.Positioner>['side']
  sideOffset?: ComponentProps<typeof ComboboxPrimitive.Positioner>['sideOffset']
  className?: string
  children?: ReactNode
  positionMethod?: ComponentProps<
    typeof ComboboxPrimitive.Positioner
  >['positionMethod']
}

export function ComboboxContent({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  positionMethod = 'absolute',
  children,
  ...popupProps
}: ComboboxContentProps) {
  return (
    <ComboboxPortal>
      <ComboboxPrimitive.Positioner
        positionMethod={positionMethod}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        style={{ zIndex: 50 }}
      >
        <ComboboxPrimitive.Popup
          className={`${css.popup}${className ? ` ${className}` : ''}`}
          {...popupProps}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPortal>
  )
}

// -- List --

type ComboboxListProps = ComponentProps<typeof ComboboxPrimitive.List>

export function ComboboxList(props: ComboboxListProps) {
  return <ComboboxPrimitive.List {...props} />
}

// -- Item --

type ComboboxItemProps = ComponentProps<typeof ComboboxPrimitive.Item> & {
  className?: string
}

export function ComboboxItem({ className, ...props }: ComboboxItemProps) {
  return (
    <ComboboxPrimitive.Item
      className={`${css.item}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

// -- ItemIndicator --

type ComboboxItemIndicatorProps = ComponentProps<
  typeof ComboboxPrimitive.ItemIndicator
>

export function ComboboxItemIndicator(props: ComboboxItemIndicatorProps) {
  return <ComboboxPrimitive.ItemIndicator {...props} />
}

// -- Empty --

type ComboboxEmptyProps = ComponentProps<typeof ComboboxPrimitive.Empty> & {
  className?: string
}

export function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return (
    <ComboboxPrimitive.Empty
      className={`${css.empty}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

// -- Group --

type ComboboxGroupProps = ComponentProps<typeof ComboboxPrimitive.Group>

export function ComboboxGroup(props: ComboboxGroupProps) {
  return <ComboboxPrimitive.Group {...props} />
}

// -- GroupLabel --

type ComboboxGroupLabelProps = ComponentProps<
  typeof ComboboxPrimitive.GroupLabel
>

export function ComboboxGroupLabel(props: ComboboxGroupLabelProps) {
  return <ComboboxPrimitive.GroupLabel {...props} />
}

// -- Type exports --

export type {
  ComboboxContentProps,
  ComboboxEmptyProps,
  ComboboxGroupLabelProps,
  ComboboxGroupProps,
  ComboboxInputProps,
  ComboboxItemIndicatorProps,
  ComboboxItemProps,
  ComboboxListProps,
}
