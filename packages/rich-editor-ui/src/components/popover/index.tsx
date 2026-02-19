import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { PortalThemeWrapper } from '@shiro/rich-style-token'
import type { ComponentProps, ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { getStrictContext } from '../../lib/get-strict-context'
import * as css from './styles.css'

// -- Context --

type PopoverContextType = {
  isOpen: boolean
}

const [PopoverProvider, usePopover] =
  getStrictContext<PopoverContextType>('PopoverContext')

export { usePopover }

// -- Root --

type PopoverProps = ComponentProps<typeof PopoverPrimitive.Root>

export function Popover(props: PopoverProps) {
  const [isOpen, setIsOpen] = useState(props?.defaultOpen ?? false)

  useEffect(() => {
    if (props.open !== undefined) setIsOpen(props.open)
  }, [props.open])

  const handleOpenChange: PopoverProps['onOpenChange'] = (open, details) => {
    setIsOpen(open)
    props.onOpenChange?.(open, details)
  }

  return (
    <PopoverProvider value={{ isOpen }}>
      <PopoverPrimitive.Root {...props} onOpenChange={handleOpenChange} />
    </PopoverProvider>
  )
}

// -- Trigger --

type PopoverTriggerProps = ComponentProps<typeof PopoverPrimitive.Trigger>

export function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger {...props} />
}

// -- Portal --

type PopoverPortalProps = ComponentProps<typeof PopoverPrimitive.Portal>

export function PopoverPortal({ children, ...props }: PopoverPortalProps) {
  return (
    <PopoverPrimitive.Portal {...props}>
      <PortalThemeWrapper>{children}</PortalThemeWrapper>
    </PopoverPrimitive.Portal>
  )
}

// -- Positioner --

type PopoverPositionerProps = ComponentProps<typeof PopoverPrimitive.Positioner>

export function PopoverPositioner(props: PopoverPositionerProps) {
  return <PopoverPrimitive.Positioner {...props} />
}

// -- Popup (panel) --

type PopoverPopupProps = Omit<
  ComponentProps<typeof PopoverPrimitive.Popup>,
  'render'
> & {
  className?: string
  children?: ReactNode
}

export function PopoverPopup({
  className,
  children,
  ...props
}: PopoverPopupProps) {
  return (
    <PopoverPrimitive.Popup
      className={`${css.popup}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </PopoverPrimitive.Popup>
  )
}

// -- Panel (= Positioner + Popup convenience wrapper) --

type PopoverPanelProps = PopoverPopupProps & {
  align?: PopoverPositionerProps['align']
  side?: PopoverPositionerProps['side']
  sideOffset?: PopoverPositionerProps['sideOffset']
}

export function PopoverPanel({
  align = 'center',
  side,
  sideOffset = 4,
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
  )
}

// -- Arrow --

type PopoverArrowProps = ComponentProps<typeof PopoverPrimitive.Arrow>

export function PopoverArrow({ className, ...props }: PopoverArrowProps) {
  return (
    <PopoverPrimitive.Arrow
      className={`${css.arrow}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

// -- Close --

type PopoverCloseProps = ComponentProps<typeof PopoverPrimitive.Close>

export function PopoverClose(props: PopoverCloseProps) {
  return <PopoverPrimitive.Close {...props} />
}

// -- Title / Description --

type PopoverTitleProps = ComponentProps<typeof PopoverPrimitive.Title>

export function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <PopoverPrimitive.Title
      className={`${css.title}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

type PopoverDescriptionProps = ComponentProps<
  typeof PopoverPrimitive.Description
>

export function PopoverDescription({
  className,
  ...props
}: PopoverDescriptionProps) {
  return (
    <PopoverPrimitive.Description
      className={`${css.description}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

export type {
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverDescriptionProps,
  PopoverPanelProps,
  PopoverPopupProps,
  PopoverPortalProps,
  PopoverPositionerProps,
  PopoverProps,
  PopoverTitleProps,
  PopoverTriggerProps,
}
