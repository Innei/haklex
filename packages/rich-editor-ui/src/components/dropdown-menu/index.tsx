import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { PortalThemeWrapper } from '@haklex/rich-style-token'
import { Check } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

import * as css from './styles.css'

// -- Root --

type DropdownMenuProps = ComponentProps<typeof MenuPrimitive.Root>

export function DropdownMenu(props: DropdownMenuProps) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

// -- Trigger --

type DropdownMenuTriggerProps = ComponentProps<typeof MenuPrimitive.Trigger>

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

// -- Portal --

function DropdownMenuPortal({ children }: { children: ReactNode }) {
  return (
    <MenuPrimitive.Portal>
      <PortalThemeWrapper>{children}</PortalThemeWrapper>
    </MenuPrimitive.Portal>
  )
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
  positionMethod?: ComponentProps<
    typeof MenuPrimitive.Positioner
  >['positionMethod']
}

export function DropdownMenuContent({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  positionMethod = 'absolute',
  children,
  ...popupProps
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPortal>
      <MenuPrimitive.Positioner
        className={css.positioner}
        data-slot="dropdown-menu-positioner"
        positionMethod={positionMethod}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        style={{ zIndex: 50 }}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={`${css.popup}${className ? ` ${className}` : ''}`}
          {...popupProps}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </DropdownMenuPortal>
  )
}

// -- Group --

type DropdownMenuGroupProps = ComponentProps<typeof MenuPrimitive.Group>

export function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

// -- GroupLabel --

type DropdownMenuLabelProps = ComponentProps<typeof MenuPrimitive.GroupLabel>

export function DropdownMenuLabel({
  className,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
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
      data-slot="dropdown-menu-item"
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
      data-slot="dropdown-menu-separator"
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
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
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
      data-slot="dropdown-menu-radio-item"
      className={`${css.item} ${css.radioItem}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
      <MenuPrimitive.RadioItemIndicator
        data-slot="dropdown-menu-radio-item-indicator"
        className={css.radioIndicator}
      >
        <CheckIcon />
      </MenuPrimitive.RadioItemIndicator>
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
      data-slot="dropdown-menu-checkbox-item"
      className={`${css.item} ${css.checkboxItem}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
      <MenuPrimitive.CheckboxItemIndicator
        data-slot="dropdown-menu-checkbox-item-indicator"
        className={css.checkboxIndicator}
      >
        <CheckIcon />
      </MenuPrimitive.CheckboxItemIndicator>
    </MenuPrimitive.CheckboxItem>
  )
}

// -- CheckIcon (internal) --

function CheckIcon() {
  return <Check size={16} />
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
