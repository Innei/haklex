import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import type { FC, PropsWithChildren } from 'react'
import { createElement, useCallback, useSyncExternalStore } from 'react'

import type { DialogStackItem } from './store'
import { dismissDialog, getSnapshot, subscribe } from './store'
import * as css from './styles.css'

const CloseIcon: FC = () => <X />

const DialogStackEntry: FC<{
  item: DialogStackItem
  index: number
}> = ({ item, index }) => {
  const {
    id,
    title,
    description,
    content,
    className,
    showCloseButton = true,
  } = item

  const dismiss = useCallback(() => dismissDialog(id), [id])
  const zIndex = 50 + index

  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) dismiss()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className={css.backdrop} style={{ zIndex }} />
        <DialogPrimitive.Popup
          className={`${css.popup}${className ? ` ${className}` : ''}`}
          style={{ zIndex: zIndex + 1 }}
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
      {stack.map((item, index) => (
        <DialogStackEntry key={item.id} item={item} index={index} />
      ))}
    </>
  )
}
