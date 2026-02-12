import type { FC, ReactNode } from 'react'

import type { DialogFlipDirection } from './index'

export interface DialogStackItemProps {
  title: ReactNode
  description?: ReactNode
  content: FC<{ dismiss: () => void }>
  className?: string
  from?: DialogFlipDirection
  showCloseButton?: boolean
  clickOutsideToDismiss?: boolean
}

export interface DialogStackItem extends DialogStackItemProps {
  id: string
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
  stack = [...stack, { ...props, id }]
  emit()
  return () => dismissDialog(id)
}

export function dismissDialog(id: string) {
  stack = stack.filter((item) => item.id !== id)
  emit()
}

export function dismissTopDialog() {
  stack = stack.slice(0, -1)
  emit()
}

export function dismissAllDialogs() {
  stack = []
  emit()
}
