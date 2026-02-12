import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import type { ComponentProps, ReactNode } from 'react'

import * as css from './styles.css'

// -- Root --

type DropdownMenuProps = ComponentProps<typeof MenuPrimitive.Root>

export function DropdownMenu(props: DropdownMenuProps) {
  return <MenuPrimitive.Root {...props} />
}

// -- Trigger --

type DropdownMenuTriggerProps = ComponentProps<typeof MenuPrimitive.Trigger>

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <MenuPrimitive.Trigger {...props} />
}

// -- Content (Portal + Positioner + Popup) --

type DropdownMenuContentProps = Omit<
  ComponentProps<typeof MenuPrimitive.Popup>,
  'render'
> & {
  align?: ComponentProps<typeof MenuPrimitive.Positioner>['align']
  alignOffset?: ComponentProps<typeof MenuPrimitive.Positioner>['alignOffset']
  side?: ComponentProps<typeof MenuPrimitive.Positioner>['side']
  sideOffset?: ComponentProps<typeof MenuPrimitive.Positioner>['sideOffset']
  className?: string
  children?: ReactNode
}

export function DropdownMenuContent({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  children,
  ...popupProps
}: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          className={`${css.popup}${className ? ` ${className}` : ''}`}
          {...popupProps}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

// -- Group --

type DropdownMenuGroupProps = ComponentProps<typeof MenuPrimitive.Group>

export function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <MenuPrimitive.Group {...props} />
}

// -- GroupLabel --

type DropdownMenuLabelProps = ComponentProps<typeof MenuPrimitive.GroupLabel>

export function DropdownMenuLabel({
  className,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      className={`${css.label}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

// -- Item --

type DropdownMenuItemProps = ComponentProps<typeof MenuPrimitive.Item> & {
  className?: string
}

export function DropdownMenuItem({
  className,
  ...props
}: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      className={`${css.item}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

// -- Separator --

type DropdownMenuSeparatorProps = ComponentProps<typeof MenuPrimitive.Separator>

export function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <MenuPrimitive.Separator
      className={`${css.separator}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

// -- RadioGroup --

type DropdownMenuRadioGroupProps = ComponentProps<
  typeof MenuPrimitive.RadioGroup
>

export function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <MenuPrimitive.RadioGroup {...props} />
}

// -- RadioItem --

type DropdownMenuRadioItemProps = ComponentProps<
  typeof MenuPrimitive.RadioItem
> & {
  className?: string
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      className={`${css.item}${className ? ` ${className}` : ''}`}
      {...props}
    >
      <MenuPrimitive.RadioItemIndicator className={css.radioIndicator}>
        <CheckIcon />
      </MenuPrimitive.RadioItemIndicator>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

// -- CheckboxItem --

type DropdownMenuCheckboxItemProps = ComponentProps<
  typeof MenuPrimitive.CheckboxItem
> & {
  className?: string
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      className={`${css.item}${className ? ` ${className}` : ''}`}
      {...props}
    >
      <MenuPrimitive.CheckboxItemIndicator className={css.checkboxIndicator}>
        <CheckIcon />
      </MenuPrimitive.CheckboxItemIndicator>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

// -- CheckIcon (internal) --

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  )
}

// -- Type exports --

export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuTriggerProps,
}
