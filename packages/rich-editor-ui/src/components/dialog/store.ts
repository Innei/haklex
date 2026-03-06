import type { FC, ReactNode } from 'react'

export interface DialogStackItemProps {
  title?: ReactNode
  description?: ReactNode
  content: FC<{ dismiss: () => void }>
  className?: string
  portalClassName?: string
  theme?: 'light' | 'dark'
  showCloseButton?: boolean
  clickOutsideToDismiss?: boolean
  sheet?: boolean | 'auto'
}

export interface DialogStackItem extends DialogStackItemProps {
  id: string
  open: boolean
}

let stack: DialogStackItem[] = []
let idCounter = 0
const listeners = new Set<() => void>()

function emit() {
  for (const fn of listeners) fn()
}

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function getSnapshot(): DialogStackItem[] {
  return stack
}

export function presentDialog(props: DialogStackItemProps): () => void {
  const id = `dialog-${++idCounter}`
  stack = [...stack, { ...props, id, open: true }]
  emit()
  return () => dismissDialog(id)
}

export function removeDialog(id: string) {
  stack = stack.filter((item) => item.id !== id)
  emit()
}

export function dismissDialog(id: string) {
  stack = stack.map((item) =>
    item.id === id ? { ...item, open: false } : item,
  )
  emit()
}

export function dismissTopDialog() {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].open) {
      dismissDialog(stack[i].id)
      return
    }
  }
}

export function dismissAllDialogs() {
  stack = stack.map((item) => ({ ...item, open: false }))
  emit()
}
