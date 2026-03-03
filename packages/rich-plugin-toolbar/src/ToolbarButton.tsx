import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '@haklex/rich-editor-ui'
import type { ReactNode } from 'react'

import * as css from './styles.css'
import type { ToolbarTooltipHandle, ToolbarTooltipPayload } from './types'

export interface ToolbarButtonProps {
  icon: ReactNode
  title: string
  shortcut?: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  tooltipHandle?: ToolbarTooltipHandle
}

export function ToolbarButton({
  icon,
  title,
  shortcut,
  active,
  disabled,
  onClick,
  tooltipHandle,
}: ToolbarButtonProps) {
  const button = (
    <button
      type="button"
      className={`${css.toolbarButton}${active ? ` ${css.toolbarButtonActive}` : ''}`}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      aria-label={title}
      aria-pressed={active}
    />
  )

  if (tooltipHandle) {
    return (
      <TooltipTrigger
        handle={tooltipHandle as any}
        payload={{ title, shortcut } satisfies ToolbarTooltipPayload}
        render={button}
      >
        {icon}
      </TooltipTrigger>
    )
  }

  return (
    <TooltipRoot>
      <TooltipTrigger render={button}>{icon}</TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4}>
        {title}
        {shortcut && <span className={css.tooltipShortcut}>{shortcut}</span>}
      </TooltipContent>
    </TooltipRoot>
  )
}
