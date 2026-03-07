import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { PortalThemeWrapper } from '@haklex/rich-style-token'
import { X } from 'lucide-react'
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react'

import * as css from './styles.css'

// -- Dialog Root --

type DialogProps = ComponentProps<typeof DialogPrimitive.Root>

export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root {...props} />
}

// -- Trigger --

type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger>

export function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger {...props} />
}

// -- Portal --

type DialogPortalProps = ComponentProps<typeof DialogPrimitive.Portal>

export function DialogPortal({ children, ...props }: DialogPortalProps) {
  return (
    <DialogPrimitive.Portal {...props}>
      <PortalThemeWrapper>{children}</PortalThemeWrapper>
    </DialogPrimitive.Portal>
  )
}

// -- Backdrop --

type DialogBackdropProps = ComponentProps<typeof DialogPrimitive.Backdrop>

export function DialogBackdrop({ className, ...props }: DialogBackdropProps) {
  return (
    <DialogPrimitive.Backdrop
      className={`${css.backdrop}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

// -- Popup --

type DialogPopupProps = ComponentProps<typeof DialogPrimitive.Popup> & {
  showCloseButton?: boolean
  className?: string
  children?: ReactNode
}

export function DialogPopup({
  showCloseButton = true,
  className,
  children,
  ...props
}: DialogPopupProps) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPrimitive.Popup
        className={`${css.popup}${className ? ` ${className}` : ''}`}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className={css.closeButton}>
            <X />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

// -- Close --

type DialogCloseProps = ComponentProps<typeof DialogPrimitive.Close>

export function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close {...props} />
}

// -- Header / Footer / Title / Description --

type DialogHeaderProps = HTMLAttributes<HTMLDivElement>

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      className={`${css.header}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

type DialogFooterProps = HTMLAttributes<HTMLDivElement>

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      className={`${css.footer}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={`${css.title}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description>

export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      className={`${css.description}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

export type {
  DialogBackdropProps,
  DialogCloseProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogPopupProps,
  DialogPortalProps,
  DialogProps,
  DialogTitleProps,
  DialogTriggerProps,
}
