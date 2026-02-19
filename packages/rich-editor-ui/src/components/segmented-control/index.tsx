'use client'

import type { KeyboardEvent, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import * as css from './styles.css'

export interface SegmentedControlItem<T extends string = string> {
  value: T
  label: ReactNode
  disabled?: boolean
}

export interface SegmentedControlProps<T extends string = string> {
  items: SegmentedControlItem<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  fullWidth?: boolean
  className?: string
}

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  size = 'sm',
  fullWidth = false,
  className,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemElementsRef = useRef<Map<T, HTMLButtonElement>>(new Map())
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [isReady, setIsReady] = useState(false)

  const updateIndicator = useCallback(() => {
    const container = containerRef.current
    const activeEl = itemElementsRef.current.get(value)
    if (!container || !activeEl) return

    const containerRect = container.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()

    setIndicator({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    })
    setIsReady(true)
  }, [value])

  useEffect(() => {
    updateIndicator()
  }, [updateIndicator])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      updateIndicator()
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [updateIndicator])

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabledItems = items.filter((item) => !item.disabled)
    const currentIndex = enabledItems.findIndex((item) => item.value === value)
    let nextIndex = currentIndex

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault()
        nextIndex = (currentIndex + 1) % enabledItems.length
        break
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault()
        nextIndex =
          (currentIndex - 1 + enabledItems.length) % enabledItems.length
        break
      }
      case 'Home': {
        e.preventDefault()
        nextIndex = 0
        break
      }
      case 'End': {
        e.preventDefault()
        nextIndex = enabledItems.length - 1
        break
      }
    }

    if (nextIndex !== currentIndex) {
      const nextItem = enabledItems[nextIndex]
      onChange(nextItem.value)
      itemElementsRef.current.get(nextItem.value)?.focus()
    }
  }

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={`${css.container} ${css.sizeVariants[size]} ${fullWidth ? css.containerFullWidth : ''} ${className || ''}`.trim()}
    >
      <div
        className={`${css.indicator} ${!isReady ? css.indicatorHidden : ''}`.trim()}
        style={{
          left: indicator.left,
          width: indicator.width,
        }}
        aria-hidden="true"
      />

      {items.map((item) => {
        const isActive = item.value === value
        return (
          <button
            key={item.value}
            ref={(el) => {
              if (el) itemElementsRef.current.set(item.value, el)
              else itemElementsRef.current.delete(item.value)
            }}
            role="tab"
            type="button"
            aria-selected={isActive}
            data-active={isActive || undefined}
            tabIndex={isActive ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={`${css.item} ${css.itemPaddingVariants[size]} ${isActive ? css.itemActive : ''} ${item.disabled ? css.itemDisabled : ''} ${fullWidth ? css.itemFullWidth : ''}`.trim()}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
