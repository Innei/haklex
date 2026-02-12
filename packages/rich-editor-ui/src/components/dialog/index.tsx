import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { AnimatePresence, motion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { getStrictContext } from '../../lib/get-strict-context'
import * as css from './styles.css'

// -- Context --

type DialogContextType = {
  isOpen: boolean
}

const [DialogProvider, useDialog] =
  getStrictContext<DialogContextType>('DialogContext')

export { useDialog }

// -- Dialog Root --

type DialogProps = ComponentProps<typeof DialogPrimitive.Root>

export function Dialog(props: DialogProps) {
  const [isOpen, setIsOpen] = useState(props?.defaultOpen ?? false)

  useEffect(() => {
    if (props.open !== undefined) setIsOpen(props.open)
  }, [props.open])

  const handleOpenChange: DialogProps['onOpenChange'] = (open, details) => {
    setIsOpen(open)
    props.onOpenChange?.(open, details)
  }

  return (
    <DialogProvider value={{ isOpen }}>
      <DialogPrimitive.Root {...props} onOpenChange={handleOpenChange} />
    </DialogProvider>
  )
}

// -- Trigger --

type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger>

export function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger {...props} />
}

// -- Portal + AnimatePresence --

type DialogPortalProps = Omit<
  ComponentProps<typeof DialogPrimitive.Portal>,
  'keepMounted'
>

export function DialogPortal(props: DialogPortalProps) {
  const { isOpen } = useDialog()
  return (
    <AnimatePresence>
      {isOpen && <DialogPrimitive.Portal keepMounted {...props} />}
    </AnimatePresence>
  )
}

// -- Backdrop --

type DialogBackdropProps = Omit<
  ComponentProps<typeof DialogPrimitive.Backdrop>,
  'render'
>

export function DialogBackdrop({ className, ...props }: DialogBackdropProps) {
  return (
    <DialogPrimitive.Backdrop
      render={
        <motion.div
          key="dialog-backdrop"
          className={`${css.backdrop}${className ? ` ${className}` : ''}`}
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
      }
      {...props}
    />
  )
}

// -- Popup --

type DialogFlipDirection = 'top' | 'bottom' | 'left' | 'right'

type DialogPopupProps = Omit<
  ComponentProps<typeof DialogPrimitive.Popup>,
  'render'
> & {
  from?: DialogFlipDirection
  showCloseButton?: boolean
  className?: string
  children?: ReactNode
}

export function DialogPopup({
  from = 'top',
  showCloseButton = true,
  className,
  children,
  ...props
}: DialogPopupProps) {
  const initialRotation =
    from === 'bottom' || from === 'left' ? '20deg' : '-20deg'
  const isVertical = from === 'top' || from === 'bottom'
  const rotateAxis = isVertical ? 'rotateX' : 'rotateY'

  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPrimitive.Popup
        render={
          <motion.div
            key="dialog-popup"
            className={`${css.popup}${className ? ` ${className}` : ''}`}
            initial={{
              opacity: 0,
              filter: 'blur(4px)',
              transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
              x: '-50%',
              y: '-50%',
            }}
            animate={{
              opacity: 1,
              filter: 'blur(0px)',
              transform: `perspective(500px) ${rotateAxis}(0deg) scale(1)`,
              x: '-50%',
              y: '-50%',
            }}
            exit={{
              opacity: 0,
              filter: 'blur(4px)',
              transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
              x: '-50%',
              y: '-50%',
            }}
            transition={{ type: 'spring', stiffness: 150, damping: 25 }}
          />
        }
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className={css.closeButton}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
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

type DialogHeaderProps = ComponentProps<'div'>

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      className={`${css.header}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

type DialogFooterProps = ComponentProps<'div'>

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
  DialogFlipDirection,
  DialogFooterProps,
  DialogHeaderProps,
  DialogPopupProps,
  DialogPortalProps,
  DialogProps,
  DialogTitleProps,
  DialogTriggerProps,
}
