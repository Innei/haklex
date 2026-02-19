import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { PortalThemeProvider } from '@shiro/rich-style-token'
import { X } from 'lucide-react'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import {
  createElement,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from 'react'

import type { DialogStackItem } from './store'
import { dismissDialog, getSnapshot, removeDialog, subscribe } from './store'
import * as css from './styles.css'

const CloseIcon: FC = () => <X />

const PortalWrapper: FC<{ className?: string; children: ReactNode }> = ({
  className,
  children,
}) => {
  if (!className) return <>{children}</>
  return <div className={className}>{children}</div>
}

const DialogStackEntry: FC<{
  item: DialogStackItem
  index: number
}> = ({ item, index }) => {
  const {
    id,
    open,
    title,
    description,
    content,
    className,
    portalClassName,
    showCloseButton = true,
    clickOutsideToDismiss = true,
  } = item

  const dismiss = useCallback(() => dismissDialog(id), [id])

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        removeDialog(id)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [open, id])

  const zIndex = 50 + index

  return (
    <DialogPrimitive.Root
      open={open}
      disablePointerDismissal={!clickOutsideToDismiss}
      onOpenChange={(open) => {
        if (!open) dismiss()
      }}
    >
      <DialogPrimitive.Portal>
        <PortalThemeProvider className={portalClassName ?? ''}>
          <PortalWrapper className={portalClassName}>
            <DialogPrimitive.Backdrop
              className={css.backdrop}
              style={{ zIndex }}
            />
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
          </PortalWrapper>
        </PortalThemeProvider>
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
