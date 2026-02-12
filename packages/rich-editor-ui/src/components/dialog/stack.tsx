import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { AnimatePresence, motion } from 'motion/react'
import type { FC, PropsWithChildren } from 'react'
import { createElement, useCallback, useSyncExternalStore } from 'react'

import type { DialogStackItem } from './store'
import { dismissDialog, getSnapshot, subscribe } from './store'
import * as css from './styles.css'

const CloseIcon: FC = () => (
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
)

const DialogStackEntry: FC<{
  item: DialogStackItem
  index: number
  isTop: boolean
}> = ({ item, index }) => {
  const {
    id,
    title,
    description,
    content,
    className,
    from = 'top',
    showCloseButton = true,
  } = item

  const dismiss = useCallback(() => dismissDialog(id), [id])

  const initialRotation =
    from === 'bottom' || from === 'left' ? '20deg' : '-20deg'
  const isVertical = from === 'top' || from === 'bottom'
  const rotateAxis = isVertical ? 'rotateX' : 'rotateY'
  const zIndex = 50 + index

  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) dismiss()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          render={
            <motion.div
              key={`backdrop-${id}`}
              className={css.backdrop}
              style={{ zIndex }}
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            />
          }
        />
        <DialogPrimitive.Popup
          render={
            <motion.div
              key={`popup-${id}`}
              className={`${css.popup}${className ? ` ${className}` : ''}`}
              style={{ zIndex: zIndex + 1 }}
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
        >
          {(title || description) && (
            <div className={css.header}>
              {title && (
                <DialogPrimitive.Title className={css.title}>
                  {title}
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description className={css.description}>
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
          )}
          {createElement(content, { dismiss })}
          {showCloseButton && (
            <DialogPrimitive.Close className={css.closeButton}>
              <CloseIcon />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export const DialogStackProvider: FC<PropsWithChildren> = ({ children }) => {
  const stack = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return (
    <>
      {children}
      <AnimatePresence>
        {stack.map((item, index) => (
          <DialogStackEntry
            key={item.id}
            item={item}
            index={index}
            isTop={index === stack.length - 1}
          />
        ))}
      </AnimatePresence>
    </>
  )
}
