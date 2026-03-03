import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '@haklex/rich-editor-ui'
import { ChevronDown } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

import * as css from './styles.css'
import type { ToolbarTooltipHandle, ToolbarTooltipPayload } from './types'

export interface ToolbarDropdownItem {
  label: string
  icon?: ReactNode
  active?: boolean
  style?: CSSProperties
  onSelect: () => void
}

export interface ToolbarDropdownProps {
  label: string
  title: string
  items: ToolbarDropdownItem[]
  triggerWidth?: number
  tooltipHandle?: ToolbarTooltipHandle
}

export function ToolbarDropdown({
  label,
  title,
  items,
  triggerWidth,
  tooltipHandle,
}: ToolbarDropdownProps) {
  const triggerStyle = triggerWidth ? { width: triggerWidth } : undefined

  const trigger = (
    <DropdownMenuTrigger
      className={css.toolbarDropdownTrigger}
      style={triggerStyle}
      render={<button type="button" />}
    />
  )

  const triggerContent = (
    <>
      {label}
      <span className={css.toolbarDropdownTriggerChevron}>
        <ChevronDown size={12} />
      </span>
    </>
  )

  const menu = (
    <DropdownMenuContent sideOffset={4}>
      {items.map((item) => (
        <DropdownMenuItem
          key={item.label}
          className={item.active ? css.toolbarDropdownItemActive : undefined}
          style={item.style}
          onClick={item.onSelect}
        >
          {item.icon && (
            <span
              style={{
                marginRight: 8,
                display: 'inline-flex',
                transform: 'scale(0.8)',
                transformOrigin: 'left center',
              }}
            >
              {item.icon}
            </span>
          )}
          {item.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  )

  if (tooltipHandle) {
    return (
      <DropdownMenu>
        <TooltipTrigger
          handle={tooltipHandle as any}
          payload={{ title } satisfies ToolbarTooltipPayload}
          render={trigger}
        >
          {triggerContent}
        </TooltipTrigger>
        {menu}
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <TooltipRoot>
        <TooltipTrigger render={trigger}>{triggerContent}</TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          {title}
        </TooltipContent>
      </TooltipRoot>
      {menu}
    </DropdownMenu>
  )
}
